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
  image?: string; hospitalPitch?: string; area?: string; areaHighlights?: string[]; region?: string; photoCredit?: string;
  service?: boolean; serviceFocus?: string;
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

import caribeHiltonImg from "@/assets/partners/caribe-hilton.jpg";
import laConchaImg from "@/assets/partners/la-concha.jpg";
import doradoBeachImg from "@/assets/partners/dorado-beach.jpg";
import elConquistadorImg from "@/assets/partners/el-conquistador.jpg";
import eastIslandImg from "@/assets/partners/east-island.jpg";
import bioBayImg from "@/assets/partners/bio-bay.jpg";
import toroVerdeImg from "@/assets/partners/toro-verde.jpg";
import casaBacardiImg from "@/assets/partners/casa-bacardi.jpg";
import copamarinaImg from "@/assets/partners/copamarina.jpg";
import villaMontanaImg from "@/assets/partners/villa-montana.jpg";

export type DemoPartner = {
  name: string;
  category: "Hotel" | "Adventure" | "Spa & Wellness" | "Beach & Sailing" | "Food & Culture";
  location: string;
  blurb: string;
  perk: string;
  image: string;
};

// Real Puerto Rico travel & tourism partners featured in the marketplace.
export const demoPartners: DemoPartner[] = [
  {
    name: "Caribe Hilton",
    image: caribeHiltonImg,
    category: "Hotel",
    location: "San Juan",
    blurb: "The iconic beachfront resort where the piña colada was born — private beach, pools, and ten minutes from the metro hospitals.",
    perk: "Monthly nurse rate on ocean-view rooms",
  },
  {
    name: "La Concha Renaissance",
    image: laConchaImg,
    category: "Hotel",
    location: "Condado, San Juan",
    blurb: "Condado's landmark resort with a casino, oceanfront pools, and the liveliest beach strip on the island.",
    perk: "Weekend suite upgrades for gig packages",
  },
  {
    name: "Dorado Beach, a Ritz-Carlton Reserve",
    image: doradoBeachImg,
    category: "Hotel",
    location: "Dorado",
    blurb: "Ultra-luxury beachfront reserve on a former Rockefeller estate — the island's most storied coastline.",
    perk: "Spa & beach day passes for completed contracts",
  },
  {
    name: "El Conquistador Resort",
    image: elConquistadorImg,
    category: "Hotel",
    location: "Fajardo",
    blurb: "Cliff-top resort with its own private island, Palomino, reached by catamaran from the marina below.",
    perk: "Palomino Island day escapes",
  },
  {
    name: "East Island Excursions",
    image: eastIslandImg,
    category: "Beach & Sailing",
    location: "Fajardo",
    blurb: "Catamaran day sails to Cayo Icacos and Culebra — snorkeling, lunch, and open bar on the water.",
    perk: "Monthly catamaran seats in every package",
  },
  {
    name: "Kayaking Puerto Rico",
    image: bioBayImg,
    category: "Adventure",
    location: "Fajardo & Vieques",
    blurb: "Guided night paddles through the brightest bioluminescent bays in the world.",
    perk: "Bio-bay nights for two, every rotation",
  },
  {
    name: "Toro Verde Adventure Park",
    image: toroVerdeImg,
    category: "Adventure",
    location: "Orocovis",
    blurb: "Home of The Monster — one of the longest ziplines on Earth — deep in the central mountains.",
    perk: "Zipline day trips between shifts",
  },
  {
    name: "Casa Bacardí",
    image: casaBacardiImg,
    category: "Food & Culture",
    location: "Cataño",
    blurb: "The Cathedral of Rum — distillery tours, mixology classes, and sunset views across the bay to Old San Juan.",
    perk: "Welcome-week mixology class",
  },
  {
    name: "Copamarina Beach Resort & Spa",
    image: copamarinaImg,
    category: "Spa & Wellness",
    location: "Guánica",
    blurb: "South-coast hideaway on the edge of the Guánica Dry Forest with a full spa and calm Caribbean coves.",
    perk: "Shift-reset spa weekends",
  },
  {
    name: "Villa Montaña Beach Resort",
    image: villaMontanaImg,
    category: "Beach & Sailing",
    location: "Isabela",
    blurb: "Barefoot-luxury villas on three miles of west-coast beach — surf, horses, and legendary sunsets.",
    perk: "West-coast surf & stay weekends",
  },
];

import { PR_GIGS, PR_HOSPITALS } from "@/lib/pr-hospitals";
/** Nurse-facing gig search: real PR hospitals, fictional gigs. */
export const islandGigs: DemoGig[] = PR_GIGS.map((g) => {
  const h = PR_HOSPITALS.find((x) => x.id === g.hospitalId)!;
  return { ...g, hospital: h.name, city: h.town, image: h.image, hospitalPitch: h.pitch, area: h.area, areaHighlights: h.areaHighlights, region: h.region, photoCredit: h.photoCredit };
});
