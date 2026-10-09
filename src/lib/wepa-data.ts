export type DemoRole = "nurse" | "hospital" | "tourism";

export type DemoOffer = {
  id: string;
  partner: string;
  title: string;
  category: string;
  location: string;
  retail: number;
  price: number;
  description: string;
  selected: boolean;
};

export type DemoGig = {
  id: string;
  hospital: string;
  city: string;
  title: string;
  specialty: string;
  pay: number;
  duration: number;
  shift: string;
  start: string;
  match: number;
  description: string;
  benefits: string[];
};

export const demoOffers: DemoOffer[] = [
  {
    id: "stay",
    partner: "O:live Boutique Hotel",
    title: "First month waterfront stay",
    category: "Stay",
    location: "Condado, San Juan",
    retail: 4200,
    price: 900,
    description: "A furnished suite, breakfast, and welcome concierge for arriving nurses.",
    selected: true,
  },
  {
    id: "wheels",
    partner: "Modo Caribe",
    title: "Island wheels for 30 days",
    category: "Mobility",
    location: "Metro area",
    retail: 1180,
    price: 0,
    description: "A compact car, airport pickup, insurance, and toll pass included.",
    selected: true,
  },
  {
    id: "weekend",
    partner: "Vela Vieques",
    title: "Bioluminescent weekend escape",
    category: "Experience",
    location: "Vieques",
    retail: 740,
    price: 180,
    description: "Two nights, ferry transfer, and a guided bio-bay paddle for two.",
    selected: true,
  },
  {
    id: "wellness",
    partner: "Cloud Spa El Yunque",
    title: "Shift-reset wellness pass",
    category: "Wellness",
    location: "Río Grande",
    retail: 560,
    price: 95,
    description: "Four recovery sessions with massage, hydrotherapy, and rainforest access.",
    selected: false,
  },
];

export const demoGigs: DemoGig[] = [
  {
    id: "cardio-san-juan",
    hospital: "Centro Médico del Caribe",
    city: "San Juan",
    title: "Cardiac ICU, with an island built in",
    specialty: "ICU / Critical Care",
    pay: 2450,
    duration: 13,
    shift: "3 × 12 nights",
    start: "Nov 17",
    match: 94,
    description: "Join a high-acuity cardiac team and spend your off-days discovering Puerto Rico.",
    benefits: ["30-day waterfront stay", "Car + airport pickup", "Vieques weekend"],
  },
  {
    id: "er-ponce",
    hospital: "Hospital del Sur",
    city: "Ponce",
    title: "ER adventure on the south coast",
    specialty: "Emergency Room",
    pay: 2280,
    duration: 12,
    shift: "3 × 12 rotating",
    start: "Dec 1",
    match: 87,
    description: "Fast-moving emergency care, a supportive bilingual team, and Caribbean weekends.",
    benefits: ["Furnished studio", "Local food passport", "Surf lesson pack"],
  },
  {
    id: "nicu-mayaguez",
    hospital: "Hospital Buen Samaritano",
    city: "Mayagüez",
    title: "NICU care, west-coast sunsets",
    specialty: "NICU",
    pay: 2360,
    duration: 13,
    shift: "3 × 12 days",
    start: "Jan 5",
    match: 81,
    description: "Bring your neonatal expertise to Puerto Rico's laid-back western coast.",
    benefits: ["Ocean-view apartment", "Weekend car access", "Coffee farm tour"],
  },
];

export const qualificationSteps = [
  { id: "profile", title: "Clinical profile", detail: "Specialty, experience, and availability", done: true },
  { id: "license", title: "License readiness", detail: "Current license and Puerto Rico pathway", done: true },
  { id: "credentials", title: "Credentials", detail: "BLS/ACLS and key certifications", done: true },
  { id: "documents", title: "Document packet", detail: "Identity, resume, and references", done: false },
  { id: "language", title: "Language snapshot", detail: "Patient-care communication comfort", done: false },
];
