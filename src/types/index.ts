
export type HalalStatus = "Muslim Friendly" | "Muslim Owner" | "Non Halal" | "Not Specified";

export interface Cafe {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  openingHours: string;
  // menuLink?: string; // Removed, menu expected via website/social
  rating: number; // Rating will be assigned by admin/community later, not part of initial submission
  logoLink?: string; // Renamed from image, for cafe logo
  dataAiHint?: string; // For placeholder image keyword hint for general cafe images
  state: string;
  tags?: string[];
  halalStatus?: HalalStatus; // New field
  socialMediaLinks?: {
    website?: string; // General website
    instagram?: string;
    facebook?: string;
    twitter?: string; // New
    tiktok?: string; // New
    whatsapp?: string; // New (e.g., wa.me link)
  };
}
