
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp, Timestamp, query, orderBy } from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import type { Cafe } from '@/types';

const cafesCollectionRef = collection(db, 'cafes');
const pendingCafesCollectionRef = collection(db, 'pendingCafes');

// Helper function to generate a sanitized ID from cafe name + unique suffix
export function generateCafeId(name: string): string {
  const sanitizedName = name.toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w-]+/g, '') // Remove non-alphanumeric characters except hyphens
    .replace(/--+/g, '-'); // Replace multiple hyphens with a single one

  // Generate a short random string for uniqueness
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  let cafeId = `${sanitizedName}-${randomSuffix}`;
  
  // Truncate if too long (Firestore IDs have limits, though usually generous)
  if (cafeId.length > 100) {
    cafeId = cafeId.substring(0, 100);
  }
  return cafeId;
}


export async function getCafes(): Promise<Cafe[]> {
  try {
    const q = query(cafesCollectionRef, orderBy("name"));
    const querySnapshot = await getDocs(q);
    const cafes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt instanceof Timestamp ? doc.data().submittedAt.toDate() : undefined,
      approvedAt: doc.data().approvedAt instanceof Timestamp ? doc.data().approvedAt.toDate() : undefined,
    } as Cafe));
    return cafes;
  } catch (error) {
    console.error("Error fetching cafes: ", error);
    return [];
  }
}

export async function getPendingCafes(): Promise<Cafe[]> {
  try {
    const q = query(pendingCafesCollectionRef, orderBy("submittedAt", "desc"));
    const querySnapshot = await getDocs(q);
    const cafes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt instanceof Timestamp ? doc.data().submittedAt.toDate() : undefined,
    } as Cafe));
    return cafes;
  } catch (error) {
    console.error("Error fetching pending cafes: ", error);
    return [];
  }
}

export async function addCafeToPending(cafeId: string, cafeData: Omit<Cafe, 'id' | 'approvedAt' | 'submittedAt' | 'logoLink'>, logoFile?: File | null): Promise<string | null> {
  try {
    let logoUrl: string | undefined = undefined;
    
    // Diagnostic log for storage bucket
    if (storage && storage.app.options.storageBucket) {
      console.log('Attempting to upload to Firebase Storage. Configured bucket:', storage.app.options.storageBucket);
    } else {
      console.error('Firebase Storage not configured correctly or bucket name is missing in config.');
      // Potentially throw an error here or handle as appropriate if storage is critical
    }

    if (logoFile && storage) { // Ensure storage is initialized
      const filePath = `logos/${cafeId}/${logoFile.name}`;
      const logoStorageRefInstance = storageRef(storage, filePath);
      const uploadTask = await uploadBytesResumable(logoStorageRefInstance, logoFile);
      logoUrl = await getDownloadURL(uploadTask.ref);
      console.log('Logo uploaded successfully. URL:', logoUrl);
    }

    const dataToSave: Partial<Cafe> = {
      ...cafeData,
      submittedAt: serverTimestamp() as Timestamp,
    };

    if (logoUrl) {
      dataToSave.logoLink = logoUrl;
    }
    
    await setDoc(doc(pendingCafesCollectionRef, cafeId), dataToSave);
    console.log("Pending cafe document written with ID: ", cafeId);
    return cafeId;
  } catch (error) {
    console.error("Error adding pending cafe document and/or uploading logo: ", error);
    if (error instanceof Error && 'code' in error) {
      console.error('Firebase Error Code:', (error as any).code);
      console.error('Firebase Error Message:', (error as any).message);
    }
    // If logo upload succeeded but Firestore failed, you might want to delete the orphaned logo
    if (logoUrl && !(error instanceof Error && (error as any).code?.includes('storage'))) {
        // This means storage upload might have worked but setDoc failed.
        // Consider deleting the logo if the DB write fails to prevent orphans.
        console.warn("Firestore write failed after logo upload. Consider deleting the orphaned logo:", logoUrl);
        // const logoToDeleteRef = storageRef(storage, logoUrl);
        // await deleteObject(logoToDeleteRef).catch(delErr => console.error("Failed to delete orphaned logo:", delErr));
    }
    return null;
  }
}

export async function approveCafe(pendingCafe: Cafe): Promise<boolean> {
  if (!pendingCafe.id) {
    console.error("Pending cafe has no ID, cannot approve.");
    return false;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, submittedAt, ...cafeDataForApproval } = pendingCafe; 

    const approvedData: Omit<Cafe, 'id' | 'submittedAt'> & { approvedAt: Timestamp } = {
      ...cafeDataForApproval,
      approvedAt: serverTimestamp() as Timestamp,
    };

    await setDoc(doc(cafesCollectionRef, pendingCafe.id), approvedData);
    await deleteDoc(doc(pendingCafesCollectionRef, pendingCafe.id));
    console.log(`Cafe ${pendingCafe.id} approved and moved to cafes collection.`);
    return true;
  } catch (error) {
    console.error("Error approving cafe: ", error);
    return false;
  }
}

export async function rejectCafe(pendingCafeId: string, logoLink?: string): Promise<boolean> {
  try {
    // If there's a logo, delete it from storage
    if (logoLink && typeof logoLink === 'string' && logoLink.trim() !== '' && storage) { // Ensure storage is initialized
      try {
        const logoStorageRefInstance = storageRef(storage, logoLink); 
        await deleteObject(logoStorageRefInstance);
        console.log(`Logo for ${pendingCafeId} deleted from storage.`);
      } catch (storageError) {
        console.error(`Error deleting logo for ${pendingCafeId} from storage: `, storageError);
         if ((storageError as any).code === 'storage/object-not-found') {
            console.warn('Logo object not found, proceeding with Firestore document deletion.');
        } else {
            // Optionally re-throw or handle other storage errors if they should block deletion
        }
      }
    }
    await deleteDoc(doc(pendingCafesCollectionRef, pendingCafeId));
    console.log(`Pending cafe ${pendingCafeId} rejected and deleted.`);
    return true;
  } catch (error) {
    console.error("Error rejecting cafe: ", error);
    return false;
  }
}
