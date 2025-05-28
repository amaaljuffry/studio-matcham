// src/types/index.ts

// Define the specific HalalStatus IDs that your form and database expect
export type HalalStatus =
  | "Muslim Friendly"
  | "Muslim Owner"
  | "Non Halal"
  | "Not Specified";

// Define the structure for social media links
export type SocialMediaLinks = {
  website?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  tiktok?: string;
  whatsapp?: string;
};

// Define the main Cafe type
export type Cafe = {
  id: string; // Document ID from Firestore
  name: string;
  address: string;
  state: string;
  latitude: number;
  longitude: number;
  logoLink?: string | null; // URL to the logo in Firebase Storage
  halalStatus: HalalStatus;
  tags?: string[]; // Array of selected tags (e.g., 'cozy', 'wifi')
  openingHours: string;
  socialMediaLinks?: SocialMediaLinks;
  rating: number; // Average user rating
  userRatingTotal: number; // Total number of ratings (for calculating average)
  submittedAt: Date; // Timestamp when the cafe was submitted (Date object after conversion)
  approvedAt?: Date | null; // Timestamp when the cafe was approved (Date object after conversion)
  businessStatus: "PENDING_REVIEW" | "OPERATIONAL" | "CLOSED" | "TEMPORARILY_CLOSED"; // Status
};