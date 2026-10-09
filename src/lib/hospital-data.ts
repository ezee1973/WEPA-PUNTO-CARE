import { useEffect, useState } from "react";

// All facilities, nurses and prices below are fictional demo data.

export type LocationId = "san-juan" | "dorado" | "ponce" | "utuado" | "mayaguez" | "fajardo" | "aguadilla";

export type PRLocation = { id: LocationId; name: string; region: string; vibe: string; draws: string[]; housingNote: string };

export const LOCATIONS: PRLocation[] = [
  { id: "san-juan", name: "San Juan", region: "Metro", vibe: "City energy — Old San Juan, Condado beaches, nightlife and food scene.", draws: ["Old San Juan", "Condado beach", "Nightlife", "Airport 15 min"], housingNote: "Condo rentals plentiful; highest rent on the island." },
  { id: "dorado", name: "Dorado", region: "North coast", vibe: "Resort-polished beaches, golf, calm family-friendly coast 30 min from the city.", draws: ["Resort beaches", "Golf", "Family-friendly", "Paddleboard"], housingNote: "Resort villas and gated condos; premium but spacious." },
  { id: "ponce", name: "Ponce", region: "South coast", vibe: "The Pearl of the South — colonial plazas, culture, dry sunny Caribbean coast.", draws: ["Historic plaza", "Caja de Muertos island", "Museums", "Sunny dry weather"], housingNote: "Affordable apartments near downtown." },
  { id: "utuado", name: "Utuado", region: "Central mountains", vibe: "Mountain rainforest, rivers, caves and coffee farms — the island's quiet green heart.", draws: ["Coffee farms", "River & caves", "Rainforest hikes", "Cool nights"], housingNote: "Few rentals — eco-lodges and farm casitas; car is essential." },
  { id: "mayaguez", name: "Mayagüez", region: "West coast", vibe: "University town with west-coast sunsets, surf and island day trips.", draws: ["Sunsets", "Surf nearby", "Desecheo trips", "College town"], housingNote: "Student-market apartments, very affordable." },
  { id: "fajardo", name: "Fajardo", region: "East coast", vibe: "Gateway to Culebra and Vieques — marinas, catamarans and bio-bays.", draws: ["Bio-bay", "Catamarans", "Culebra ferry", "El Yunque 20 min"], housingNote: "Marina condos and resort rooms." },
  { id: "aguadilla", name: "Aguadilla", region: "Northwest", vibe: "Surf capital — Crash Boat beach, cliffs, laid-back surf towns.", draws: ["World-class surf", "Crash Boat", "Cliff diving", "Regional airport"], housingNote: "Beach casitas and Airbnbs, moderate cost." },
];

export type PerkCategory = "Housing" | "Mobility" | "Adventure" | "Wellness" | "Food & Culture" | "Family" | "Professional" | "Travel";

export type Perk = { id: string; title: string; partner: string; category: PerkCategory; retail: number; cost: number; locations: LocationId[] | "all"; note?: string };

const ALL = "all" as const;

export const PERKS: Perk[] = [
  // Housing
  { id: "condo-sj", title: "Furnished Condado condo, full contract", partner: "Island Stay Rentals", category: "Housing", retail: 9800, cost: 4200, locations: ["san-juan"] },
  { id: "hilton-month", title: "First month at Caribe Hilton (nurse rate)", partner: "Caribe Hilton", category: "Housing", retail: 6200, cost: 2100, locations: ["san-juan"] },
  { id: "villa-dorado", title: "Resort villa near Dorado Beach", partner: "Dorado Villas", category: "Housing", retail: 11400, cost: 5200, locations: ["dorado"] },
  { id: "ponce-apt", title: "Downtown Ponce apartment", partner: "Ponce Living", category: "Housing", retail: 5200, cost: 2400, locations: ["ponce"] },
  { id: "eco-lodge", title: "Mountain eco-lodge casita", partner: "Casa Grande Mountain Retreat", category: "Housing", retail: 5600, cost: 1900, locations: ["utuado"], note: "Rare inventory — biggest draw for mountain gigs" },
  { id: "coffee-casita", title: "Coffee-farm guest casita", partner: "Hacienda Pomarrosa", category: "Housing", retail: 4400, cost: 1200, locations: ["utuado"] },
  { id: "mayaguez-apt", title: "Ocean-view apartment, Mayagüez", partner: "Oeste Rentals", category: "Housing", retail: 4600, cost: 2000, locations: ["mayaguez"] },
  { id: "marina-condo", title: "Marina condo, Puerto del Rey", partner: "Puerto del Rey", category: "Housing", retail: 7400, cost: 3300, locations: ["fajardo"] },
  { id: "surf-casita", title: "Beach casita, Jobos", partner: "Isabela Surf Stays", category: "Housing", retail: 5800, cost: 2500, locations: ["aguadilla"] },
  { id: "hospital-housing", title: "Hospital-owned staff housing", partner: "Your facility", category: "Housing", retail: 3600, cost: 0, locations: ALL, note: "Free if you have rooms available" },
  // Travel
  { id: "flight", title: "Round-trip flight from the mainland", partner: "JetBlue partner fare", category: "Travel", retail: 650, cost: 420, locations: ALL },
  { id: "bags", title: "Relocation shipping (2 boxes + checked bags)", partner: "WEPA logistics", category: "Travel", retail: 380, cost: 150, locations: ALL },
  { id: "pickup", title: "Airport welcome pickup", partner: "Your facility", category: "Travel", retail: 120, cost: 0, locations: ALL },
  // Mobility
  { id: "car-month", title: "Rental car, first 30 days", partner: "Modo Caribe", category: "Mobility", retail: 1180, cost: 520, locations: ALL },
  { id: "car-contract", title: "Rental car, full contract", partner: "Modo Caribe", category: "Mobility", retail: 3900, cost: 1900, locations: ALL, note: "Essential in Utuado, Ponce & the west" },
  { id: "4x4", title: "4×4 for mountain roads", partner: "Jeep Rentals PR", category: "Mobility", retail: 4600, cost: 2400, locations: ["utuado"] },
  { id: "tolls", title: "AutoExpreso toll pass loaded", partner: "AutoExpreso", category: "Mobility", retail: 200, cost: 200, locations: ALL },
  { id: "parking", title: "Reserved staff parking", partner: "Your facility", category: "Mobility", retail: 300, cost: 0, locations: ALL },
  // Adventure
  { id: "biobay", title: "Bio-bay night kayak for two", partner: "Kayaking Puerto Rico", category: "Adventure", retail: 180, cost: 60, locations: ["fajardo", "san-juan", "dorado"] },
  { id: "catamaran", title: "Icacos catamaran day sail", partner: "East Island Excursions", category: "Adventure", retail: 260, cost: 90, locations: ["fajardo", "san-juan", "dorado"] },
  { id: "zipline", title: "The Monster zipline at Toro Verde", partner: "Toro Verde Adventure Park", category: "Adventure", retail: 220, cost: 70, locations: ["utuado", "san-juan", "dorado", "ponce"] },
  { id: "caves", title: "Río Camuy caves & river tubing", partner: "Batey Adventures", category: "Adventure", retail: 190, cost: 55, locations: ["utuado", "aguadilla", "mayaguez"] },
  { id: "caja", title: "Caja de Muertos island ferry day", partner: "Island Ventures Ponce", category: "Adventure", retail: 140, cost: 40, locations: ["ponce"] },
  { id: "surf", title: "Surf lesson pack (5 sessions)", partner: "Rincón Surf School", category: "Adventure", retail: 400, cost: 150, locations: ["aguadilla", "mayaguez"] },
  { id: "vieques", title: "Vieques weekend, ferry + 2 nights", partner: "Vela Vieques", category: "Adventure", retail: 740, cost: 180, locations: ["fajardo", "san-juan"] },
  { id: "yunque", title: "Guided El Yunque rainforest hike", partner: "Yunque Guides", category: "Adventure", retail: 120, cost: 30, locations: ["fajardo", "san-juan", "dorado"] },
  { id: "paddle", title: "Paddleboard & beach club pass", partner: "Dorado Beach Club", category: "Adventure", retail: 320, cost: 110, locations: ["dorado"] },
  // Wellness
  { id: "spa", title: "Shift-reset spa weekend", partner: "Copamarina Beach Resort & Spa", category: "Wellness", retail: 560, cost: 190, locations: ["ponce", "mayaguez"] },
  { id: "gym", title: "Gym & yoga membership", partner: "Local studio network", category: "Wellness", retail: 360, cost: 120, locations: ALL },
  { id: "therapy", title: "Telehealth counseling sessions", partner: "Your EAP", category: "Wellness", retail: 600, cost: 0, locations: ALL },
  { id: "dorado-spa", title: "Ritz-Carlton spa day pass", partner: "Dorado Beach Reserve", category: "Wellness", retail: 480, cost: 220, locations: ["dorado"] },
  // Food & culture
  { id: "coffee-tour", title: "Coffee hacienda tour & tasting", partner: "Hacienda San Pedro", category: "Food & Culture", retail: 90, cost: 25, locations: ["utuado", "ponce", "mayaguez"] },
  { id: "bacardi", title: "Casa Bacardí mixology class", partner: "Casa Bacardí", category: "Food & Culture", retail: 110, cost: 40, locations: ["san-juan", "dorado"] },
  { id: "food-tour", title: "Old San Juan food walk", partner: "Flavors of San Juan", category: "Food & Culture", retail: 130, cost: 45, locations: ["san-juan"] },
  { id: "lechonera", title: "Ruta del Lechón weekend", partner: "Guavate guides", category: "Food & Culture", retail: 150, cost: 50, locations: ["san-juan", "ponce", "utuado"] },
  { id: "meal-card", title: "Cafeteria meal card (all shifts)", partner: "Your facility", category: "Food & Culture", retail: 900, cost: 0, locations: ALL },
  { id: "spanish", title: "Clinical Spanish course", partner: "WEPA Learning", category: "Professional", retail: 450, cost: 150, locations: ALL },
  // Professional
  { id: "ceu", title: "CEU credits bundle", partner: "Your facility", category: "Professional", retail: 300, cost: 0, locations: ALL },
  { id: "license-fee", title: "PR license & board fees reimbursed", partner: "Your facility", category: "Professional", retail: 300, cost: 300, locations: ALL },
  { id: "completion", title: "Completion bonus", partner: "Your facility", category: "Professional", retail: 2000, cost: 2000, locations: ALL },
  { id: "extension", title: "Extension bonus (re-sign)", partner: "Your facility", category: "Professional", retail: 1500, cost: 1500, locations: ALL },
  // Family
  { id: "childcare", title: "Childcare stipend", partner: "Your facility", category: "Family", retail: 1600, cost: 1600, locations: ALL },
  { id: "school", title: "Bilingual school enrollment help", partner: "WEPA concierge", category: "Family", retail: 250, cost: 0, locations: ALL },
  { id: "pet", title: "Pet relocation & vet setup", partner: "Island Paws", category: "Family", retail: 500, cost: 200, locations: ALL },
];

export function perksFor(loc: LocationId) {
  return PERKS.filter((p) => p.locations === "all" || p.locations.includes(loc));
}

export type Competitor = { name: string; location: LocationId; weeklyPay: number; perkValue: number };

export const COMPETITORS: Competitor[] = [
  { name: "Hospital Auxilio Mutuo", location: "san-juan", weeklyPay: 1900, perkValue: 6800 },
  { name: "Centro Médico del Caribe", location: "san-juan", weeklyPay: 1850, perkValue: 9200 },
  { name: "Dorado Health Pavilion", location: "dorado", weeklyPay: 1800, perkValue: 11800 },
  { name: "Hospital del Sur", location: "ponce", weeklyPay: 1700, perkValue: 6100 },
  { name: "Hospital San Lucas Ponce", location: "ponce", weeklyPay: 1750, perkValue: 4800 },
  { name: "Hospital Buen Samaritano", location: "aguadilla", weeklyPay: 1650, perkValue: 7200 },
  { name: "Mayagüez Medical Center", location: "mayaguez", weeklyPay: 1700, perkValue: 5400 },
  { name: "HIMA Fajardo", location: "fajardo", weeklyPay: 1750, perkValue: 7900 },
  { name: "Hospital Metropolitano Utuado", location: "utuado", weeklyPay: 1600, perkValue: 5200 },
];

export type Facility = { id: string; name: string; location: LocationId; beds: number };
export const FACILITIES: Facility[] = [
  { id: "hdm", name: "Hospital del Mar", location: "dorado", beds: 210 },
  { id: "cordillera", name: "Hospital Cordillera Utuado", location: "utuado", beds: 96 },
  { id: "perla", name: "Centro Médico La Perla", location: "ponce", beds: 320 },
];

export type PoolNurse = {
  id: string; name: string; specialty: string; years: number; home: string; readiness: number;
  spanish: "Basic" | "Conversational" | "Fluent"; regions: LocationId[]; experiences: string[]; length: number;
  family: string; status: "Passport ready" | "Pathway in review";
};

export const POOL: PoolNurse[] = [
  { id: "n1", name: "Elena Rivera", specialty: "Emergency Room", years: 7, home: "Orlando, FL", readiness: 92, spanish: "Conversational", regions: ["san-juan", "dorado"], experiences: ["Beach", "Family"], length: 4, family: "Spouse + child", status: "Passport ready" },
  { id: "n2", name: "Maya Thompson", specialty: "ICU / Critical Care", years: 6, home: "Austin, TX", readiness: 88, spanish: "Basic", regions: ["utuado", "ponce"], experiences: ["Hiking", "Coffee"], length: 13, family: "Solo", status: "Passport ready" },
  { id: "n3", name: "Jordan Lee", specialty: "Med-Surg", years: 3, home: "Denver, CO", readiness: 81, spanish: "Basic", regions: ["aguadilla", "mayaguez"], experiences: ["Surf"], length: 8, family: "Solo", status: "Passport ready" },
  { id: "n4", name: "Priya Shah", specialty: "NICU", years: 9, home: "Chicago, IL", readiness: 95, spanish: "Conversational", regions: ["san-juan", "fajardo"], experiences: ["Sailing", "Food"], length: 13, family: "Partner", status: "Passport ready" },
  { id: "n5", name: "Marcus Bell", specialty: "Emergency Room", years: 11, home: "Atlanta, GA", readiness: 74, spanish: "Basic", regions: ["ponce", "san-juan"], experiences: ["Culture", "Food"], length: 8, family: "Solo", status: "Pathway in review" },
  { id: "n6", name: "Sofía Morales", specialty: "Labor & Delivery", years: 5, home: "Newark, NJ", readiness: 97, spanish: "Fluent", regions: ["utuado", "mayaguez", "ponce"], experiences: ["Family", "Hiking"], length: 13, family: "Spouse + 2 kids", status: "Passport ready" },
  { id: "n7", name: "Tyler Brooks", specialty: "ICU / Critical Care", years: 4, home: "Seattle, WA", readiness: 85, spanish: "Basic", regions: ["fajardo", "dorado"], experiences: ["Diving", "Sailing"], length: 8, family: "Solo", status: "Passport ready" },
  { id: "n8", name: "Ana Delgado", specialty: "Med-Surg", years: 8, home: "Miami, FL", readiness: 93, spanish: "Fluent", regions: ["dorado", "san-juan", "utuado"], experiences: ["Beach", "Wellness"], length: 13, family: "Child", status: "Passport ready" },
  { id: "n9", name: "Kevin O’Neil", specialty: "Operating Room", years: 12, home: "Boston, MA", readiness: 79, spanish: "Basic", regions: ["ponce", "aguadilla"], experiences: ["Golf", "Surf"], length: 4, family: "Spouse", status: "Pathway in review" },
  { id: "n10", name: "Rachel Kim", specialty: "Telemetry", years: 5, home: "Phoenix, AZ", readiness: 90, spanish: "Conversational", regions: ["utuado", "fajardo"], experiences: ["Hiking", "Coffee", "Wellness"], length: 13, family: "Solo", status: "Passport ready" },
];

export function matchScore(n: PoolNurse, loc: LocationId, specialty?: string) {
  let s = 50 + Math.round((n.readiness - 70) * 0.8);
  if (n.regions.includes(loc)) s += 22;
  if (specialty && n.specialty === specialty) s += 10;
  if (n.spanish !== "Basic") s += 4;
  return Math.min(99, Math.max(30, s));
}

export type AtsStage = "Shortlisted" | "Contacted" | "Negotiating" | "Offer sent" | "Accepted" | "Declined";
export const ATS_STAGES: AtsStage[] = ["Shortlisted", "Contacted", "Negotiating", "Offer sent", "Accepted"];

export type Message = { from: "hospital" | "nurse"; text: string; at: string };
export type Candidate = { nurseId: string; gigId: string; stage: AtsStage; weeklyPay: number; messages: Message[] };

export type HospitalGig = {
  id: string; title: string; specialty: string; location: LocationId; weeks: number; weeklyPay: number; shift: string;
  start: string; perks: string[]; status: "Draft" | "Published"; views: number;
};

export type HospitalState = { loggedIn: boolean; facilityId: string; gigs: HospitalGig[]; candidates: Candidate[] };

const now = () => new Date().toISOString();

export const hospitalSeed: HospitalState = {
  loggedIn: false,
  facilityId: "hdm",
  gigs: [
    { id: "g1", title: "ER nights by the beach", specialty: "Emergency Room", location: "dorado", weeks: 13, weeklyPay: 1800, shift: "3 × 12 nights", start: "2026-11-16", perks: ["villa-dorado", "flight", "car-month", "paddle", "biobay", "meal-card", "completion"], status: "Published", views: 412 },
    { id: "g2", title: "Med-Surg, family-friendly coast", specialty: "Med-Surg", location: "dorado", weeks: 8, weeklyPay: 1700, shift: "3 × 12 days", start: "2026-12-07", perks: ["hospital-housing", "flight", "car-contract", "childcare", "school"], status: "Published", views: 188 },
  ],
  candidates: [
    { nurseId: "n1", gigId: "g1", stage: "Negotiating", weeklyPay: 1800, messages: [
      { from: "hospital", text: "Hi Elena — your passport looks great. Interested in our ER nights gig in Dorado?", at: now() },
      { from: "nurse", text: "Yes! Traveling with my spouse and son — is a 2-bedroom villa possible?", at: now() },
    ] },
    { nurseId: "n8", gigId: "g2", stage: "Offer sent", weeklyPay: 1750, messages: [{ from: "hospital", text: "Offer sent: $1,750/wk + full package. Let us know!", at: now() }] },
    { nurseId: "n7", gigId: "g1", stage: "Contacted", weeklyPay: 1800, messages: [{ from: "hospital", text: "Tyler, want to dive Fajardo on your off days?", at: now() }] },
    { nurseId: "n4", gigId: "g1", stage: "Shortlisted", weeklyPay: 1800, messages: [] },
    { nurseId: "n6", gigId: "g2", stage: "Accepted", weeklyPay: 1700, messages: [{ from: "nurse", text: "Accepted — see you in December!", at: now() }] },
  ],
};

const KEY = "wepa-hospital-v1";
const EVT = "wepa-hospital-change";

export function useHospital() {
  const [state, setState] = useState<HospitalState>(hospitalSeed);
  useEffect(() => {
    const load = () => { try { const raw = localStorage.getItem(KEY); if (raw) setState(JSON.parse(raw)); } catch { /* ignore */ } };
    load();
    window.addEventListener(EVT, load);
    return () => window.removeEventListener(EVT, load);
  }, []);
  function update(fn: (s: HospitalState) => HospitalState) {
    setState((cur) => { const next = fn(cur); localStorage.setItem(KEY, JSON.stringify(next)); queueMicrotask(() => window.dispatchEvent(new Event(EVT))); return next; });
  }
  function reset() { update((s) => ({ ...hospitalSeed, loggedIn: s.loggedIn, facilityId: s.facilityId })); }
  return { state, update, reset };
}

export function packageTotals(perkIds: string[]) {
  const list = PERKS.filter((p) => perkIds.includes(p.id));
  return { list, cost: list.reduce((a, p) => a + p.cost, 0), retail: list.reduce((a, p) => a + p.retail, 0) };
}

/** Competitive index: weekly pay + perk value amortized per week. */
export function weeklyValue(weeklyPay: number, perkValue: number, weeks: number) {
  return Math.round(weeklyPay + perkValue / Math.max(1, weeks));
}
