// src/app/api/admin/cafes/[id]/route.ts (Example for Next.js App Router)

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { adminDb, adminStorage } from '@/lib/firebaseAdmin'; // Your Firebase Admin SDK init
import { doc, updateDoc, getDoc } from 'firebase/firestore'; // These are correctly used with adminDb
import { Cafe } from '@/types'; // Assuming you have these types
import formidable from 'formidable'; // For parsing multipart/form-data
import { promises as fs } from 'fs'; // For file system operations (formidable)
import { getDownloadURL } from 'firebase-admin/storage'; // Correct import for Admin SDK's getDownloadURL

// IMPORTANT: This route needs to handle multipart/form-data for file uploads.
// Next.js's body parser doesn't handle files by default for route handlers.
// We'll use 'formidable'.

export const config = {
  api: {
    bodyParser: false, // Disable default body parser for file uploads
  },
};

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const cafeId = params.id;

  // Ensure Firebase Admin SDK is initialized before proceeding
  if (!adminDb || !adminStorage) {
    console.error("Firebase Admin SDK (Firestore or Storage) is not initialized.");
    return NextResponse.json({ message: 'Server configuration error: Firebase Admin SDK not ready.' }, { status: 500 });
  }

  try {
    // 1. Parse multipart/form-data
    const form = formidable({});
    const [fields, files] = await form.parse(req);

    const cafeData: Partial<Cafe> = {};

    // Process fields from formidable
    for (const key in fields) {
      if (Array.isArray(fields[key])) {
        // Formidable returns values as arrays, take the first element
        cafeData[key as keyof Partial<Cafe>] = fields[key]?.[0] as any;
      }
    }

    // Special handling for numerical fields
    if (cafeData.latitude) cafeData.latitude = parseFloat(cafeData.latitude as any);
    if (cafeData.longitude) cafeData.longitude = parseFloat(cafeData.longitude as any);

    // Special handling for tags (comma-separated string)
    if (cafeData.tags && typeof cafeData.tags === 'string') {
      cafeData.tags = cafeData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    }

    // Consolidate socialMediaLinks
    const socialMediaLinks: Partial<Cafe['socialMediaLinks']> = {
      website: (cafeData.websiteLink as string) || undefined,
      instagram: (cafeData.socialInstagram as string) || undefined,
      facebook: (cafeData.socialFacebook as string) || undefined,
      twitter: (cafeData.socialTwitter as string) || undefined,
      tiktok: (cafeData.socialTiktok as string) || undefined,
      whatsapp: (cafeData.socialWhatsapp as string) || undefined,
    };

    // Remove temporary keys used for social media links from cafeData
    delete cafeData.websiteLink;
    delete cafeData.socialInstagram;
    delete cafeData.socialFacebook;
    delete cafeData.socialTwitter;
    delete cafeData.socialTiktok;
    delete cafeData.socialWhatsapp;

    // Add the consolidated socialMediaLinks object to cafeData
    cafeData.socialMediaLinks = socialMediaLinks as Cafe['socialMediaLinks'];


    const newLogoFile = files.logoFile?.[0]; // formidable gives array of files
    const originalLogoLink = fields.originalLogoLink?.[0] as string | undefined; // Passed as a field from client

    const cafeDocRef = doc(adminDb, 'cafes', cafeId);
    let logoLinkToSave: string | undefined | null = originalLogoLink; // Default to existing link

    if (newLogoFile) {
      // A new file was uploaded
      const fileBuffer = await fs.readFile(newLogoFile.filepath);
      const storageFilePath = `cafe_logos/${cafeId}_${newLogoFile.originalFilename}`;
      const fileRef = adminStorage.bucket().file(storageFilePath);

      await fileRef.save(fileBuffer, {
        contentType: newLogoFile.mimetype || undefined,
      });

      // Get the download URL for the newly uploaded file
      logoLinkToSave = await getDownloadURL(fileRef);

      // If there was an old logo and it's different from the new one, delete the old one
      if (originalLogoLink && originalLogoLink !== logoLinkToSave) {
        try {
          const oldLogoPath = getStoragePathFromUrl(originalLogoLink);
          if (oldLogoPath) {
            await adminStorage.bucket().file(oldLogoPath).delete();
            console.log("Old logo deleted successfully:", originalLogoLink);
          }
        } catch (deleteError: any) {
          // Log error if old logo can't be deleted, but don't block the update
          if (deleteError.code === 404 || deleteError.message?.includes('No such object')) {
            console.warn("Old logo not found in storage, skipping deletion.");
          } else {
            console.error("Error deleting old logo:", deleteError);
          }
        }
      }
    } else if (fields.logoFile?.[0] === 'null' && originalLogoLink) {
      // User explicitly requested to remove the logo
      try {
        const oldLogoPath = getStoragePathFromUrl(originalLogoLink);
        if (oldLogoPath) {
          await adminStorage.bucket().file(oldLogoPath).delete();
          console.log("Logo successfully removed from storage.");
        }
      } catch (deleteError: any) {
        if (deleteError.code === 404 || deleteError.message?.includes('No such object')) {
          console.warn("Attempted to remove logo, but it was not found in storage.");
        } else {
          console.error("Error removing logo from storage:", deleteError);
        }
      }
      logoLinkToSave = null; // Set logoLink to null in Firestore
    }

    const dataToUpdate: Record<string, any> = {
      ...cafeData,
      logoLink: logoLinkToSave,
      updatedAt: adminDb.FieldValue.serverTimestamp(), // Use adminDb.FieldValue for server timestamp
    };

    await updateDoc(cafeDocRef, dataToUpdate);

    return NextResponse.json({ success: true, message: 'Cafe updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error updating cafe:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: (error as Error).message }, { status: 500 });
  }
}

/**
 * Helper to extract the storage path from a Firebase Storage download URL.
 * This is necessary because the Admin SDK's `bucket().file().delete()` method
 * requires the storage path, not the full download URL.
 * @param url The Firebase Storage download URL.
 * @returns The storage path (e.g., 'cafe_logos/cafeId_filename.jpg') or null if parsing fails.
 */
function getStoragePathFromUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    // Path looks like /o/cafe_logos%2FcafeId_filename.jpg?alt...
    const pathSegment = parsedUrl.pathname.split('/o/')[1];
    if (pathSegment) {
      // Decode URI component and remove any query parameters
      return decodeURIComponent(pathSegment.split('?')[0]);
    }
  } catch (error) {
    console.error("Failed to parse storage URL for deletion:", error);
  }
  return null;
}

// GET Handler for Fetching Cafe Data
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const cafeId = params.id;

  // Ensure Firebase Admin SDK is initialized
  if (!adminDb) {
    console.error("Firebase Admin Firestore (adminDb) is not initialized in GET handler.");
    return NextResponse.json({ message: 'Server configuration error: Firebase Admin SDK not ready.' }, { status: 500 });
  }

  try {
    const cafeDocRef = doc(adminDb, 'cafes', cafeId);
    const cafeDocSnap = await getDoc(cafeDocRef);

    if (cafeDocSnap.exists()) {
      const data = cafeDocSnap.data() as Cafe;

      // CRITICAL FIX: Convert Firebase Timestamp objects to ISO strings for JSON serialization.
      // This is necessary because Firebase Timestamp objects are not directly JSON serializable.
      const serializedData: Partial<Cafe> & { id: string } = {
        ...data,
        id: cafeDocSnap.id, // Explicitly add the document ID
      };

      // Iterate over potential timestamp fields and convert them
      const timestampFields = ['submittedAt', 'approvedAt', 'rejectedAt', 'createdAt', 'updatedAt']; // Add all your timestamp fields here
      for (const field of timestampFields) {
        if (data[field as keyof Cafe] && typeof (data[field as keyof Cafe] as any).toDate === 'function') {
          (serializedData as any)[field] = (data[field as keyof Cafe] as any).toDate().toISOString();
        } else {
          // Explicitly set to null if the timestamp field is missing or invalid
          (serializedData as any)[field] = null;
        }
      }

      return NextResponse.json(serializedData, { status: 200 });
    } else {
      console.warn(`Cafe with ID ${cafeId} not found in Firestore.`);
      return NextResponse.json({ message: 'Cafe not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Server-side error fetching cafe:', error);
    // Provide more detailed error message to the client (but avoid sensitive info)
    return NextResponse.json({ message: `Internal Server Error: ${error instanceof Error ? error.message : 'An unknown error occurred.'}` }, { status: 500 });
  }
}