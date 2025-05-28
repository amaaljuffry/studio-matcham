
import type { Cafe, HalalStatus } from '@/types';

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

export const additionalTagsList = [
  { id: 'ceremonialGrade', label: 'Ceremonial Grade Matcha' },
  { id: 'matchaDesserts', label: 'Matcha Desserts & Pastries' },
  { id: 'zenAmbience', label: 'Zen & Tranquil Ambience' },
  { id: 'workRelax', label: 'Work-Friendly (Wi-Fi & Power)' },
  { id: 'popUp', label: 'Pop-Up / Mobile Vendor' },
  { id: 'organicMatcha', label: 'Organic Matcha Sourced' },
  { id: 'morningBrew', label: 'Morning Brew (Opens before 8 AM)' },
  { id: 'lateSips', label: 'Late Sips (Open Late)' },
  { id: 'localGem', label: 'Local Independent Shop' }, // Rephrased from Franchise
  {id: 'franchiseChain', label: 'Franchise Chain' },
] as const;

export const halalStatusesList: { id: HalalStatus, label: string, description?: string }[] = [
  { id: 'Muslim Friendly', label: 'Muslim Friendly', description: '(no pork or alcohol, halal ingredients)' },
  { id: 'Muslim Owner', label: 'Muslim Owner', description: '(assumed halal)' },
  { id: 'Non Halal', label: 'Non Halal', description: '(contains pork/alcohol/non-halal ingredients)' },
  { id: 'Not Specified', label: 'Not Specified', description: '(status unknown or not provided)'},
];

