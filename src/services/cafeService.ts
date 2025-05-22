
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
    // Order by name for consistent listing, or perhaps by approvedAt if available
    const q = query(cafesCollectionRef, orderBy("name"));
    const querySnapshot = await getDocs(q);
    const cafes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamps to Date objects if they exist
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

export async function addCafeToPending(cafeId: string, cafeData: Omit<Cafe, 'id' | 'approvedAt' | 'submittedAt'>, logoFile?: File | null): Promise<string | null> {
  try {
    let logoUrl: string | undefined = undefined;
    if (logoFile) {
      const filePath = `logos/${cafeId}/${logoFile.name}`;
      const logoStorageRef = storageRef(storage, filePath);
      const uploadTask = await uploadBytesResumable(logoStorageRef, logoFile);
      logoUrl = await getDownloadURL(uploadTask.ref);
    }

    const dataToSave: Partial<Cafe> = {
      ...cafeData,
      submittedAt: serverTimestamp() as Timestamp, // Firestore will convert this
    };
    if (logoUrl) {
      dataToSave.logoLink = logoUrl;
    }
    
    await setDoc(doc(pendingCafesCollectionRef, cafeId), dataToSave);
    console.log("Pending cafe document written with ID: ", cafeId);
    return cafeId;
  } catch (error) {
    console.error("Error adding pending cafe document: ", error);
    return null;
  }
}

export async function approveCafe(pendingCafe: Cafe): Promise<boolean> {
  if (!pendingCafe.id) {
    console.error("Pending cafe has no ID, cannot approve.");
    return false;
  }
  try {
    // Prepare data for the 'cafes' collection
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, submittedAt, ...cafeDataForApproval } = pendingCafe; // Destructure to get data without id and submittedAt

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
    if (logoLink) {
      try {
        const logoStorageRef = storageRef(storage, logoLink); // logoLink is the full URL
        await deleteObject(logoStorageRef);
        console.log(`Logo for ${pendingCafeId} deleted from storage.`);
      } catch (storageError) {
        // Log error but continue with deleting the Firestore document
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
