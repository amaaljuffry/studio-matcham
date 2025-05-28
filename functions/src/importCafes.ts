import {onRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import axios, {isAxiosError} from "axios";

admin.initializeApp();
const db = admin.firestore();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "";

// Removed generateCafeId as we will now use Google Place ID as document ID

export const importCafesFromGooglePlaces = onRequest(async (req, res) => {
  const query = "matcha cafe in Malaysia";
  const url = "https://maps.googleapis.com/maps/api/place/textsearch/json?" +
              `query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;

  try {
    const response = await axios.get(url);
    const cafes = response.data.results;

    if (!cafes || cafes.length === 0) {
      console.log("No cafes found for the query.");
      res.status(200).send("No cafes found to import.");
      return;
    }

    const batch = db.batch();
    let importedCount = 0;

    for (const cafe of cafes) {
      if (!cafe.name || !cafe.formatted_address ||
          !cafe.geometry || !cafe.geometry.location || !cafe.place_id) { // Ensure place_id exists
        console.warn(
          `Skipping cafe with missing essential data (name, address, location, or place_id): ${cafe.name || "Unknown"}`
        );
        continue;
      }

      const firestoreDocId = cafe.place_id; // Use Google Place ID as the document ID
      const customReadableName = `${cafe.name} (${cafe.formatted_address.split(',').pop()?.trim() || 'Unknown State'})`; // Example: "Cafe Name (State)"

      const cafeData = {
        googlePlaceId: cafe.place_id, // Keep a field for the Google Place ID
        name: cafe.name,
        address: cafe.formatted_address,
        location: new admin.firestore.GeoPoint(
          cafe.geometry.location.lat,
          cafe.geometry.location.lng
        ),
        rating: cafe.rating ?? null,
        types: cafe.types || [],
        // The custom readable name for display in your app
        customReadableName: customReadableName,
        importedAt: admin.firestore.FieldValue.serverTimestamp(),
        approved: false, // For pending review
        // You might want to add placeholder for logoLink here too if you plan to extend this function
        logoLink: null,
      };

      // Set document with the Google Place ID
      const cafeRef = db.collection("pendingCafes").doc(firestoreDocId); // Targeting pendingCafes for new imports
      batch.set(cafeRef, cafeData, {merge: true});
      console.log(`Added to batch: ${cafe.name} (ID: ${firestoreDocId})`);
      importedCount++;
    }

    if (importedCount > 0) {
      await batch.commit();
      console.log(`Successfully imported ${importedCount} cafes.`);
      res.status(200).send(`Successfully imported ${importedCount} cafes.`);
    } else {
      console.log("No valid cafes were processed to import.");
      res.status(200).send("No valid cafes were processed to import.");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to import cafes:", errorMessage);
    if (isAxiosError(error)) {
      console.error("Axios error details:", error.response?.data);
    }
    res.status(500).send(
      "Failed to import cafes. Check server logs for details."
    );
  }
});