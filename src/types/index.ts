
export interface Cafe {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  openingHours: string;
  menuLink?: string;
  rating: number;
  image: string;
  dataAiHint?: string; // For placeholder image keyword hint
  state: string; // Added state
  tags?: string[]; // Added tags
  socialMediaLinks?: { // Added social media links
    website?: string;
    instagram?: string;
    facebook?: string;
  };
}

