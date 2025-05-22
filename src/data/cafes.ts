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
  { id: 'dessertsAvailable', label: 'Desserts Available' },
  { id: 'cozyAmbience', label: 'Cozy Ambience' },
  { id: 'workFriendly', label: 'Work Friendly (Wi-Fi & power outlets)' },
  { id: 'mobileVendor', label: 'Mobile Vendor' },
  { id: 'organicIngredients', label: 'Organic Ingredients' },
  { id: 'earlyBird', label: 'Early Bird (opens before 8am)' },
  { id: 'nightOwl', label: 'Night Owl (open late)' },
] as const;

export const halalStatusesList: { id: HalalStatus, label: string, description?: string }[] = [
  { id: 'Muslim Friendly', label: 'Muslim Friendly', description: '(no pork or alcohol, halal ingredients)' },
  { id: 'Muslim Owner', label: 'Muslim Owner', description: '(assumed halal)' },
  { id: 'Non Halal', label: 'Non Halal', description: '(contains pork/alcohol/non-halal ingredients)' },
];


export const mockCafes: Cafe[] = [
  {
    id: '1',
    name: 'Niko Neko Matcha 1.0 (Bangsar)',
    address: '82A, Lorong Maarof, Bangsar, 59000 Kuala Lumpur',
    latitude: 3.1303,
    longitude: 101.6701,
    openingHours: '11 AM - 7 PM',
    rating: 4.8,
    logoLink: 'https://placehold.co/300x200.png', // Changed from image
    dataAiHint: 'matcha cafe',
    state: 'Kuala Lumpur',
    tags: ['Minimalist', 'Popular', 'High Quality Matcha'],
    halalStatus: 'Muslim Friendly',
    socialMediaLinks: {
      website: 'https://www.nikonekomatcha.com',
      instagram: 'https://www.instagram.com/nikonekomatcha',
    },
  },
  {
    id: '2',
    name: 'Oh Cha Matcha (TTDI)',
    address: '130, Jalan Burhanuddin Helmi, Taman Tun Dr Ismail, 60000 Kuala Lumpur',
    latitude: 3.1399,
    longitude: 101.6287,
    openingHours: '10 AM - 8 PM',
    rating: 4.5,
    logoLink: 'https://placehold.co/300x200.png', // Changed from image
    dataAiHint: 'cafe interior',
    state: 'Kuala Lumpur',
    tags: ['Healthy Options', 'Aesthetic', 'Vegan Friendly'],
    halalStatus: 'Muslim Friendly',
    socialMediaLinks: {
      website: 'https://ohchamatcha.com',
      instagram: 'https://www.instagram.com/ohchamatcha.kl',
    },
  },
  {
    id: '3',
    name: 'Matcha Hero Kyoto (Pavilion KL)',
    address: 'Lot P6 . 16 . 00, 168, Jln Bukit Bintang, Bukit Bintang, 55100 Kuala Lumpur',
    latitude: 3.1485,
    longitude: 101.7136,
    openingHours: '10 AM - 10 PM',
    rating: 4.2,
    logoLink: 'https://placehold.co/300x200.png', // Changed from image
    dataAiHint: 'matcha drink',
    state: 'Kuala Lumpur',
    tags: ['Authentic Japanese', 'Shopping Mall'],
    halalStatus: 'Not Specified',
    socialMediaLinks: {
      facebook: 'https://www.facebook.com/matchaherokyoto/',
    },
  },
  {
    id: '4',
    name: 'HEJO STICKY (Ara Damansara)',
    address: '36F, Jalan PJU 1A/20A Ara Damansara 47301 Petaling Jaya, Selangor',
    latitude: 3.1139,
    longitude: 101.5828,
    openingHours: '9 AM - 6 PM',
    rating: 4.0,
    logoLink: 'https://placehold.co/300x200.png', // Changed from image
    dataAiHint: 'coffee shop',
    state: 'Selangor',
    tags: ['Work Friendly', 'Pastries'],
    halalStatus: 'Not Specified',
    socialMediaLinks: {
      website: 'https://hejosticky.com',
      instagram: 'https://www.instagram.com/hejosticky/',
    },
  },
  {
    id: '5',
    name: 'Maccha Iki (Pandan Indah)',
    address: 'No.27G, Jalan Pandan Indah 4/6A, Pandan Indah, 55100 Kuala Lumpur',
    latitude: 3.1300,
    longitude: 101.7500,
    openingHours: '12 PM - 9 PM',
    rating: 3.8,
    logoLink: 'https://placehold.co/300x200.png', // Changed from image
    dataAiHint: 'matcha dessert',
    state: 'Kuala Lumpur',
    tags: ['Desserts', 'Casual'],
    halalStatus: 'Not Specified',
  },
  {
    id: '6',
    name: 'The Tokyo Restaurant (Lot 10)',
    address: 'Isetan The Japan Store, Lot 10 Shopping Centre, 50, Jln Sultan Ismail, 50250 Kuala Lumpur',
    latitude: 3.1466,
    longitude: 101.7119,
    openingHours: '11 AM - 11 PM',
    rating: 4.6,
    logoLink: 'https://placehold.co/300x200.png', // Changed from image
    dataAiHint: 'modern restaurant',
    state: 'Kuala Lumpur',
    tags: ['Famous Cheesecake', 'Japanese Fusion', 'Elegant'],
    halalStatus: 'Non Halal',
    socialMediaLinks: {
      website: 'https://www.thetokyorestaurant.com/',
      instagram: 'https://www.instagram.com/thetokyorestaurant/',
    },
  },
  {
    id: '7',
    name: 'Serene Matcha Spot (Fictional)',
    address: '15, Jalan Hijau, Taman Damai, 50480 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur',
    latitude: 3.1600,
    longitude: 101.7000,
    openingHours: '10 AM - 9 PM',
    rating: 4.3,
    logoLink: 'https://placehold.co/300x200.png', // Changed from image
    dataAiHint: 'zen garden',
    state: 'Kuala Lumpur',
    tags: ['Quiet', 'Reading Spot', 'Muslim Friendly'],
    halalStatus: 'Muslim Friendly',
  },
  {
    id: '8',
    name: 'Matcha Time JB (Johor Bahru)',
    address: '123, Jalan Dhoby, Bandar Johor Bahru, 80000 Johor Bahru, Johor',
    latitude: 1.4578,
    longitude: 103.7634,
    openingHours: '10 AM - 10 PM',
    rating: 4.4,
    logoLink: 'https://placehold.co/300x200.png', // Changed from image
    dataAiHint: 'cafe exterior',
    state: 'Johor',
    tags: ['Trendy', 'Young Crowd', 'Instagrammable'],
    halalStatus: 'Not Specified',
    socialMediaLinks: {
      instagram: 'https://www.instagram.com/matchatimejb',
    },
  },
  {
    id: '9',
    name: 'Penang Matcha House (George Town)',
    address: '45, Lebuh Chulia, George Town, 10200 George Town, Pulau Pinang',
    latitude: 5.4184,
    longitude: 100.3355,
    openingHours: '9 AM - 6 PM',
    rating: 4.7,
    logoLink: 'https://placehold.co/300x200.png', // Changed from image
    dataAiHint: 'heritage building',
    state: 'Penang',
    tags: ['Heritage', 'Artisan', 'Specialty Drinks'],
    halalStatus: 'Muslim Friendly',
    socialMediaLinks: {
      website: 'https://penangmatchahouse.com',
      facebook: 'https://www.facebook.com/PenangMatchaHouse',
    },
  },
];
