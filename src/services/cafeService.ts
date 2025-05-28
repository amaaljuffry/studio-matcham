// src/services/cafeService.ts

import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  query,
  orderBy,
  getDoc,
  where,
  updateDoc,
} from 'firebase/firestore';
import {
  ref as storageRef, // Renamed to avoid conflict with `ref` from Firebase SDK
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from '@/lib/firebase'; // Ensure these are correctly initialized Firebase client instances
import type { Cafe, HalalStatus } from '@/types'; // Assuming HalalStatus is an enum or string literal type

const CAFES_COLLECTION = 'cafes';
const PENDING_CAFES_COLLECTION = 'pendingCafes';
const REJECTED_CAFES_COLLECTION = 'rejectedCafes';

// Firestore collection references
export const cafesCollectionRef = collection(db, CAFES_COLLECTION);
export const pendingCafesCollectionRef = collection(db, PENDING_CAFES_COLLECTION);
export const rejectedCafesCollectionRef = collection(db, REJECTED_CAFES_COLLECTION);

/**
 * Helper to convert Firestore Timestamp to Date object if needed.
 * @param timestamp The Firestore Timestamp or undefined.
 * @returns A Date object or undefined.
 */
const toDate = (timestamp: Timestamp | undefined): Date | undefined => {
  return timestamp instanceof Timestamp ? timestamp.toDate() : undefined;
};

/**
 * Helper function to get the storage path from a Firebase Storage URL.
 * This is crucial for correctly deleting objects from storage.
 * @param url The Firebase Storage download URL.
 * @returns The path within the storage bucket (e.g., 'cafe_logos/cafeId_filename.jpg').
 */
function getStoragePathFromUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    // The path usually starts after '/o/' and is URL-encoded.
    // We need to decode it to get the actual path within the bucket.
    const path = parsedUrl.pathname.split('/o/')[1];
    if (path) {
      // Remove any query parameters (like ?alt=media...)
      const decodedPath = decodeURIComponent(path.split('?')[0]);
      return decodedPath;
    }
  } catch (error) {
    console.error("Failed to parse storage URL:", error);
  }
  return null;
}

/**
 * Helper function to delete a logo from Firebase Storage.
 * @param logoLink The URL link to the logo in Firebase Storage.
 */
async function deleteCafeLogo(logoLink: string): Promise<void> {
  if (!logoLink || typeof logoLink !== 'string' || logoLink.trim() === '') {
    console.warn("deleteCafeLogo: Invalid or empty logoLink provided. Skipping deletion.");
    return;
  }

  // Ensure storage instance exists and is properly configured
  if (!storage || !storage.app.options.storageBucket) {
    console.error('deleteCafeLogo: Firebase Storage is not initialized or storageBucket is missing in config. Cannot delete logo.');
    return;
  }

  try {
    const path = getStoragePathFromUrl(logoLink);
    if (!path) {
      console.warn(`deleteCafeLogo: Could not determine storage path from URL: ${logoLink}. Skipping deletion.`);
      return;
    }

    const logoStorageRefInstance = storageRef(storage, path);
    await deleteObject(logoStorageRefInstance);
    console.log(`deleteCafeLogo: Logo deleted from storage: ${logoLink}`);
  } catch (storageError: any) {
    // Check for "object-not-found" specifically to avoid alarming errors for already deleted files
    if (storageError.code === 'storage/object-not-found') {
      console.warn('deleteCafeLogo: Logo file not found in storage, no action needed.');
    } else {
      console.error(`deleteCafeLogo: Error deleting logo from storage:`, storageError);
    }
  }
}

/**
 * Fetches all approved and operational cafes from the main 'cafes' collection.
 * This function is used by the admin panel for approved cafes and is aliased for public use.
 * @returns A promise that resolves to an array of Cafe objects.
 */
export async function getApprovedCafes(): Promise<Cafe[]> {
  console.log('getApprovedCafes: Attempting to fetch all approved cafes from Firestore...');
  try {
    const q = query(
      cafesCollectionRef,
      where('businessStatus', '==', 'OPERATIONAL'), // Only fetch operational cafes
      orderBy('name') // Order alphabetically by name
    );
    const querySnapshot = await getDocs(q);
    const cafes = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        submittedAt: toDate(data.submittedAt),
        approvedAt: toDate(data.approvedAt),
        // Ensure other date fields are also converted if used client-side
        rejectedAt: toDate(data.rejectedAt),
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      } as Cafe;
    });
    console.log(
      "getApprovedCafes: Total cafes fetched from 'cafes' collection:",
      cafes.length
    );
    return cafes;
  } catch (error) {
    console.error('getApprovedCafes: Error fetching approved cafes: ', error);
    return []; // Return empty array on error
  }
}

/**
 * Fetches a single cafe by its ID from the 'cafes' collection.
 * @param cafeId The ID of the cafe to fetch.
 * @returns A promise that resolves to a Cafe object if found, otherwise null.
 */
export async function getCafeById(cafeId: string): Promise<Cafe | null> {
  console.log(`getCafeById: Attempting to fetch cafe with ID '${cafeId}' from 'cafes' collection...`);
  try {
    const docRef = doc(cafesCollectionRef, cafeId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log(`getCafeById: Found cafe '${cafeId}'.`);
      return {
        id: docSnap.id,
        ...data,
        submittedAt: toDate(data.submittedAt),
        approvedAt: toDate(data.approvedAt),
        rejectedAt: toDate(data.rejectedAt),
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      } as Cafe;
    } else {
      console.warn(`getCafeById: No cafe document found with ID: '${cafeId}'.`);
      return null;
    }
  } catch (error) {
    console.error(`getCafeById: Error fetching cafe '${cafeId}': `, error);
    return null;
  }
}

/**
 * **ALIAS FOR `getApprovedCafes`**
 * This export is provided for compatibility with components (like public-facing pages)
 * that expect a `getCafes` function.
 * @returns A promise that resolves to an array of Cafe objects.
 */
export const getCafes = getApprovedCafes;

/**
 * Fetches all pending cafe submissions from the 'pendingCafes' collection.
 * @returns A promise that resolves to an array of Cafe objects.
 */
export async function getPendingCafes(): Promise<Cafe[]> {
  console.log('getPendingCafes: Attempting to fetch pending cafes from Firestore...');
  try {
    const q = query(pendingCafesCollectionRef, orderBy('submittedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const cafes = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        submittedAt: toDate(data.submittedAt),
        // Add other date fields if they might be present in pending documents
        approvedAt: toDate(data.approvedAt),
        rejectedAt: toDate(data.rejectedAt),
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      } as Cafe;
    });
    console.log('getPendingCafes: Total pending cafes fetched:', cafes.length);
    return cafes;
  } catch (error) {
    console.error('getPendingCafes: Error fetching pending cafes: ', error);
    return [];
  }
}

/**
 * Fetches all rejected cafe submissions from the 'rejectedCafes' collection.
 * @returns A promise that resolves to an array of Cafe objects.
 */
export async function getRejectedCafes(): Promise<Cafe[]> {
  console.log('getRejectedCafes: Attempting to fetch rejected cafes from Firestore...');
  try {
    const q = query(rejectedCafesCollectionRef, orderBy('rejectedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const cafes = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        submittedAt: toDate(data.submittedAt),
        rejectedAt: toDate(data.rejectedAt),
        // Add other date fields if they might be present in rejected documents
        approvedAt: toDate(data.approvedAt),
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      } as Cafe;
    });
    console.log('getRejectedCafes: Total rejected cafes fetched:', cafes.length);
    return cafes;
  } catch (error) {
    console.error('getRejectedCafes: Error fetching rejected cafes: ', error);
    return [];
  }
}

/**
 * Generates a sanitized and unique ID for a cafe.
 * @param name The name of the cafe.
 * @returns A unique, URL-friendly ID string.
 */
export function generateCafeId(name: string): string {
  const sanitizedName = name
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w-]+/g, '') // Remove non-alphanumeric characters except hyphens
    .replace(/--+/g, '-'); // Replace multiple hyphens with a single one

  const randomSuffix = Math.random().toString(36).substring(2, 7);
  let cafeId = `${sanitizedName}-${randomSuffix}`;

  if (cafeId.length > 100) {
    cafeId = cafeId.substring(0, 100); // Truncate if too long for Firestore doc ID limits
  }
  return cafeId;
}

/**
 * Adds a new cafe submission to the 'pendingCafes' collection.
 * Includes logic for uploading a logo to Firebase Storage.
 * @param cafeId The generated unique ID for the cafe.
 * @param cafeData The cafe data to be stored.
 * @param logoFile Optional File object for the cafe's logo.
 * @returns A promise that resolves to the cafeId if successful, otherwise null.
 */
export async function addCafeToPending(
  cafeId: string,
  cafeData: Omit<
    Cafe,
    | 'id'
    | 'approvedAt'
    | 'submittedAt'
    | 'logoLink'
    | 'businessStatus'
    | 'rating'
    | 'userRatingTotal'
    | 'rejectedAt'
    | 'createdAt' // Exclude createdAt and updatedAt from initial save
    | 'updatedAt'
  >,
  logoFile?: File | null
): Promise<string | null> {
  let logoUrl: string | undefined = undefined;

  try {
    // Check if storage is initialized and configured before attempting upload
    if (!storage || !storage.app.options.storageBucket) {
      console.error(
        'addCafeToPending: Firebase Storage is not initialized or storageBucket is missing in config. Logo will not be uploaded.'
      );
      // Proceed without logo upload, or throw if logo is mandatory
      // For now, it proceeds, allowing submission without logo if storage is misconfigured
    }

    if (logoFile instanceof File && storage) { // Ensure logoFile is a File and storage is available
      const fileName = `${cafeId}_${Date.now()}_${logoFile.name}`;
      const filePath = `cafe_logos/${fileName}`;
      const logoStorageRefInstance = storageRef(storage, filePath);
      const uploadTask = uploadBytesResumable(logoStorageRefInstance, logoFile);
      await uploadTask;
      logoUrl = await getDownloadURL(uploadTask.snapshot.ref);
      console.log('addCafeToPending: Logo uploaded successfully. URL:', logoUrl);
    }

    const dataToSave: Partial<Cafe> = {
      ...cafeData,
      submittedAt: serverTimestamp() as Timestamp,
      businessStatus: 'PENDING_REVIEW',
      rating: 0, // Default rating for new submissions
      userRatingTotal: 0, // Default userRatingTotal for new submissions
      createdAt: serverTimestamp() as Timestamp, // Set creation timestamp
      updatedAt: serverTimestamp() as Timestamp, // Set update timestamp
    };

    if (logoUrl) {
      dataToSave.logoLink = logoUrl;
    }

    await setDoc(doc(pendingCafesCollectionRef, cafeId), dataToSave);
    console.log('addCafeToPending: Pending cafe document written with ID: ', cafeId);
    return cafeId;
  } catch (error) {
    console.error(
      'addCafeToPending: Error adding pending cafe document and/or uploading logo: ',
      error
    );
    // Attempt to delete orphaned logo only if a URL was generated and the error was not storage-related
    // This is client-side code, so storage error codes might be different than admin SDK.
    // Checking for typical storage error patterns.
    if (logoUrl && error && !(error instanceof Error && (error as any).code?.startsWith('storage/'))) {
      console.warn(
        'addCafeToPending: Firestore write failed after logo upload. Attempting to delete orphaned logo:',
        logoUrl
      );
      await deleteCafeLogo(logoUrl); // Use the helper to clean up
    }
    return null;
  }
}

/**
 * Approves a pending cafe by moving its data from 'pendingCafes' to 'cafes' collection.
 * Sets approvedAt timestamp and businessStatus.
 * @param pendingCafe The Cafe object from the pending submissions.
 * @returns A promise that resolves to true if successful, otherwise false.
 */
export async function approveCafe(pendingCafe: Cafe): Promise<boolean> {
  if (!pendingCafe.id) {
    console.error('approveCafe: Pending cafe has no ID, cannot approve.');
    return false;
  }
  console.log(`approveCafe: Attempting to approve cafe ${pendingCafe.id}`);
  try {
    const pendingDocRef = doc(db, PENDING_CAFES_COLLECTION, pendingCafe.id);
    const pendingDocSnap = await getDoc(pendingDocRef);

    if (!pendingDocSnap.exists()) {
      console.error(
        `approveCafe: Pending cafe with ID ${pendingCafe.id} not found for approval.`
      );
      return false;
    }

    const cafeData = pendingDocSnap.data() as Cafe;

    // Destructure to remove ID and timestamps that shouldn't be copied directly,
    // and extract other properties. Use spread for cleanliness.
    const { id, submittedAt, rejectedAt, ...baseCafeData } = cafeData;

    const approvedData: Omit<Cafe, 'id' | 'submittedAt' | 'rejectedAt'> = {
      ...baseCafeData,
      approvedAt: serverTimestamp() as Timestamp,
      businessStatus: 'OPERATIONAL',
      // Ensure rating/total are numbers, default to 0 if undefined/null
      rating: baseCafeData.rating ?? 0,
      userRatingTotal: baseCafeData.userRatingTotal ?? 0,
      halalStatus: (baseCafeData.halalStatus || 'Not Specified') as HalalStatus,
      updatedAt: serverTimestamp() as Timestamp, // Update timestamp on approval
    };

    await setDoc(doc(cafesCollectionRef, pendingCafe.id), approvedData); // Set the new approved document
    await deleteDoc(pendingDocRef); // Delete the pending document

    console.log(`approveCafe: Cafe ${pendingCafe.id} approved and moved to cafes collection.`);
    return true;
  } catch (error) {
    console.error('approveCafe: Error approving cafe: ', error);
    return false;
  }
}

/**
 * Rejects a pending cafe submission, moving it to 'rejectedCafes' and deleting it from 'pendingCafes'.
 * Also attempts to delete its associated logo from storage.
 * @param pendingCafeId The ID of the pending cafe to reject.
 * @param logoLink Optional URL link to the logo in Firebase Storage.
 * @returns A promise that resolves to true if successful, otherwise false.
 */
export async function rejectCafe(
  pendingCafeId: string,
  logoLink?: string
): Promise<boolean> {
  console.log(`rejectCafe: Attempting to reject cafe ${pendingCafeId}`);
  try {
    const pendingDocRef = doc(db, PENDING_CAFES_COLLECTION, pendingCafeId);
    const pendingDocSnap = await getDoc(pendingDocRef);

    let cafeData: Cafe | undefined;

    if (pendingDocSnap.exists()) {
      cafeData = pendingDocSnap.data() as Cafe;
      const rejectedData: Omit<Cafe, 'id'> = { // Removed 'id' from Omit here as it's not being explicitly removed from `cafeData`
        ...cafeData,
        businessStatus: 'REJECTED',
        rejectedAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp, // Update timestamp on rejection
      };
      await setDoc(doc(rejectedCafesCollectionRef, pendingCafeId), rejectedData);
      console.log(`rejectCafe: Cafe ${pendingCafeId} moved to rejectedCafes collection.`);
    } else {
      console.warn(`rejectCafe: Pending cafe with ID ${pendingCafeId} not found, proceeding with deletion.`);
    }

    await deleteDoc(pendingDocRef);
    console.log(`rejectCafe: Pending cafe ${pendingCafeId} deleted from pendingCafes.`);

    // Prefer logoLink from parameter, fallback to fetched data if available
    const finalLogoLink = logoLink || cafeData?.logoLink;
    if (finalLogoLink) {
      await deleteCafeLogo(finalLogoLink);
    }

    return true;
  } catch (error) {
    console.error('rejectCafe: Error rejecting cafe: ', error);
    return false;
  }
}

/**
 * Updates an existing cafe's details in the main 'cafes' collection.
 * Handles optional logo file upload/replacement/removal.
 * @param cafeId The ID of the cafe to update.
 * @param updatedData The partial cafe data to update.
 * @param newLogoFile The new logo file (File object) if uploaded, null if existing logo should be removed, undefined if no change.
 * @param originalLogoLink The original URL of the existing logo, needed for deletion if a new one is uploaded or logo is removed.
 * @returns A promise that resolves to true if successful, otherwise false.
 */
export async function updateCafe(
  cafeId: string,
  cafeData: Partial<Omit<Cafe,
    'id' | 'submittedAt' | 'approvedAt' | 'rating' | 'userRatingTotal' | 'rejectedAt' | 'logoLink' | 'createdAt' | 'updatedAt'
  >>, // Added createdAt and updatedAt to Omit
  newLogoFile: File | null | undefined,
  originalLogoLink: string | null | undefined
): Promise<boolean> {
  console.log(`updateCafe: Attempting to update cafe ${cafeId}`);
  try {
    const cafeDocRef = doc(db, CAFES_COLLECTION, cafeId);
    let logoLinkToSave: string | undefined | null = originalLogoLink; // Default to existing link

    if (newLogoFile instanceof File) {
      // 1. Upload new logo
      const fileName = `${cafeId}_${Date.now()}_${newLogoFile.name}`;
      const filePath = `cafe_logos/${fileName}`;
      const logoStorageRefInstance = storageRef(storage, filePath);
      const uploadTask = uploadBytesResumable(logoStorageRefInstance, newLogoFile);
      await uploadTask;
      logoLinkToSave = await getDownloadURL(uploadTask.snapshot.ref);
      console.log('updateCafe: New logo uploaded successfully. URL:', logoLinkToSave);

      // 2. Delete old logo if it exists and is different from the new one
      if (originalLogoLink && originalLogoLink !== logoLinkToSave) {
        await deleteCafeLogo(originalLogoLink);
      }
    } else if (newLogoFile === null && originalLogoLink) {
      // User explicitly requested to remove the logo, and there was an original logo
      await deleteCafeLogo(originalLogoLink);
      logoLinkToSave = null; // Set logoLink to null in Firestore
    }
    // If newLogoFile is undefined, logoLinkToSave remains originalLogoLink (no change to logo)

    // Prepare data for Firestore update
    const dataToUpdate: Record<string, any> = {
      ...cafeData,
      logoLink: logoLinkToSave, // Update logoLink field (will be null if removed)
      updatedAt: serverTimestamp(), // Always update 'updatedAt' timestamp
    };

    await updateDoc(cafeDocRef, dataToUpdate);
    console.log(`updateCafe: Cafe ${cafeId} updated successfully.`);
    return true;
  } catch (error) {
    console.error(`updateCafe: Error updating cafe ${cafeId}: `, error);
    return false;
  }
}

/**
 * Permanently deletes a cafe document from a specified collection (approved or rejected).
 * Also deletes its associated logo from storage.
 * @param cafeId The ID of the cafe to delete.
 * @param collectionRef The Firestore collection reference (e.g., cafesCollectionRef or rejectedCafesCollectionRef).
 * @param logoLink Optional URL link to the logo in Firebase Storage.
 * @returns A promise that resolves to true if successful, otherwise false.
 */
export async function deleteCafe(
  cafeId: string,
  collectionRef: typeof cafesCollectionRef | typeof rejectedCafesCollectionRef,
  logoLink?: string
): Promise<boolean> {
  console.log(`deleteCafe: Attempting to delete cafe ${cafeId} from ${collectionRef.id}.`);
  try {
    if (logoLink) {
      await deleteCafeLogo(logoLink);
    }

    await deleteDoc(doc(collectionRef, cafeId));
    console.log(`deleteCafe: Cafe ${cafeId} deleted from ${collectionRef.id}.`);
    return true;
  } catch (error) {
    console.error(`deleteCafe: Error deleting cafe ${cafeId} from ${collectionRef.id}: `, error);
    return false;
  }
}