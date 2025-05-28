import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path'; // Import path module for better path handling

// Initialize Firebase Admin SDK
// Ensure your service account key path is correctly configured for local runs.
// If running from a service account JSON file:
// const serviceAccount = require('path/to/your/serviceAccountKey.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   storageBucket: 'matcham-new.appspot.com' // Important for storage operations
// });
// OR if using applicationDefault (e.g., from Google Cloud environment):
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: 'matcham-new.appspot.com' // Explicitly set storage bucket for local script
});


const db = admin.firestore();
const storage = admin.storage(); // Initialize Firebase Storage

// Path to your JSON file (using path.resolve for robustness)
const filePath = path.resolve('C:/Users/A/Desktop/DEV/PORTFOLIO/Matcham/studio-matcham/functions/src/matcha_cafes_filtered.json');
// Directory for local logo files
const LOGO_INPUT_DIR = path.resolve('C:/Users/A/PycharmProjects/Matcham-new/matcha_logos'); // Adjust this path if needed

// Read and parse JSON file
const rawData = fs.readFileSync(filePath, 'utf8');
const cafes = JSON.parse(rawData);

// Function to upload logo to Firebase Storage
async function uploadLogoToFirebaseStorage(localLogoPath: string, firebasePath: string): Promise<string | null> {
  try {
    const bucket = storage.bucket(); // Get the default bucket
    const file = bucket.file(firebasePath);

    await bucket.upload(localLogoPath, {
      public: true, // Make the file publicly accessible
      metadata: {
        contentType: 'image/png', // Adjust as per your image type
      },
    });

    console.log(`Uploaded ${localLogoPath} to gs://${bucket.name}/${firebasePath}`);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-09-2491', // Long expiry date for public URLs
    });
    console.log(`Public URL: ${url}`);
    return url;
  } catch (e) {
    console.error(`Error uploading logo ${localLogoPath}:`, e);
    return null;
  }
}

async function uploadCafes() {
  const batch = db.batch();
  const cafesCollection = db.collection('pendingCafes'); // Changed to pendingCafes

  let processedCount = 0;

  for (const cafe of cafes) {
    if (!cafe.geometry || !cafe.geometry.location || !cafe.place_id) { // Ensure place_id exists
      console.warn(`Skipping cafe due to missing essential data (geometry/location or place_id): ${cafe.name ?? 'Unnamed'}`);
      continue;
    }

    const firestoreDocId = cafe.place_id; // Use Google Place ID as the document ID
    const customReadableName = `${cafe.name} (${cafe.formatted_address.split(',').pop()?.trim() || 'Unknown State'})`; // Example: "Cafe Name (State)"

    let logoLink: string | null = null;
    const sanitizedCafeNameForFile = cafe.name.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
    const possibleLogoFilenames = [
        `${sanitizedCafeNameForFile}.png`,
        `${sanitizedCafeNameForFile}.jpg`,
        `${sanitizedCafeNameForFile}.jpeg`,
        `${cafe.place_id}.png`, // Try matching by Place ID as well
        `${cafe.place_id}.jpg`
    ];

    let foundLogoFile = null;
    for (const p_filename of possibleLogoFilenames) {
        const potentialLocalLogoPath = path.join(LOGO_INPUT_DIR, p_filename);
        if (fs.existsSync(potentialLocalLogoPath)) {
            foundLogoFile = potentialLocalLogoPath;
            break;
        }
    }

    if (foundLogoFile) {
        const fileExtension = path.extname(foundLogoFile);
        const firebaseLogoPath = `logos/${cafe.place_id}${fileExtension}`; // Unique path in Storage
        logoLink = await uploadLogoToFirebaseStorage(foundLogoFile, firebaseLogoPath);
    } else {
        console.log(`No local logo found for '${cafe.name}'. Searched in: ${LOGO_INPUT_DIR} for variants.`);
    }

    const cafeData = {
      googlePlaceId: cafe.place_id, // Store Google Place ID as a field
      name: cafe.name,
      address: cafe.formatted_address,
      latitude: cafe.geometry.location.lat,
      longitude: cafe.geometry.location.lng,
      rating: cafe.rating ?? 0,
      customReadableName: customReadableName, // Human-readable name
      logoLink: logoLink, // Link to Firebase Storage
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      approved: false, // Default to false for pending review
      // You might want to add other fields here based on your JSON structure
      // e.g., types: cafe.types || []
    };

    const docRef = cafesCollection.doc(firestoreDocId); // Set document ID to Google Place ID
    batch.set(docRef, cafeData, {merge: true}); // Use merge:true to update if exists
    processedCount++;
    console.log(`Added to batch: ${cafe.name} (ID: ${firestoreDocId})`);
  }

  if (processedCount > 0) {
    await batch.commit();
    console.log(`Successfully uploaded ${processedCount} cafes!`);
  } else {
    console.log("No valid cafes were processed for upload.");
  }
}

uploadCafes().catch(console.error);