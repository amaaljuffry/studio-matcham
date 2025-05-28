/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// Removed unused imports from your previous state
// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

import {importCafesFromGooglePlaces} from "./importCafes"; // Import your new function

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export {importCafesFromGooglePlaces}; // Export your new function
