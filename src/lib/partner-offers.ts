import { useCallback, useEffect, useState } from "react";
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
  { id: "dorado-ritz", title: "Ritz-Carlson Reserve spa afternoon", partner: "Dorado Beach, a Ritz-Carlton Reserve", category: "Wellness", retail: 950, cost: 380, locations: ["dorado"] },
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

Object.assign(
  {},
  // marketing terms for the new partner deals
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

export const DEMO_PARTNER = "East Island Excursions";
export const CATEGORIES: PerkCategory[] = ["Housing", "Travel", "Mobility", "Adventure", "Wellness", "Food & Culture", "Family"];
export const OFFER_TYPES: OfferType[] = ["Standard", "Limited time", "Special"];
export const REGIONS = [...new Set(LOCATIONS.map((l) => l.region)), "Island-wide"];

/* ---------- Partner store (local, single source for partner-created offers) ---------- */
export type CustomOffer = {
  id: string; title: string; category: PerkCategory; image: string; pitch: string; perkPitch: string; included: string[];
  offerType: OfferType; headline: string; endsAt?: string; retail: number; cost: number; capacity: number;
  requirement?: string; locations: LocationId[] | "all"; status: OfferStatus;
};
export type PartnerState = { loggedIn: boolean; offers: CustomOffer[]; statusOverrides: Record<string, OfferStatus> };
const KEY = "wepa-partner-v1";
const EVT = "wepa-partner-change";
export const partnerSeed: PartnerState = {
  loggedIn: false,
  statusOverrides: {},
  offers: [
    {
      id: "partner-sunset-sail", title: "Sunset catamaran sail to Icacos", category: "Adventure", image: eastImg,
      pitch: "Golden-hour sail from Fajardo with snorkel stop and open bar.", perkPitch: "Celebrate your first week with a sunset sail.",
      included: ["4-hour sail", "Snorkel gear", "Drinks & snacks"], offerType: "Limited time", headline: "First-week celebration 50% off",
      endsAt: "2026-12-31", retail: 220, cost: 80, capacity: 24, requirement: "Poster in nurses' station", locations: ["fajardo", "san-juan"], status: "Live",
    },
    {
      id: "partner-culebra-draft", title: "Private Culebra day trip for teams", category: "Adventure", image: conqImg,
      pitch: "Take a nurse travel team to Flamenco Beach by private boat.", perkPitch: "Your whole team, one private island day.",
      included: ["Private boat", "Lunch", "Beach gear"], offerType: "Special", headline: "Team rate for 6+",
      retail: 1400, cost: 600, capacity: 3, requirement: "Logo on hospital partner page", locations: ["fajardo"], status: "Draft",
    },
  ],
};

export function customToPerk(c: CustomOffer): { perk: Perk; offer: PerkOffer } {
  return {
    perk: { id: c.id, title: c.title, partner: DEMO_PARTNER, category: c.category, retail: c.retail, cost: c.cost, locations: c.locations, image: c.image, custom: true },
    offer: { offerType: c.offerType, headline: c.headline, endsAt: c.endsAt, requirement: c.requirement },
  };
}
export function customToDirectory(c: CustomOffer): DirectoryOffer {
  const { perk, offer } = customToPerk(c);
  const d = toDirectory(perk, c.status, { pitch: c.pitch, perkPitch: c.perkPitch, included: c.included, capacity: c.capacity, image: c.image });
  return { ...d, ...offer, image: c.image };
}
function sync(s: PartnerState) {
  registerPartnerOffers(s.offers.filter((o) => o.status === "Live").map(customToPerk));
}
sync(partnerSeed);

function read(): PartnerState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...partnerSeed, ...JSON.parse(raw) } : partnerSeed;
  } catch {
    return partnerSeed;
  }
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
  const update = useCallback((fn: (s: PartnerState) => PartnerState) => {
    const next = fn(read());
    localStorage.setItem(KEY, JSON.stringify(next));
    sync(next);
    setState(next);
    window.dispatchEvent(new Event(EVT));
  }, []);
  const reset = useCallback(() => { localStorage.removeItem(KEY); sync(partnerSeed); setState(partnerSeed); window.dispatchEvent(new Event(EVT)); }, []);
  return { state, update, reset };
}

/** Full directory: real-partner catalog + the demo partner's live offers. */
export function fullDirectory(s: PartnerState) {
  return [
    ...s.offers.filter((o) => o.status === "Live").map(customToDirectory),
    ...baseDirectory().map((d) => (s.statusOverrides[d.id] ? { ...d, status: s.statusOverrides[d.id]! } : d)),
  ];
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
