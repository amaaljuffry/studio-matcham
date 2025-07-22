// src/data/cafes.ts

// Import the HalalStatus type to ensure consistency, if needed for strict typing here.
// However, for lists used in UI, often just ensuring string values match is sufficient.
// If cafeService.ts exports it, you could: import type { HalalStatus } from '@/services/cafeService';

/**
 * List of Malaysian states for filter dropdowns.
 */
export const malaysianStates: string[] = [
  "Johor",
  "Kedah",
  "Kelantan",
  "Kuala Lumpur",
  "Labuan",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Penang",
  "Perak",
  "Perlis",
  "Putrajaya",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
];

/**
 * List of Halal statuses with IDs and display labels.
 * The 'id' should correspond to the HalalStatus type defined in cafeService.ts.
 */
export const halalStatusesList: Array<{ id: string; label: string }> = [
  { id: "Halal Certified", label: "Halal Certified by JAKIM/State Body" },
  { id: "Muslim Owned", label: "Muslim Owned (No Official Cert)" },
  { id: "Pork Free", label: "Pork-Free (Serves No Pork/Lard)" },
  // TODO: REVIEW - Consider if "Uses Halal Ingredients" is a distinct, useful category.
  // { id: "Uses Halal Ingredients", label: "Uses Halal Ingredients (Self-Claimed)" },
  { id: "Not Specified", label: "Not Specified / Inquire at Premise" },
  { id: "Non-Halal", label: "Serves Non-Halal Items" },
];


/**
 * List of additional tags for filtering or submission, with IDs and display labels.
 * These are example tags; customize them as needed.
 */
export const additionalTagsList: Array<{ id: string; label: string }> = [
  { id: "cozy", label: "Cozy Atmosphere" },
  { id: "goodForWork", label: "Good for Work/Study" },
  { id: "instagrammable", label: "Instagrammable" },
  { id: "petFriendly", label: "Pet-Friendly" },
  { id: "outdoorSeating", label: "Outdoor Seating" },
  { id: "goodForGroups", label: "Good for Groups" },
  { id: "servesPastries", label: "Serves Pastries" },
  { id: "servesHeavyMeals", label: "Serves Heavy Meals" },
  { id: "veganOptions", label: "Vegan Options Available" },
  { id: "vegetarianOptions", label: "Vegetarian Options Available" },
  { id: "uniqueDrinks", label: "Unique Matcha Drinks" },
  { id: "traditionalMatcha", label: "Traditional Matcha (Usucha/Koicha)" },
  { id: "parkingAvailable", label: "Parking Available" },
  { id: "nearPublicTransport", label: "Near Public Transport" },
  // Add more tags as relevant to your application
];

/**
 * Optional: List of business statuses if you want a consistent dropdown for them.
 * This might also be useful for admin panels or forms.
 */
export const businessstatusList: Array<{ id: string; label: string }> = [
    { id: "OPERATIONAL", label: "Operational" },
    { id: "CLOSED_PERMANENTLY", label: "Closed Permanently" },
    { id: "CLOSED_TEMPORARILY", label: "Closed Temporarily" },
    { id: "PENDING_REVIEW", label: "Pending Review" }, // If used in admin forms
    { id: "REJECTED", label: "Rejected" }, // If used in admin forms
];

/**
 * Optional: List of price levels if you want a consistent dropdown for them.
 */
export const priceLevelsList: Array<{ id: number; label: string }> = [
    { id: 0, label: "Free (or not applicable)" },
    { id: 1, label: "Inexpensive ($)" },
    { id: 2, label: "Moderate ($$)" },
    { id: 3, label: "Expensive ($$$)" },
    { id: 4, label: "Very Expensive ($$$$)" },
];

// You can add other static data related to cafes here if needed.