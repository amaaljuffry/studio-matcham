// src/lib/firebaseAdmin.ts
import * as admin from 'firebase-admin';
import serviceAccount from './firebaseAdminConfig.json'; // Directly import the JSON config

// Add these console logs for debugging
console.log("--- Firebase Admin Init Debug ---");
console.log("FIREBASE_PROJECT_ID from JSON:", (serviceAccount as any).project_id);
console.log("FIREBASE_CLIENT_EMAIL from JSON:", (serviceAccount as any).client_email);
console.log("FIREBASE_PRIVATE_KEY from JSON loaded:", !!(serviceAccount as any).private_key); // Check if private_key exists
console.log("FIREBASE_STORAGE_BUCKET from .env:", process.env.FIREBASE_STORAGE_BUCKET ? "Loaded" : "MISSING");
console.log("admin.apps.length:", admin.apps.length);
console.log("---------------------------------");


if (!admin.apps.length) {
  try {
    admin.initializeApp({
      // Use the directly imported service account JSON for credentials
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      // Keep storageBucket from process.env if it's consistently defined there
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    if (!/already exists/iu.test(error.message)) {
      console.error('Firebase Admin initialization error:', error.message, error.stack);
      // Now, if it fails, it's NOT an .env parsing issue for the key.
      // It's either the JSON file itself (unlikely if direct from Firebase)
      // or `storageBucket` is missing, or a broader environment issue.
      if (!process.env.FIREBASE_STORAGE_BUCKET) console.error('  - Missing FIREBASE_STORAGE_BUCKET from .env');
    }
  }
} else {
    console.log('Firebase Admin SDK already initialized.');
}

const adminDb = admin.firestore();
const adminStorage = admin.storage();

export { adminDb, adminStorage };