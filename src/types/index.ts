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
  id: string; // Document ID from Firestore or Supabase UUID
  name: string;
  address: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  logoLink?: string | null; // URL to the logo
  halalstatus: HalalStatus; // Corrected to all lowercase to match Supabase schema
  tags?: string[]; // Array of selected tags
  openinghours: string; // Corrected to all lowercase to match Supabase schema
  socialmedialinks?: SocialMediaLinks; // Corrected to all lowercase to match Supabase schema
  rating?: number; // Average user rating
  userRatingTotal?: number; // Total number of ratings (camelCase)
  createdAt?: Date | string; // Timestamp when the cafe was created
  updatedAt?: Date | string; // Timestamp when the cafe was last updated
  submittedat: Date | string; // Timestamp when the cafe was submitted
  approvedat?: Date | null; // Timestamp when the cafe was approved
  businessstatus: "PENDING_REVIEW" | "OPERATIONAL" | "CLOSED" | "TEMPORARILY_CLOSED" | "REJECTED"; // Status
  googleplaceid?: string | null; // Added from schema
  pricelevel?: number | null; // Added from schema
};