
import { collection, getDocs, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Cafe } from '@/types';

const cafesCollectionRef = collection(db, 'cafes'); // For approved, live cafes
const pendingCafesCollectionRef = collection(db, 'pendingCafes'); // For submissions awaiting review

export async function getCafes(): Promise<Cafe[]> {
  try {
    const querySnapshot = await getDocs(cafesCollectionRef);
    const cafes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Cafe));
    return cafes;
  } catch (error) {
    console.error("Error fetching cafes: ", error);
    // Return an empty array or rethrow, depending on how you want to handle errors
    return []; 
  }
}

// This function now adds to the 'pendingCafes' collection for moderation
export async function addCafe(cafeData: Omit<Cafe, 'id'>): Promise<string | null> {
  try {
    const docRef = await addDoc(pendingCafesCollectionRef, cafeData);
    console.log("Pending cafe document written to 'pendingCafes' with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding pending cafe document: ", error);
    return null;
  }
}

// Optional: Function to add mock data if needed (e.g., for initial setup)
// import { mockCafes } from '@/data/cafes'; // Make sure mockCafes doesn't include 'id' if you use addDoc
// export async function seedCafes() {
//   mockCafes.forEach(async (cafe) => {
//     // If your mockCafes have IDs and you want to keep them, use setDoc
//     // const { id, ...cafeData } = cafe; // Destructure if id is present
//     // if(id) {
//     //   await setDoc(doc(db, "cafes", id), cafeData);
//     // } else {
//     //   await addDoc(cafesCollectionRef, cafe);
//     // }
//     // For simplicity, assuming mockCafes are compatible with Omit<Cafe, 'id'>
//     // or you adjust them accordingly.
//     // This example will create new documents with auto-generated IDs.
//     try {
//         const { id, ...dataToSeed } = cafe; // remove id for auto-generation
//         await addDoc(cafesCollectionRef, dataToSeed); // Seed to live cafes for now
//         console.log(`Added cafe: ${cafe.name}`);
//     } catch (e) {
//         console.error("Error adding mock cafe: ", e);
//     }
//   });
// }

