
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
}
