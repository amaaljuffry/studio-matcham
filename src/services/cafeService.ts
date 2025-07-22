// src/services/cafeService.ts
import { SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient'; // Adjust this path to your Supabase client instance
import type { Cafe, HalalStatus } from '@/types'; // Import Cafe and HalalStatus from types

// --- Constants ---

export const CAFES_TABLE = 'cafes';
export const PENDING_CAFES_TABLE = 'pending_cafes';
const CAFE_LOGOS_BUCKET = 'cafe-logos';

// --- Helper Functions (Non-Public) ---

/**
 * Uploads a logo file to Supabase Storage.
 * This is a non-public helper function.
 * @param file The logo file to upload.
 * @param cafeId The ID of the cafe, used for naming the file to ensure uniqueness.
 * @returns The public URL of the uploaded logo, or null if upload fails.
 */
async function _uploadCafeLogo(
  file: File,
  cafeId: string,
): Promise<string | null> {
  if (!file || !cafeId) {
    console.error('_uploadCafeLogo: File or cafeId not provided.');
    return null;
  }

  const fileExtension = file.name.split('.').pop();
  const fileName = `${cafeId}_${Date.now()}.${fileExtension}`;
  const filePath = `public/${fileName}`;

  console.log(`_uploadCafeLogo: Attempting to upload file: ${fileName} to bucket ${CAFE_LOGOS_BUCKET}. File size: ${file.size} bytes, File type: ${file.type}. Path: ${filePath}`);

  try {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(CAFE_LOGOS_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('_uploadCafeLogo: Error uploading file:', uploadError);
      return null;
    }

    if (uploadData) {
      const { data: urlData } = supabase.storage
        .from(CAFE_LOGOS_BUCKET)
        .getPublicUrl(uploadData.path);

      console.log('_uploadCafeLogo: File uploaded successfully. Public URL:', urlData.publicUrl);
      return urlData.publicUrl;
    }
    return null;
  } catch (error: any) {
    console.error('_uploadCafeLogo: Exception during upload:', error.message || error);
    return null;
  }
}

/**
 * Deletes a logo from Supabase Storage using its full public URL.
 * This is a non-public helper function.
 * @param logoUrl The full public URL of the logo to delete.
 * @returns True if deletion was successful or not needed, false on error.
 */
async function _deleteCafeLogoByUrl(logoUrl: string): Promise<boolean> {
  if (!logoUrl) {
    console.warn('_deleteCafeLogoByUrl: No logo URL provided. Skipping deletion.');
    return true; // No action needed, so consider it successful in this context
  }

  try {
    // TODO: REVIEW - This path extraction is fragile. It assumes CAFE_LOGOS_BUCKET name doesn't appear earlier in the URL
    // and that the path doesn't contain the bucket name itself. A more robust method would be to store
    // the raw storage path alongside the public URL, or parse the URL more carefully.
    const urlObject = new URL(logoUrl);
    const pathSegments = urlObject.pathname.split('/');
    const bucketNameIndex = pathSegments.indexOf(CAFE_LOGOS_BUCKET);

    if (bucketNameIndex === -1 || bucketNameIndex === pathSegments.length - 1) {
        console.error('_deleteCafeLogoByUrl: Could not reliably extract path from URL:', logoUrl);
        return false;
    }
    const storagePath = pathSegments.slice(bucketNameIndex + 1).join('/');


    if (!storagePath) {
        console.error('_deleteCafeLogoByUrl: Extracted path is empty from URL:', logoUrl);
        return false;
    }

    console.log(`_deleteCafeLogoByUrl: Attempting to delete logo at path: ${storagePath} from bucket ${CAFE_LOGOS_BUCKET}`);
    const { error: deleteError } = await supabase.storage // Use imported supabase client
        .from(CAFE_LOGOS_BUCKET)
        .remove([storagePath]);

    if (deleteError) {
      // It's common for a file to be already deleted, so 'StorageApiError: Not Found' is not a critical failure for deletion.
      if (deleteError.message === 'Not Found' || (deleteError as any).statusCode === '404') {
         console.warn(`_deleteCafeLogoByUrl: Logo not found (may have been already deleted): ${storagePath}`);
         return true;
      }
      console.error('_deleteCafeLogoByUrl: Error deleting logo:', deleteError);
      return false;
    }
    console.log('_deleteCafeLogoByUrl: Logo deleted successfully from storage.');
    return true;
  } catch (error) {
    console.error('_deleteCafeLogoByUrl: Exception during deletion:', error);
    return false;
  }
}

/**
 * Handles PostgREST errors, logging them and optionally re-throwing or returning null.
 * @param error The PostgrestError object.
 * @param context A string describing the context of the error.
 * @param throwErrorIfCritical If true, re-throws the error. Otherwise, returns null.
 * @returns null if not re-throwing, otherwise never returns.
 */
function _handlePostgrestError(error: PostgrestError, context: string, throwErrorIfCritical = false): null {
    console.error(`${context}: PostgREST Error - Code: ${error.code}, Message: ${error.message}, Details: ${error.details}, Hint: ${error.hint}`);
    if (throwErrorIfCritical) {
        throw error;
    }
    return null;
}

/**
 * Generates a unique, URL-friendly ID for a cafe based on its name.
 * @param cafeName The name of the cafe.
 * @returns A slugified string representing the cafe ID.
 */
export function generateCafeId(cafeName: string): string {
  // Simple slugification: lowercase, replace non-alphanumeric with hyphens, remove leading/trailing hyphens.
  return cafeName.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// --- Cafe Data Service Functions (Public) ---

/**
 * Fetches all approved and operational cafes, ordered by name.
 * @returns A promise that resolves to an array of Cafe objects. Returns empty array on failure.
 */
export async function getApprovedCafes(): Promise<Cafe[]> {
  const operationName = 'getApprovedCafes';
  console.log(`${operationName}: Fetching approved, operational cafes...`);
  try {
    const { data: cafesData, error } = await supabase
      .from(CAFES_TABLE)
      .select('*')
      .eq('businessstatus', 'OPERATIONAL')
      .order('name', { ascending: true });

    if (error) {
      _handlePostgrestError(error, `${operationName}: Error fetching cafes`);
      return []; // Return empty array on error as per original behavior
    }
    console.log(`${operationName}: Fetched ${cafesData?.length || 0} cafes.`);
    return cafesData || [];
  } catch (error) {
    console.error(`${operationName}: Exception:`, error);
    return [];
  }
}

/**
 * Fetches all pending cafe submissions, ordered by submission date descending.
 * @returns A promise that resolves to an array of Cafe objects. Returns empty array on failure.
 */
export async function getPendingCafes(
  page: number = 1,
  limit: number = 10,
): Promise<{ cafes: Cafe[]; totalCount: number }> {
  const operationName = 'getPendingCafes';
  console.log(`${operationName}: Fetching pending cafes for page ${page} with limit ${limit}...`);
  try {
    const offset = (page - 1) * limit;
    const { data: cafesData, error, count } = await supabase
      .from(PENDING_CAFES_TABLE)
      .select('*', { count: 'exact' })
      .order('submittedat', { ascending: false })
      .range(offset, offset + limit - 1); // Supabase range is inclusive

    if (error) {
      _handlePostgrestError(error, `${operationName}: Error fetching pending cafes`);
      return { cafes: [], totalCount: 0 };
    }
    console.log(`${operationName}: Fetched ${cafesData?.length || 0} pending cafes for page ${page}. Total count: ${count}.`);
    return { cafes: cafesData || [], totalCount: count || 0 };
  } catch (error) {
    console.error(`${operationName}: Exception:`, error);
    return { cafes: [], totalCount: 0 };
  }
}

/**
 * Fetches all rejected cafe submissions, ordered by rejection date descending.
 * @returns A promise that resolves to an array of Cafe objects. Returns empty array on failure.
 */
export async function getRejectedCafes(): Promise<Cafe[]> {
  const operationName = 'getRejectedCafes';
  console.log(`${operationName}: Fetching rejected cafes...`);
  try {
    const { data: cafesData, error } = await supabase
      .from(CAFES_TABLE)
      .select('*')
      .eq('businessstatus', 'REJECTED')
      .order('rejectedAt', { ascending: false });

    if (error) {
      _handlePostgrestError(error, `${operationName}: Error fetching rejected cafes`);
      return [];
    }
    console.log(`${operationName}: Fetched ${cafesData?.length || 0} rejected cafes.`);
    return cafesData || [];
  } catch (error) {
    console.error(`${operationName}: Exception:`, error);
    return [];
  }
}

/**
 * Adds a new cafe submission to the 'cafes' table.
 * Optionally uploads a logo. If logo upload fails after data insertion, the cafe remains but without a logo.
 * @param cafeSubmissionData Data for the new cafe (excluding id, managed timestamps, and logoLink).
 * @param logoFile Optional logo file to upload.
 * @returns The ID of the newly created pending cafe if successful, otherwise null.
 */
export async function addCafeToPending(
  cafeSubmissionData: Omit<Cafe, 'id' | 'createdAt' | 'updatedAt' | 'approvedat' | 'rejectedAt' | 'logoLink' | 'socialmedialinks' | 'userRatingTotal'>,
  logoFile?: File | null,
): Promise<{ id: string } | null> {
  const operationName = 'addCafeToPending';
  console.log(`${operationName}: Attempting to add new pending cafe...`);
  try {
    const dataToInsert: Partial<Cafe> = {
      ...cafeSubmissionData,
      submittedat: new Date().toISOString(),
      businessstatus: 'PENDING_REVIEW',
    };

    const { data: insertedCafeData, error: insertError } = await supabase
      .from(PENDING_CAFES_TABLE)
      .insert([dataToInsert])
      .select('id')
      .single();

    if (insertError || !insertedCafeData || !insertedCafeData.id) {
      return _handlePostgrestError(insertError || new Error('Failed to insert cafe or retrieve ID.') as PostgrestError, `${operationName}: Error inserting cafe data`, true);
    }

    const newCafeId = insertedCafeData.id;
    let logoUrl: string | null = null;

    if (logoFile) {
      logoUrl = await _uploadCafeLogo(logoFile, newCafeId);
      if (logoUrl) {
        const { error: updateLogoError } = await supabase
          .from(PENDING_CAFES_TABLE)
          .update({ logolink: logoUrl })
          .eq('id', newCafeId);

        if (updateLogoError) {
          // TODO: REVIEW - Atomicity: Logo uploaded but DB update failed.
          // The orphaned logo should ideally be deleted.
          console.error(`${operationName}: Error updating cafe with logoLink. Attempting to delete orphaned logo.`, updateLogoError);
          await _deleteCafeLogoByUrl(logoUrl); // Attempt to clean up
          return _handlePostgrestError(updateLogoError, `${operationName}: Error updating cafe with logoLink`, true);
        }
      } else {
        console.warn(`${operationName}: Cafe data for ${newCafeId} inserted, but logo upload failed. Cafe will not have a logo.`);
        // TODO: REVIEW - Should this be considered a partial success or a failure?
        // Depending on requirements, might want to delete the inserted cafe record if logo is mandatory.
      }
    }

    console.log(`${operationName}: Pending cafe added successfully with ID:`, newCafeId);
    return { id: newCafeId };
  } catch (error) {
    console.error(`${operationName}: Exception:`, error);
    return null;
  }
}


/**
 * Moves a cafe record from a source table to a target table, updating its status and relevant timestamps.
 * This is a non-public helper function.
 * @param cafeId The ID of the cafe to move.
 * @param sourceTable The name of the source table (e.g., CAFES_TABLE).
 * @param targetTable The name of the target table (e.g., CAFES_TABLE, REJECTED_CAFES_TABLE).
 * @param newStatus The new businessstatus for the cafe in the target table.
 * @param dateFieldName The name of the timestamp field to set (e.g., 'approvedat', 'rejectedAt').
 * @returns True if successful, false otherwise.
 */
async function _moveCafeAndUpdateStatus(
    cafeId: string,
    newStatus: "OPERATIONAL" | "REJECTED",
    dateFieldName: 'approvedat' | 'rejectedAt'
): Promise<boolean> {
    const operationName = '_moveCafeAndUpdateStatus';
    console.log(`${operationName}: Attempting to move cafe ${cafeId} to status ${newStatus}...`);

    try {
        // 1. Fetch the pending cafe
        const { data: pendingCafe, error: fetchError } = await supabase
            .from(PENDING_CAFES_TABLE)
        .select('*')
        .eq('id', cafeId)
        .single();

        if (fetchError) {
            _handlePostgrestError(fetchError, `${operationName}: Error fetching pending cafe ${cafeId}`);
            return false;
        }
        if (!pendingCafe) {
            console.warn(`${operationName}: No pending cafe found with ID: ${cafeId}.`);
        return false;
    }

        // 2. Prepare data for insertion into the main cafes table
        // Omit fields that are specific to pending_cafes or handled separately
        const { id, status, ...restOfCafe } = pendingCafe; // 'status' is only in pending_cafes

        const cafeDataForMainTable = {
            ...restOfCafe,
            id: id, // Keep the same ID for consistency
            businessstatus: newStatus, // Set the new business status
            [dateFieldName]: new Date().toISOString(), // Set approvedAt or rejectedAt
            // Ensure other fields not in CafeSubmissionForm are set to null if not present
            googleplaceid: pendingCafe.googleplaceid || null,
            pricelevel: pendingCafe.pricelevel || null,
            logolink: pendingCafe.logolink || null,
            // Any other fields specific to the 'cafes' table that need explicit nulling
    };

        // 3. Insert into the main cafes table
    const { error: insertError } = await supabase
            .from(CAFES_TABLE)
            .insert([cafeDataForMainTable])
            .single();

    if (insertError) {
            _handlePostgrestError(insertError, `${operationName}: Error inserting cafe ${cafeId} into main table`);
        return false;
    }

        // 4. Delete from the pending_cafes table
    const { error: deleteError } = await supabase
            .from(PENDING_CAFES_TABLE)
        .delete()
        .eq('id', cafeId);

    if (deleteError) {
            _handlePostgrestError(deleteError, `${operationName}: Error deleting pending cafe ${cafeId}`);
            return false;
        }

        console.log(`${operationName}: Cafe ${cafeId} successfully moved to ${newStatus}.`);
        return true;
    } catch (error) {
        console.error(`${operationName}: Exception:`, error);
        return false;
    }
}


/**
 * Approves a pending cafe. Moves it from 'cafes' to 'cafes' and updates its status.
 * @param pendingCafeId The ID of the cafe in the 'cafes' table.
 * @returns True if successful, false otherwise.
 */
export async function approveCafe(pendingCafeId: string): Promise<boolean> {
  return _moveCafeAndUpdateStatus(pendingCafeId, 'OPERATIONAL', 'approvedat');
}

/**
 * Rejects a pending cafe. Moves it from 'cafes' to 'rejected_cafes' and updates its status.
 * Note: Logo is typically not deleted on rejection but kept with the rejected record.
 * @param pendingCafeId The ID of the cafe in the 'cafes' table.
 * @returns True if successful, false otherwise.
 */
export async function rejectCafe(pendingCafeId: string): Promise<boolean> {
  return _moveCafeAndUpdateStatus(pendingCafeId, 'REJECTED', 'rejectedAt');
}

/**
 * Fetches the total count of all cafes in the main 'cafes' table, regardless of status.
 * @returns A promise that resolves to the total count, or 0 on failure.
 */
export async function getTotalCafesCount(): Promise<number> {
  const operationName = 'getTotalCafesCount';
  console.log(`${operationName}: Fetching total count of all cafes...`);
  try {
    const { count, error } = await supabase
      .from(CAFES_TABLE)
      .select('id', { count: 'exact', head: true }); // Use head: true for efficiency

    if (error) {
      _handlePostgrestError(error, `${operationName}: Error fetching total cafe count`);
      return 0;
  }
    console.log(`${operationName}: Total cafes count: ${count || 0}.`);
    return count || 0;
  } catch (error) {
    console.error(`${operationName}: Exception:`, error);
    return 0;
  }
}

/**
 * Fetches the total count of approved cafes (status 'OPERATIONAL').
 * @returns A promise that resolves to the total count, or 0 on failure.
 */
export async function getTotalApprovedCafesCount(): Promise<number> {
  const operationName = 'getTotalApprovedCafesCount';
  console.log(`${operationName}: Fetching total count of approved cafes...`);
  try {
    const { count, error } = await supabase
      .from(CAFES_TABLE)
      .select('id', { count: 'exact', head: true })
      .eq('businessstatus', 'OPERATIONAL');

    if (error) {
      _handlePostgrestError(error, `${operationName}: Error fetching total approved cafe count`);
      return 0;
    }
    console.log(`${operationName}: Total approved cafes count: ${count || 0}.`);
    return count || 0;
  } catch (error) {
    console.error(`${operationName}: Exception:`, error);
    return 0;
  }
}

/**
 * Fetches the total count of rejected cafes.
 * @returns A promise that resolves to the total count, or 0 on failure.
 */
export async function getTotalRejectedCafesCount(): Promise<number> {
  const operationName = 'getTotalRejectedCafesCount';
  console.log(`${operationName}: Fetching total count of rejected cafes...`);
  try {
    const { count, error } = await supabase
      .from(CAFES_TABLE)
      .select('id', { count: 'exact', head: true })
      .eq('businessstatus', 'REJECTED');

    if (error) {
      _handlePostgrestError(error, `${operationName}: Error fetching total rejected cafe count`);
      return 0;
    }
    console.log(`${operationName}: Total rejected cafes count: ${count || 0}.`);
    return count || 0;
  } catch (error) {
    console.error(`${operationName}: Exception:`, error);
    return 0;
  }
}
