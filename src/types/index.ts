
import type { Timestamp } from 'firebase/firestore';

export type HalalStatus = "Muslim Friendly" | "Muslim Owner" | "Non Halal" | "Not Specified";

export interface Cafe {
  id: string; // This will be the custom generated ID
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  openingHours: string;
  rating: number;
  logoLink?: string; // URL to the logo in Firebase Storage
  dataAiHint?: string;
  state: string;
  tags?: string[];
  halalStatus?: HalalStatus;
  socialMediaLinks?: {
    website?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
    whatsapp?: string;
  };
  submittedAt?: Timestamp | Date; // Timestamp of when the cafe was submitted
  approvedAt?: Timestamp | Date; // Timestamp of when the cafe was approved
}

// Specific type for form data handling, including the file object
export interface CafeFormData extends Omit<Cafe, 'id' | 'logoLink' | 'submittedAt' | 'approvedAt' | 'rating'> {
  logoFile?: File | null;
  termsAccepted: boolean;
  // Rating is not set by user, halalStatus is string from enum
  halalStatus: HalalStatus;
  rating?: number; // will be defaulted to 0
  // Optional fields directly from form
  websiteLink?: string;
  socialInstagram?: string;
  socialFacebook?: string;
  socialTwitter?: string;
  socialTiktok?: string;
  socialWhatsapp?: string;
  logoLink?: string; // This will hold the URL after upload for the DB
}
