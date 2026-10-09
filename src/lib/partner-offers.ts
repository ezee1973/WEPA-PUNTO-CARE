import { useCallback, useEffect, useState } from "react";
import { boostRank, type BoostId } from "@/lib/business";
import {
  LOCATIONS,
  PERKS,
  offerOf,
  registerPartnerOffers,
  type LocationId,
  type OfferType,
  type Perk,
  type PerkCategory,
  type PerkOffer,
} from "@/lib/hospital-data";
import heroImage from "@/assets/hospital-hero.jpg";
import coastImg from "@/assets/puerto-rico-coast.jpg";
import hiltonImg from "@/assets/partners/caribe-hilton.jpg";
import villaImg from "@/assets/partners/villa-montana.jpg";
import eastImg from "@/assets/partners/east-island.jpg";
import bioImg from "@/assets/partners/bio-bay.jpg";
import toroImg from "@/assets/partners/toro-verde.jpg";
import bacardiImg from "@/assets/partners/casa-bacardi.jpg";
import spaImg from "@/assets/partners/copamarina.jpg";
import doradoImg from "@/assets/partners/dorado-beach.jpg";
import conqImg from "@/assets/partners/el-conquistador.jpg";
import laConchaImg from "@/assets/partners/la-concha.jpg";
import coffeeImg from "@/assets/partners/coffee-hacienda.jpg";
import surfImg from "@/assets/partners/rincon-surf.jpg";
import driveImg from "@/assets/partners/coastal-drive.jpg";
import foodImg from "@/assets/partners/island-food.jpg";

/* ---------- More real island partners (synthetic deals) ---------- */
PERKS.push(
  { id: "la-concha-week", title: "Condado oceanfront week at La Concha", partner: "La Concha Resort", category: "Housing", retail: 2400, cost: 900, locations: ["san-juan"] },
  { id: "el-conquistador-weekend", title: "Cliffside weekend + Palomino Island", partner: "El Conquistador Resort", category: "Housing", retail: 1300, cost: 420, locations: ["fajardo"] },
  { id: "villa-montana-stay", title: "Beach villa nights in Isabela", partner: "Villa Montaña Beach Resort", category: "Housing", retail: 1600, cost: 600, locations: ["aguadilla"] },
  { id: "dorado-ritz", title: "Ritz-Carlton Reserve spa afternoon", partner: "Dorado Beach, a Ritz-Carlton Reserve", category: "Wellness", retail: 950, cost: 380, locations: ["dorado"] },
  { id: "bacardi-mixology", title: "Mixology class at Casa Bacardí", partner: "Casa Bacardí", category: "Food & Culture", retail: 150, cost: 45, locations: ["san-juan", "dorado"] },
  { id: "old-sj-food", title: "Old San Juan food walk", partner: "Flavors of San Juan", category: "Food & Culture", retail: 110, cost: 35, locations: ["san-juan"] },
  { id: "pinones-bike", title: "Piñones bike & kiosko trail", partner: "Piñones Bike Tours", category: "Food & Culture", retail: 85, cost: 25, locations: ["san-juan"] },
  { id: "ponce-museum", title: "Museo de Arte de Ponce + Castillo Serrallés", partner: "Ponce Tourism", category: "Food & Culture", retail: 70, cost: 15, locations: ["ponce"] },
  { id: "hacienda-buena-vista", title: "Hacienda Buena Vista coffee estate tour", partner: "Para la Naturaleza", category: "Food & Culture", retail: 60, cost: 15, locations: ["ponce", "utuado"] },
  { id: "toro-verde-family", title: "Toro Verde family adventure day", partner: "Toro Verde Adventure Park", category: "Family", retail: 380, cost: 140, locations: ["utuado", "san-juan", "ponce"] },
  { id: "kids-science", title: "Kids pass: Museo del Niño & Parque de las Ciencias", partner: "Museo del Niño", category: "Family", retail: 140, cost: 40, locations: ["san-juan"] },
  { id: "icacos-snorkel", title: "Icacos snorkel & picnic sail", partner: "Salty Pirates Tours", category: "Adventure", retail: 190, cost: 60, locations: ["fajardo", "san-juan"] },
  { id: "rincon-yoga", title: "Rincón sunrise yoga pack", partner: "Rincón Yoga", category: "Wellness", retail: 180, cost: 50, locations: ["aguadilla", "mayaguez"] },
  { id: "jeep-tour", title: "Island road-trip Jeep weekend", partner: "Charlie Car Rental", category: "Mobility", retail: 420, cost: 170, locations: "all" },
  { id: "seaborne-hop", title: "Culebra & Vieques island hop flight", partner: "Cape Air", category: "Travel", retail: 260, cost: 120, locations: ["fajardo", "san-juan"] },
);

const NEW_TERMS: Record<string, PerkOffer> = {
  "la-concha-week": { offerType: "Limited time", headline: "Nurse week at 60% off", endsAt: "2026-12-18" },
  "el-conquistador-weekend": { offerType: "Special", headline: "Free Palomino ferry", requirement: "Resort poster in the ED break room" },
  "dorado-ritz": { offerType: "Special", headline: "Care for caregivers", requirement: "Logo on your careers page" },
  "old-sj-food": { offerType: "Limited time", headline: "Holiday tasting 2-for-1", endsAt: "2026-12-31" },
  "toro-verde-family": { offerType: "Special", headline: "Kids ride free", requirement: "Flyer in the pediatric wing" },
  "jeep-tour": { offerType: "Limited time", headline: "Weekend Jeep for $99", endsAt: "2027-01-15" },
  "rincon-yoga": { offerType: "Standard", headline: "Shift-reset sunrise flow" },
};

/* ---------- Images ---------- */
const CAT_IMG: Record<PerkCategory, string[]> = {
  Housing: [hiltonImg, villaImg, doradoImg, conqImg, laConchaImg],
  Travel: [coastImg, conqImg, driveImg],
  Mobility: [driveImg, coastImg],
  Adventure: [bioImg, toroImg, eastImg, surfImg, conqImg],
  Wellness: [spaImg, doradoImg, surfImg],
  "Food & Culture": [bacardiImg, foodImg, coffeeImg],
  Family: [toroImg, villaImg, coastImg],
  Professional: [heroImage],
};
const ID_IMG: Record<string, string> = {
  "hilton-month": hiltonImg, "la-concha-week": laConchaImg, "el-conquistador-weekend": conqImg, "villa-montana-stay": villaImg,
  "dorado-ritz": doradoImg, "dorado-spa": doradoImg, spa: spaImg, bacardi: bacardiImg, "bacardi-mixology": bacardiImg,
  zipline: toroImg, "toro-verde-family": toroImg, catamaran: eastImg, biobay: bioImg, "lajas-biobay": bioImg, surf: surfImg,
  "rincon-yoga": surfImg, "coffee-casita": coffeeImg, "jayuya-coffee": coffeeImg, "hacienda-buena-vista": coffeeImg, "eco-lodge": coffeeImg,
  "car-month": driveImg, "car-contract": driveImg, "4x4": driveImg, "jeep-tour": driveImg, "old-sj-food": foodImg, "guavate-lechon": foodImg,
};
export function hash(s: string) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return Math.abs(h);
}
export function perkImage(p: Perk) {
  if (p.image) return p.image;
  if (ID_IMG[p.id]) return ID_IMG[p.id]!;
  const l = CAT_IMG[p.category];
  return l[hash(p.id) % l.length]!;
}
export const SAMPLE_IMAGES = [laConchaImg, conqImg, villaImg, doradoImg, spaImg, bioImg, toroImg, eastImg, surfImg, coffeeImg, foodImg, driveImg, bacardiImg, coastImg];

/* ---------- Directory model ---------- */
export type DirectoryOffer = Perk & PerkOffer & {
  region: string; towns: string; image: string; pitch: string; perkPitch: string; included: string[];
  capacity: number; free: boolean; stats: { views: number; saves: number; hospitalAdds: number; nurseInterest: number; trend: number };
  status: OfferStatus;
  boost?: BoostId | undefined;
};
export type OfferStatus = "Draft" | "Live" | "Paused" | "Ended";

const INTERNAL = new Set(["Your facility", "Your EAP", "WEPA logistics"]);
const PITCH: Record<PerkCategory, [string, string, string[]]> = {
  Housing: ["A home base nurses brag about — real island living between shifts.", "Your stay is part of your gig package — less to pay, more to enjoy.", ["Furnished stay", "Wi-Fi & laundry", "Local host welcome"]],
  Travel: ["Get nurses to the island with less friction from day one.", "Travel sorted before you land.", ["Booking support", "Flexible dates"]],
  Mobility: ["The island opens up with wheels — beaches, mountains and towns on days off.", "Explore on your own schedule.", ["Insurance basics", "Airport pickup option"]],
  Adventure: ["A signature Puerto Rico moment nurses post about for weeks.", "Your day-off adventure is already booked.", ["Guide & gear", "Small group", "Photos on request"]],
  Wellness: ["Recovery after twelve-hour shifts — the perk nurses value most.", "Reset between shifts — on us.", ["Treatment or class", "Facility access"]],
  "Food & Culture": ["Taste the real island — the stories, flavors and people.", "Eat, sip and learn like a local.", ["Tastings", "Local guide"]],
  Family: ["Make the island work for nurses who travel with kids or partners.", "Your family's island days, covered.", ["Family tickets", "Kid-friendly schedule"]],
  Professional: ["Professional growth while on the island.", "Grow your career while you're here.", ["Course access"]],
};

function regionFor(locs: LocationId[] | "all") {
  if (locs === "all") return { region: "Island-wide", towns: "All of Puerto Rico" };
  const ls = LOCATIONS.filter((l) => locs.includes(l.id));
  return { region: [...new Set(ls.map((l) => l.region))].join(" · "), towns: ls.map((l) => l.name).join(", ") };
}

export function toDirectory(p: Perk, status: OfferStatus = "Live", extra?: Partial<DirectoryOffer>): DirectoryOffer {
  const o = NEW_TERMS[p.id] ?? offerOf(p.id);
  const [pitch, perkPitch, included] = PITCH[p.category];
  const h = hash(p.id);
  const views = 180 + (h % 2400);
  return {
    ...p, ...o, ...regionFor(p.locations), image: perkImage(p), pitch: p.note ?? pitch, perkPitch, included,
    capacity: 4 + (h % 30), free: p.cost === 0, status,
    stats: { views, saves: Math.round(views * (0.06 + (h % 9) / 100)), hospitalAdds: 1 + (h % 17), nurseInterest: 20 + (h % 80), trend: (h % 61) - 18 },
    ...extra,
  };
}

/** Real-partner catalog (excludes hospital-internal benefits). */
export function baseDirectory() {
  return PERKS.filter((p) => !p.custom && !INTERNAL.has(p.partner)).map((p) => toDirectory(p));
}

export const CATEGORIES: PerkCategory[] = ["Housing", "Travel", "Mobility", "Adventure", "Wellness", "Food & Culture", "Family"];
export const OFFER_TYPES: OfferType[] = ["Standard", "Limited time", "Special"];
export const REGIONS = [...new Set(LOCATIONS.map((l) => l.region)), "Island-wide"];

/* ---------- Partner accounts: real operators, synthetic books ---------- */
export type PartnerAccount = {
  id: string; name: string; category: string; town: string; region: string;
  blurb: string; image: string; card: string; since: string;
};

export const PARTNER_ACCOUNTS: PartnerAccount[] = [
  { id: "east-island", name: "East Island Excursions", category: "Adventure & sailing", town: "Fajardo", region: "East", blurb: "Catamaran day sails and private charters to Icacos and Culebra.", image: eastImg, card: "Corporate Amex ••1043", since: "2024" },
  { id: "la-concha", name: "La Concha Resort", category: "Oceanfront stays", town: "Condado, San Juan", region: "Metro", blurb: "Mid-century beachfront rooms steps from the Condado strip.", image: laConchaImg, card: "Corporate Visa ••2280", since: "2023" },
  { id: "toro-verde", name: "Toro Verde Adventure Park", category: "Adventure park", town: "Orocovis", region: "Mountain", blurb: "The Monster zipline and canopy tours over the central mountains.", image: toroImg, card: "Corporate Mastercard ••7712", since: "2025" },
  { id: "casa-bacardi", name: "Casa Bacardí", category: "Rum & culture", town: "Cataño", region: "Metro", blurb: "Mixology classes, tastings and private events across the bay.", image: bacardiImg, card: "Corporate Amex ••4406", since: "2024" },
  { id: "cape-air", name: "Cape Air", category: "Island-hop flights", town: "San Juan", region: "Metro", blurb: "Daily hops to Culebra, Vieques and the western coast.", image: conqImg, card: "Travel account ••9158", since: "2025" },
  { id: "charlie-car", name: "Charlie Car Rental", category: "Car rental", town: "San Juan", region: "Metro", blurb: "Island-wide rentals, delivered to your housing.", image: driveImg, card: "Corporate Visa ••3391", since: "2023" },
  { id: "villa-montana", name: "Villa Montaña Beach Resort", category: "Beach stays", town: "Isabela", region: "West", blurb: "Beachfront villas above the surf at Caño Boynes.", image: villaImg, card: "Corporate Mastercard ••6024", since: "2025" },
  { id: "rincon-yoga", name: "Rincón Yoga", category: "Wellness & surf", town: "Rincón", region: "West", blurb: "Sunrise flows, whale-season sessions and private restore classes.", image: surfImg, card: "Business debit ••5177", since: "2026" },
];

export function partnerAccount(id: string) {
  return PARTNER_ACCOUNTS.find((a) => a.id === id) ?? PARTNER_ACCOUNTS[0]!;
}

/* ---------- Partner store (local, single source for partner-created offers) ---------- */
export type CustomOffer = {
  id: string; title: string; category: PerkCategory; image: string; pitch: string; perkPitch: string; included: string[];
  offerType: OfferType; headline: string; endsAt?: string | undefined; retail: number; cost: number; capacity: number;
  requirement?: string | undefined; locations: LocationId[] | "all"; status: OfferStatus;
};

type Seed = Omit<CustomOffer, "image" | "perkPitch" | "included" | "status"> & {
  perkPitch?: string; included?: string[]; status?: OfferStatus;
};

const OPERATOR_SEEDS: Record<string, Seed[]> = {
  "east-island": [
    { id: "ei-sunset-sail", title: "Sunset catamaran sail to Icacos", category: "Adventure", pitch: "Golden-hour sail from Fajardo with a snorkel stop and open bar.", headline: "First-week celebration 50% off", offerType: "Limited time", endsAt: "2026-12-31", retail: 220, cost: 80, capacity: 24, requirement: "Poster in nurses' station", locations: ["fajardo", "san-juan"], status: "Live" },
    { id: "ei-morning-snorkel", title: "Morning Icacos snorkel run", category: "Adventure", pitch: "Beat the crowds with an early catamaran run to the reef.", perkPitch: "Your Tuesday off, sorted.", headline: "Nurse rate every Tuesday", offerType: "Standard", retail: 190, cost: 60, capacity: 30, locations: ["fajardo"], status: "Live" },
    { id: "ei-biobay-paddle", title: "Bio-bay night paddle for two", category: "Adventure", pitch: "Paddle the bioluminescent bay after dark — the night nurses post about.", headline: "Bring a buddy, one paddle free", offerType: "Special", retail: 160, cost: 55, capacity: 20, requirement: "Mention in nurse onboarding email", locations: ["fajardo", "san-juan"], status: "Live" },
    { id: "ei-culebra-private", title: "Private Culebra day trip for teams", category: "Adventure", pitch: "Take a nurse travel team to Flamenco Beach by private boat.", perkPitch: "Your whole team, one private island day.", headline: "Team rate for 6+", offerType: "Special", retail: 1400, cost: 600, capacity: 3, requirement: "Logo on hospital partner page", locations: ["fajardo"], status: "Draft" },
  ],
  "la-concha": [
    { id: "lc-nurse-week", title: "Nurse week on the Condado beachfront", category: "Housing", pitch: "Seven nights in a mid-century ocean-view room, steps from the strip.", perkPitch: "Your week on the beach, already discounted.", headline: "60% off for contracted nurses", offerType: "Limited time", endsAt: "2026-12-18", retail: 2400, cost: 900, capacity: 8, locations: ["san-juan"], status: "Live" },
    { id: "lc-weekend-two", title: "Weekend for two, ocean view", category: "Housing", pitch: "Two nights for the partner who came along, with breakfast on the terrace.", perkPitch: "A weekend for two, on the island.", headline: "Check in after your last shift", offerType: "Standard", retail: 620, cost: 280, capacity: 12, locations: ["san-juan"], status: "Live" },
    { id: "lc-caregivers-spa", title: "Care-for-caregivers spa credit", category: "Wellness", pitch: "A $150 credit toward the poolside spa — the reset after a week of nights.", perkPitch: "A spa credit waiting in your room.", headline: "$150 spa credit with any stay", offerType: "Special", retail: 300, cost: 150, capacity: 25, requirement: "Logo on hospital partner page", locations: ["san-juan"], status: "Live" },
    { id: "lc-monthly", title: "Monthly long-stay rate", category: "Housing", pitch: "Thirty nights with weekly housekeeping for nurses on a full contract.", headline: "30+ nights, weekly housekeeping", offerType: "Standard", retail: 5200, cost: 2600, capacity: 4, locations: ["san-juan"], status: "Paused" },
  ],
  "toro-verde": [
    { id: "tv-monster", title: "Ride The Monster zipline", category: "Adventure", pitch: "One of the world's longest ziplines, over the central mountain valley.", perkPitch: "Scream over the mountains on your day off.", headline: "Nurse rate any weekday", offerType: "Standard", retail: 220, cost: 70, capacity: 40, locations: ["utuado", "san-juan", "ponce"], status: "Live" },
    { id: "tv-family-day", title: "Family adventure day", category: "Family", pitch: "A full park day for the nurse, the kids and whoever came along.", perkPitch: "Your family's island adventure day.", headline: "Kids ride free", offerType: "Special", retail: 380, cost: 140, capacity: 15, requirement: "Flyer at employee entrance", locations: ["utuado", "san-juan", "ponce"], status: "Live" },
    { id: "tv-night-zipline", title: "Night zipline & zip-through", category: "Adventure", pitch: "Canopy lines lit after dark — a different mountain entirely.", perkPitch: "One night, a different mountain.", headline: "Full-moon weekend 30% off", offerType: "Limited time", endsAt: "2027-01-15", retail: 290, cost: 110, capacity: 10, locations: ["utuado"], status: "Live" },
  ],
  "casa-bacardi": [
    { id: "cb-mixology", title: "Mixology class with rum tasting", category: "Food & Culture", pitch: "Shake, stir and taste across the bay from Old San Juan.", perkPitch: "Learn to shake the island's drink.", headline: "Nurse rate at every seating", offerType: "Standard", retail: 150, cost: 45, capacity: 60, locations: ["san-juan", "dorado"], status: "Live" },
    { id: "cb-rum-101", title: "Rum 101 tasting flight", category: "Food & Culture", pitch: "A guided flight from white to barrel-aged, with a local host.", perkPitch: "Four pours, one afternoon.", headline: "Two flights, one price", offerType: "Limited time", endsAt: "2026-11-30", retail: 90, cost: 30, capacity: 40, locations: ["san-juan"], status: "Live" },
    { id: "cb-team-night", title: "Private team mixology night", category: "Food & Culture", pitch: "Close the room for your unit for an evening of classes and music.", perkPitch: "Your unit, one private night.", headline: "Free room rental with 10 nurses", offerType: "Special", retail: 1800, cost: 700, capacity: 2, requirement: "Logo on hospital partner page", locations: ["san-juan"], status: "Draft" },
  ],
  "cape-air": [
    { id: "ca-island-hop", title: "Culebra & Vieques island hop", category: "Travel", pitch: "Nine minutes in the air instead of a ferry queue — daily from SJU.", perkPitch: "Your island day, nine minutes away.", headline: "Nurse fare, round trip", offerType: "Standard", retail: 260, cost: 120, capacity: 20, locations: ["fajardo", "san-juan"], status: "Live" },
    { id: "ca-family-seat", title: "Family seat add-on", category: "Travel", pitch: "Add a traveler to any nurse itinerary at a reduced fare.", perkPitch: "Bring someone along for less.", headline: "Add a traveler for less", offerType: "Standard", retail: 210, cost: 95, capacity: 15, locations: ["san-juan"], status: "Live" },
    { id: "ca-open-jaw", title: "Open-jaw mainland connect", category: "Travel", pitch: "Fly home from a different city so a road trip fits the contract.", headline: "Free change window", offerType: "Special", retail: 480, cost: 240, capacity: 10, locations: ["san-juan"], status: "Paused" },
  ],
  "charlie-car": [
    { id: "cc-jeep-weekend", title: "Weekend Jeep for $99", category: "Mobility", pitch: "Pick up a soft-top Jeep Friday, hand it back Monday.", perkPitch: "Your weekend, with a roof down.", headline: "Weekend Jeep for $99", offerType: "Limited time", endsAt: "2027-01-15", retail: 420, cost: 99, capacity: 12, locations: "all", status: "Live" },
    { id: "cc-compact-week", title: "Compact car, first week", category: "Mobility", pitch: "A compact delivered to your housing before your first shift.", perkPitch: "Wheels before your first shift.", headline: "Delivered to your housing", offerType: "Standard", retail: 329, cost: 149, capacity: 25, locations: "all", status: "Live" },
    { id: "cc-mountain-4x4", title: "Mountain 4×4 package", category: "Mobility", pitch: "High-clearance 4×4 for the Utuado and Jayuya back roads.", perkPitch: "Take the mountain road.", headline: "Free roof rack and cooler", offerType: "Special", retail: 4600, cost: 1900, capacity: 6, requirement: "Poster in nurses' station", locations: ["utuado", "ponce"], status: "Live" },
  ],
  "villa-montana": [
    { id: "vm-villa-nights", title: "Beach villa nights in Isabela", category: "Housing", pitch: "Beachfront villa nights above the surf at Caño Boynes.", perkPitch: "Wake up above the surf.", headline: "3 nights, pay for 2", offerType: "Limited time", endsAt: "2026-12-20", retail: 1600, cost: 600, capacity: 6, locations: ["aguadilla"], status: "Live" },
    { id: "vm-surf-stay", title: "Surf and stay package", category: "Housing", pitch: "Villa nights bundled with lessons from the school below the hill.", perkPitch: "Stay, and learn to surf.", headline: "Free lesson with 5 nights", offerType: "Special", retail: 900, cost: 420, capacity: 8, requirement: "Flyer at employee entrance", locations: ["aguadilla"], status: "Live" },
    { id: "vm-monthly", title: "Monthly nurse rate", category: "Housing", pitch: "A month in a villa for nurses on a 13-week contract.", headline: "13-week contract rate", offerType: "Standard", retail: 3400, cost: 1500, capacity: 3, locations: ["aguadilla"], status: "Draft" },
  ],
  "rincon-yoga": [
    { id: "ry-sunrise", title: "Sunrise yoga pack (5 sessions)", category: "Wellness", pitch: "Beach-side flows before the wind comes up — all levels welcome.", perkPitch: "Reset before your shift.", headline: "Shift-reset rate", offerType: "Standard", retail: 180, cost: 50, capacity: 30, locations: ["aguadilla", "mayaguez"], status: "Live" },
    { id: "ry-whales", title: "Whale-watch sunset flow", category: "Wellness", pitch: "A boat-side flow with humpbacks breaking in the bay, January to March.", perkPitch: "Flow with the whales in the bay.", headline: "January to March only", offerType: "Limited time", endsAt: "2027-03-31", retail: 210, cost: 70, capacity: 14, locations: ["mayaguez", "aguadilla"], status: "Live" },
    { id: "ry-private-restore", title: "Private restore session for teams", category: "Wellness", pitch: "A private restorative hour on the sand for a unit after a hard stretch.", perkPitch: "An hour of quiet for your unit.", headline: "Free with 6 bookings", offerType: "Special", retail: 600, cost: 250, capacity: 4, locations: ["aguadilla"], status: "Draft" },
  ],
};

/** Some accounts already pay for placement when the demo opens. */
export const ACCOUNT_BOOSTS: Record<string, Record<string, BoostId>> = {
  "east-island": { "ei-sunset-sail": "featured" },
  "la-concha": { "lc-nurse-week": "spotlight" },
  "toro-verde": { "tv-monster": "boost" },
  "charlie-car": { "cc-jeep-weekend": "featured" },
};

/** An operator's seeded book of offers. */
export function accountOffers(accountId: string): CustomOffer[] {
  const account = partnerAccount(accountId);
  return (OPERATOR_SEEDS[accountId] ?? []).map((s) => {
    const [pitch, perkPitch, included] = PITCH[s.category];
    const { perkPitch: _p, included: _i, status, ...rest } = s;
    return {
      ...rest,
      pitch: s.pitch || pitch,
      perkPitch: s.perkPitch ?? perkPitch,
      included: s.included ?? included,
      image: account.image,
      status: status ?? "Draft",
    };
  });
}

export type AccountSlice = { offers: CustomOffer[]; boosts: Record<string, BoostId> };
export type PartnerState = { loggedIn: boolean; accountId: string; accounts: Record<string, AccountSlice> };

const KEY = "wepa-partner-v1";
const EVT = "wepa-partner-change";

export const partnerSeed: PartnerState = { loggedIn: false, accountId: "east-island", accounts: {} };

/** The slice for an account, seeded on first read so every operator has a book of offers. */
export function accountSlice(s: PartnerState, accountId = s.accountId): AccountSlice {
  return s.accounts[accountId] ?? { offers: accountOffers(accountId), boosts: ACCOUNT_BOOSTS[accountId] ?? {} };
}

export function customToPerk(c: CustomOffer, partner: string) {
  return {
    perk: { id: c.id, title: c.title, partner, category: c.category, retail: c.retail, cost: c.cost, locations: c.locations, image: c.image, custom: true },
    offer: { offerType: c.offerType, headline: c.headline, endsAt: c.endsAt, requirement: c.requirement },
  };
}
export function customToDirectory(c: CustomOffer, partner: string): DirectoryOffer {
  const { perk, offer } = customToPerk(c, partner);
  const d = toDirectory(perk, c.status, { pitch: c.pitch, perkPitch: c.perkPitch, included: c.included, capacity: c.capacity, image: c.image });
  return { ...d, ...offer, image: c.image };
}

/** Every operator's live offers reach the hospital perk menu, whoever is logged in. */
function sync(s: PartnerState) {
  const list: { perk: Perk; offer: PerkOffer }[] = [];
  for (const a of PARTNER_ACCOUNTS) {
    const slice = accountSlice(s, a.id);
    list.push(...slice.offers.filter((o) => o.status === "Live").map((o) => customToPerk(o, a.name)));
  }
  registerPartnerOffers(list);
}
sync(partnerSeed);

type LegacyState = { loggedIn?: boolean; offers?: CustomOffer[]; boosts?: Record<string, BoostId> };
function isLegacyState(v: unknown): v is LegacyState {
  return typeof v === "object" && v !== null && Array.isArray((v as LegacyState).offers);
}

function read(): PartnerState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return partnerSeed;
    const parsed = JSON.parse(raw) as unknown;
    if (isLegacyState(parsed)) {
      return {
        loggedIn: !!parsed.loggedIn,
        accountId: "east-island",
        accounts: { "east-island": { offers: parsed.offers ?? [], boosts: parsed.boosts ?? {} } },
      };
    }
    return { ...partnerSeed, ...(parsed as PartnerState) };
  } catch {
    return partnerSeed;
  }
}

function persist(next: PartnerState) {
  localStorage.setItem(KEY, JSON.stringify(next));
  sync(next);
  window.dispatchEvent(new Event(EVT));
  return next;
}

export function usePartner() {
  const [state, setState] = useState<PartnerState>(partnerSeed);
  useEffect(() => {
    const load = () => { const s = read(); sync(s); setState(s); };
    load();
    window.addEventListener(EVT, load);
    window.addEventListener("storage", load);
    return () => { window.removeEventListener(EVT, load); window.removeEventListener("storage", load); };
  }, []);

  /** Update the signed-in operator's own book of offers. */
  const update = useCallback((fn: (a: AccountSlice) => AccountSlice) => {
    const s = read();
    const next: PartnerState = { ...s, accounts: { ...s.accounts, [s.accountId]: fn(accountSlice(s, s.accountId)) } };
    setState(persist(next));
  }, []);

  const loginAs = useCallback((accountId: string) => {
    const s = read();
    const accounts = { ...s.accounts, [accountId]: s.accounts[accountId] ?? { offers: accountOffers(accountId), boosts: ACCOUNT_BOOSTS[accountId] ?? {} } };
    setState(persist({ ...s, loggedIn: true, accountId, accounts }));
  }, []);

  const logout = useCallback(() => { setState(persist({ ...read(), loggedIn: false })); }, []);
  const reset = useCallback(() => { localStorage.removeItem(KEY); sync(partnerSeed); setState(partnerSeed); window.dispatchEvent(new Event(EVT)); }, []);

  return { state, account: partnerAccount(state.accountId), slice: accountSlice(state), update, loginAs, logout, reset };
}

/** Full directory: the real-partner catalog plus every operator's live offers, boosted first. */
export function fullDirectory(s: PartnerState) {
  const boosts: Record<string, BoostId> = {};
  const owned = new Set<string>();
  const published: DirectoryOffer[] = [];
  for (const a of PARTNER_ACCOUNTS) {
    const slice = accountSlice(s, a.id);
    Object.assign(boosts, slice.boosts);
    for (const o of slice.offers) {
      owned.add(o.id);
      if (o.status === "Live") published.push(customToDirectory(o, a.name));
    }
  }
  const list = [
    ...published,
    ...baseDirectory()
      .filter((d) => !owned.has(d.id))
      .map((d) => (boosts[d.id] ? { ...d, boost: boosts[d.id] } : d)),
  ];
  // Boosted offers rank first; stable order otherwise.
  return list.map((d, i) => ({ d, i })).sort((a, b) => boostRank(b.d.boost) - boostRank(a.d.boost) || a.i - b.i).map((x) => x.d);
}

/** Current boost per offer id across all operators, read straight from storage (for non-hook callers like the hospital perk menu). */
export function currentBoosts(): Record<string, BoostId> {
  if (typeof window === "undefined") return {};
  const out: Record<string, BoostId> = {};
  try {
    const raw = localStorage.getItem(KEY);
    const s: PartnerState = raw ? read() : partnerSeed;
    for (const a of PARTNER_ACCOUNTS) Object.assign(out, accountSlice(s, a.id).boosts);
  } catch {
    return out;
  }
  return out;
}


/* ---------- Trending (deterministic synthetic signals) ---------- */
export function trending(list: DirectoryOffer[]) {
  const live = list.filter((o) => o.status === "Live");
  const byHospital = [...live].sort((a, b) => b.stats.hospitalAdds - a.stats.hospitalAdds || a.id.localeCompare(b.id)).slice(0, 6);
  const byNurse = [...live].sort((a, b) => b.stats.nurseInterest - a.stats.nurseInterest || a.id.localeCompare(b.id)).slice(0, 6);
  const catMap = new Map<string, { count: number; trend: number }>();
  for (const o of live) { const c = catMap.get(o.category) ?? { count: 0, trend: 0 }; c.count++; c.trend += o.stats.trend; catMap.set(o.category, c); }
  const categories = [...catMap.entries()].map(([name, v]) => ({ name, offers: v.count, trend: Math.round(v.trend / v.count) })).sort((a, b) => b.trend - a.trend);
  const regions = LOCATIONS.map((l) => {
    const offers = live.filter((o) => o.locations === "all" || o.locations.includes(l.id)).length;
    const demand = 40 + (hash(l.id) % 60);
    return { id: l.id, name: l.name, region: l.region, offers, demand, gap: Math.max(0, Math.round(demand / 4 - offers)) };
  }).sort((a, b) => b.gap - a.gap || b.demand - a.demand);
  return { byHospital, byNurse, categories, regions };
}
