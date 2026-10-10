import { useEffect, useRef, useState } from "react";
import { passportId } from "@/lib/passport-share";
import { preparationProgress, seed as readinessSeed, useReadiness, type ReadinessState } from "@/lib/readiness";

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

export type Perk = { id: string; title: string; partner: string; category: PerkCategory; retail: number; cost: number; locations: LocationId[] | "all"; note?: string; image?: string; custom?: boolean };

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
  certs?: string[]; email?: string; phone?: string; available?: string;
  /** Set on the one pool record that mirrors the live nurse Passport on this device. */
  passportCode?: string; linked?: boolean;
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

/* ---------- 110 more synthetic nurses (deterministic, all fictional) ---------- */
const FIRST = ["Alex","Brianna","Carlos","Danielle","Ethan","Fatima","Gabriel","Hannah","Isaiah","Jasmine","Kayla","Liam","Mariana","Nathan","Olivia","Pedro","Quinn","Rosa","Samuel","Tara","Uriel","Valeria","Wesley","Ximena","Yara","Zoe","Andre","Bianca","Caleb","Diana","Elijah","Gloria","Hector","Ivy","Jamal","Kendra","Lucia","Mateo","Nadia","Owen"];
const LAST = ["Alvarez","Bennett","Castillo","Dawson","Espinoza","Foster","Garcia","Hughes","Ibarra","Jenkins","Kowalski","Lopez","Mendez","Nguyen","Ortiz","Patel","Quintana","Reyes","Santiago","Turner","Underwood","Vargas","Walker","Young","Zamora","Brooks","Cruz","Diaz","Ellis","Flores"];
const HOMES = ["Orlando, FL","Tampa, FL","Miami, FL","Houston, TX","Dallas, TX","Austin, TX","Atlanta, GA","Charlotte, NC","Newark, NJ","New York, NY","Philadelphia, PA","Boston, MA","Chicago, IL","Columbus, OH","Nashville, TN","Denver, CO","Phoenix, AZ","San Diego, CA","Los Angeles, CA","Seattle, WA","Portland, OR","Minneapolis, MN","Hartford, CT","Baltimore, MD","Richmond, VA"];
const SPECS = ["Emergency Room","ICU / Critical Care","Med-Surg","NICU","Labor & Delivery","Operating Room","Telemetry","Pediatrics","Oncology","Step-Down / PCU"];
const EXPS = ["Beach","Hiking","Surf","Food","Culture","Diving","Sailing","Coffee","Wellness","Family","Golf","Nightlife"];
const FAM = ["Solo","Solo","Partner","Spouse","Spouse + child","Child","Friend","Spouse + 2 kids"];
const CERTS = [["BLS","ACLS"],["BLS","ACLS","TNCC"],["BLS","PALS"],["BLS","NRP"],["BLS","ACLS","CCRN"],["BLS","ACLS","PALS"],["BLS","CEN"]];
const LOC_IDS = ["san-juan","dorado","ponce","utuado","mayaguez","aguadilla","fajardo"] as LocationId[];
function rng(seed: number) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
const r = rng(20261009);
const pick = <T,>(a: readonly T[]) => a[Math.floor(r() * a.length)]!;
function pickN<T>(a: readonly T[], n: number) { const c = [...a]; const out: T[] = []; while (out.length < n && c.length) out.push(c.splice(Math.floor(r() * c.length), 1)[0]!); return out; }
for (let i = 11; i <= 120; i++) {
  const name = `${pick(FIRST)} ${pick(LAST)}`;
  const readiness = 55 + Math.floor(r() * 45);
  const month = 11 + Math.floor(r() * 6);
  POOL.push({
    id: `n${i}`, name, specialty: pick(SPECS), years: 1 + Math.floor(r() * 18), home: pick(HOMES), readiness,
    spanish: pick(["Basic", "Basic", "Conversational", "Conversational", "Fluent"] as const), regions: pickN(LOC_IDS, 1 + Math.floor(r() * 3)),
    experiences: pickN(EXPS, 1 + Math.floor(r() * 3)), length: pick([4, 8, 8, 13, 13]), family: pick(FAM),
    status: readiness >= 78 ? "Passport ready" : "Pathway in review", certs: pick(CERTS),
    available: `${month > 12 ? 2027 : 2026}-${String(month > 12 ? month - 12 : month).padStart(2, "0")}-${String(1 + Math.floor(r() * 27)).padStart(2, "0")}`,
  });
}
for (const n of POOL) {
  n.certs ??= ["BLS", "ACLS"];
  n.email ??= `${n.name.toLowerCase().normalize("NFD").replace(/[^a-z ]/g, "").replace(" ", ".")}@example.com`;
  n.phone ??= `(555) ${String(100 + (n.id.length * 37 + Number(n.id.slice(1)) * 13) % 900)}-${String(1000 + Number(n.id.slice(1)) * 71 % 9000)}`;
  n.available ??= "2026-11-02";
}

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
export type Activity = { text: string; at: string };
export type Task = { id: string; text: string; due: string; done: boolean };
export type Candidate = {
  nurseId: string; gigId: string; stage: AtsStage; weeklyPay: number; messages: Message[];
  rating?: number; tags?: string[]; owner?: string; source?: string; notes?: Activity[]; tasks?: Task[]; activity?: Activity[]; updatedAt?: string;
};
export const RECRUITERS = ["You", "Marisol (Nurse Recruiter)", "Dr. Ortiz (ED Director)", "Luis (HR)"];

export type HospitalGig = {
  id: string; title: string; specialty: string; location: LocationId; weeks: number; weeklyPay: number; shift: string;
  start: string; perks: string[]; status: "Draft" | "Published"; views: number; town?: string; service?: boolean;
};

export type HospitalState = { loggedIn: boolean; facilityId: string; gigs: HospitalGig[]; candidates: Candidate[] };

const now = () => new Date().toISOString();
const ago = (d: number) => new Date(Date.now() - d * 86400000).toISOString();
const inDays = (d: number) => new Date(Date.now() + d * 86400000).toISOString().slice(0, 10);

export const hospitalSeed: HospitalState = {
  loggedIn: false,
  facilityId: "hdm",
  gigs: [
    { id: "g1", title: "ER nights by the beach", specialty: "Emergency Room", location: "dorado", weeks: 13, weeklyPay: 1800, shift: "3 × 12 nights", start: "2026-11-16", perks: ["villa-dorado", "flight", "car-month", "paddle", "biobay", "meal-card", "completion"], status: "Published", views: 412 },
    { id: "g2", title: "Med-Surg, family-friendly coast", specialty: "Med-Surg", location: "dorado", weeks: 8, weeklyPay: 1700, shift: "3 × 12 days", start: "2026-12-07", perks: ["hospital-housing", "flight", "car-contract", "childcare", "school"], status: "Published", views: 188 },
  ],
  candidates: [
    { nurseId: "n1", gigId: "g1", stage: "Negotiating", weeklyPay: 1800, rating: 5, tags: ["Family", "ER nights"], owner: "Marisol (Nurse Recruiter)", source: "WEPA pool match", updatedAt: ago(1),
      messages: [
        { from: "hospital", text: "Hi Elena — your passport looks great. Interested in our ER nights gig in Dorado?", at: ago(4) },
        { from: "nurse", text: "Yes! Traveling with my spouse and son — is a 2-bedroom villa possible?", at: ago(3) },
      ],
      notes: [{ text: "Strong ED background. Needs 2-bedroom villa + childcare info.", at: ago(3) }],
      tasks: [{ id: "t1", text: "Confirm 2-bedroom villa with Dorado partner", due: inDays(1), done: false }],
      activity: [{ text: "Shortlisted from pool (96% match)", at: ago(5) }, { text: "Moved to Contacted", at: ago(4) }, { text: "Moved to Negotiating", at: ago(2) }] },
    { nurseId: "n8", gigId: "g2", stage: "Offer sent", weeklyPay: 1750, rating: 4, tags: ["Fluent Spanish"], owner: "You", source: "Applied to gig", updatedAt: ago(1),
      messages: [{ from: "hospital", text: "Offer sent: $1,750/wk + full package. Let us know!", at: ago(1) }],
      tasks: [{ id: "t2", text: "Follow up on offer", due: inDays(2), done: false }], activity: [{ text: "Formal offer sent · $1,750/wk", at: ago(1) }] },
    { nurseId: "n7", gigId: "g1", stage: "Contacted", weeklyPay: 1800, rating: 3, tags: ["Diver"], owner: "You", source: "WEPA pool match", updatedAt: ago(2),
      messages: [{ from: "hospital", text: "Tyler, want to dive Fajardo on your off days?", at: ago(2) }], activity: [{ text: "Moved to Contacted", at: ago(2) }] },
    { nurseId: "n4", gigId: "g1", stage: "Shortlisted", weeklyPay: 1800, rating: 4, owner: "Dr. Ortiz (ED Director)", source: "WEPA pool match", updatedAt: ago(1), messages: [], activity: [{ text: "Shortlisted from pool", at: ago(1) }] },
    { nurseId: "n6", gigId: "g2", stage: "Accepted", weeklyPay: 1700, rating: 5, tags: ["L&D", "Family"], owner: "Marisol (Nurse Recruiter)", source: "Referral", updatedAt: ago(6),
      messages: [{ from: "nurse", text: "Accepted — see you in December!", at: ago(6) }], activity: [{ text: "Offer accepted", at: ago(6) }],
      tasks: [{ id: "t3", text: "Start credentialing packet", due: inDays(3), done: false }] },
    { nurseId: "n14", gigId: "g1", stage: "Shortlisted", weeklyPay: 1800, rating: 3, owner: "You", source: "WEPA pool match", updatedAt: ago(0), messages: [], activity: [{ text: "Shortlisted from pool", at: ago(0) }] },
    { nurseId: "n22", gigId: "g2", stage: "Contacted", weeklyPay: 1700, rating: 2, owner: "Luis (HR)", source: "Applied to gig", updatedAt: ago(3), messages: [{ from: "hospital", text: "Thanks for applying! Free for a quick call this week?", at: ago(3) }], tasks: [{ id: "t4", text: "Schedule intro call", due: inDays(-1), done: false }] },
    { nurseId: "n31", gigId: "g1", stage: "Negotiating", weeklyPay: 1850, rating: 4, tags: ["Wants 13 wks"], owner: "Marisol (Nurse Recruiter)", source: "WEPA pool match", updatedAt: ago(1), messages: [{ from: "nurse", text: "Could you do $1,900 if I extend to 13 weeks?", at: ago(1) }] },
    { nurseId: "n47", gigId: "g2", stage: "Declined", weeklyPay: 1700, rating: 2, owner: "You", source: "WEPA pool match", updatedAt: ago(8), messages: [{ from: "nurse", text: "I've accepted another assignment — thank you!", at: ago(8) }] },
  ],
};

const KEY = "wepa-hospital-v2";
const EVT = "wepa-hospital-change";

/** Elena (n1) in the hospital pool is the same record as the nurse Passport workspace. */
export function syncLinkedNurse(r: ReadinessState) {
  const n = POOL.find((x) => x.id === "n1");
  if (!n) return;
  const progress = preparationProgress(r);
  n.name = r.profile.name; n.years = r.profile.years; n.home = r.profile.city.replace("Florida", "FL");
  n.readiness = progress; n.linked = true;
  n.passportCode = passportId(r.profile.name, r.profile.license);
  n.status = r.applied ? "Passport ready" : "Pathway in review";
}
syncLinkedNurse(readinessSeed);

export function useLinkedPool() {
  const { state } = useReadiness();
  syncLinkedNurse(state);
  return POOL;
}

export function useHospital() {
  const [state, setState] = useState<HospitalState>(hospitalSeed);
  const ref = useRef(state);
  useEffect(() => {
    const load = () => { try { const raw = localStorage.getItem(KEY); if (raw) { ref.current = JSON.parse(raw); setState(ref.current); } } catch { /* ignore */ } };
    load();
    window.addEventListener(EVT, load);
    return () => window.removeEventListener(EVT, load);
  }, []);
  function update(fn: (s: HospitalState) => HospitalState) {
    // Compute and persist immediately: the caller may unmount right after (e.g. "Save draft" → dashboard).
    let cur = ref.current;
    try { const raw = localStorage.getItem(KEY); if (raw) cur = JSON.parse(raw); } catch { /* ignore */ }
    const next = fn(cur);
    ref.current = next;
    localStorage.setItem(KEY, JSON.stringify(next));
    setState(next);
    queueMicrotask(() => window.dispatchEvent(new Event(EVT)));
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

/* ---------- Any town in Puerto Rico, mapped to its nearest region hub ---------- */
const TOWNS: Record<LocationId, string[]> = {
  "san-juan": ["San Juan", "Guaynabo", "Bayamón", "Carolina", "Trujillo Alto", "Cataño", "Toa Baja", "Caguas", "Gurabo", "Aguas Buenas", "Cidra", "San Lorenzo", "Canóvanas", "Loíza"],
  dorado: ["Dorado", "Toa Alta", "Vega Alta", "Vega Baja", "Manatí", "Barceloneta", "Corozal", "Naranjito", "Morovis", "Ciales"],
  ponce: ["Ponce", "Juana Díaz", "Santa Isabel", "Coamo", "Salinas", "Guayama", "Arroyo", "Patillas", "Villalba", "Peñuelas", "Guayanilla", "Yauco", "Guánica"],
  utuado: ["Utuado", "Jayuya", "Adjuntas", "Orocovis", "Barranquitas", "Comerío", "Aibonito", "Lares", "Maricao", "Las Marías"],
  mayaguez: ["Mayagüez", "Cabo Rojo", "Hormigueros", "San Germán", "Lajas", "Sabana Grande", "Añasco", "Rincón"],
  fajardo: ["Fajardo", "Luquillo", "Río Grande", "Ceiba", "Naguabo", "Humacao", "Las Piedras", "Juncos", "Yabucoa", "Maunabo", "Vieques", "Culebra"],
  aguadilla: ["Aguadilla", "Isabela", "Aguada", "Moca", "San Sebastián", "Quebradillas", "Camuy", "Hatillo", "Arecibo", "Florida"],
};
export const MUNICIPALITIES = (Object.entries(TOWNS) as [LocationId, string[]][]).flatMap(([hub, ts]) => ts.map((name) => ({ name, hub }))).sort((a, b) => a.name.localeCompare(b.name, "es"));
export function hubFor(town: string): LocationId { return MUNICIPALITIES.find((m) => m.name.toLowerCase() === town.trim().toLowerCase())?.hub ?? "san-juan"; }

/* ---------- Enough competing facilities for a real ranking ---------- */
const COMP_NAMES: [string, string, number, number][] = [
  ["Hospital Pavía Santurce", "San Juan", 1950, 12400], ["Ashford Presbyterian", "San Juan", 2050, 9800], ["Hospital San Francisco", "San Juan", 1800, 5200], ["Hospital Hermanos Meléndez", "Bayamón", 1700, 4100], ["Hospital Universitario UPR", "Carolina", 1650, 3200], ["HIMA San Pablo Caguas", "Caguas", 1850, 7600], ["Hospital Menonita Caguas", "Caguas", 1750, 6400], ["Hospital San Carlos Borromeo", "Moca", 1600, 3800], ["Hospital Wilma N. Vázquez", "Vega Baja", 1700, 5600], ["Doctors’ Center Manatí", "Manatí", 1800, 8200], ["Hospital Menonita Aibonito", "Aibonito", 1650, 4600], ["Hospital Episcopal San Lucas Guayama", "Guayama", 1650, 3500], ["Hospital Damas", "Ponce", 1800, 7300], ["Hospital de la Concepción", "San Germán", 1700, 6900], ["Hospital Perea", "Mayagüez", 1650, 4300], ["Hospital Ryder", "Humacao", 1750, 8800], ["Hospital Susoni", "Arecibo", 1700, 5000], ["Hospital Metropolitano Cabo Rojo", "Cabo Rojo", 1600, 9600], ["Hospital Castañer", "Lares", 1550, 3100], ["Centro de Salud Vieques", "Vieques", 1700, 13800], ["Hospital Dr. Pila", "Ponce", 1600, 2400],
];
COMP_NAMES.forEach(([name, town, weeklyPay, perkValue]) => COMPETITORS.push({ name: `${name}`, location: hubFor(town), weeklyPay, perkValue }));

/* ---------- Partner perks are marketed offers ---------- */
export type OfferType = "Standard" | "Limited time" | "Special";
export type PerkOffer = { offerType: OfferType; headline?: string | undefined; endsAt?: string | undefined; requirement?: string | undefined };
const OFFER_PATCH: Record<string, PerkOffer> = {
  "hilton-month": { offerType: "Limited time", headline: "65% off first month", endsAt: "2026-12-15" },
  "villa-dorado": { offerType: "Special", headline: "Rate cut in exchange for signage", requirement: "Partner banner in staff lounge + logo on your careers page" },
  "eco-lodge": { offerType: "Special", headline: "Founding mountain partner", requirement: "Co-branded post on your hospital site" },
  "coffee-casita": { offerType: "Limited time", headline: "Harvest-season rate", endsAt: "2027-01-31" },
  flight: { offerType: "Limited time", headline: "Winter fare lock", endsAt: "2026-11-30" },
  "car-contract": { offerType: "Special", headline: "Fleet rate — 50% off", requirement: "Rental desk flyer at main lobby" },
  biobay: { offerType: "Limited time", headline: "New-moon nights 2-for-1", endsAt: "2026-11-20" },
  catamaran: { offerType: "Special", headline: "Free seat each month", requirement: "Poster in nurses’ station" },
  zipline: { offerType: "Limited time", headline: "Holiday 70% off", endsAt: "2026-12-31" },
  surf: { offerType: "Special", headline: "Surf school sponsor", requirement: "Logo on hospital website partner page" },
  vieques: { offerType: "Limited time", headline: "Off-season escape", endsAt: "2027-02-28" },
  spa: { offerType: "Special", headline: "Wellness sponsor rate", requirement: "Table-top signage in cafeteria" },
  "dorado-spa": { offerType: "Limited time", headline: "Weekday spa deal", endsAt: "2026-12-20" },
  bacardi: { offerType: "Special", headline: "Welcome-week class", requirement: "Mention in nurse onboarding email" },
  gym: { offerType: "Special", headline: "Corporate wellness rate", requirement: "Flyer at employee entrance" },
};
export function offerOf(id: string): PerkOffer { return OFFER_PATCH[id] ?? { offerType: "Standard" }; }

/** Partner-published offers join the same perk menu hospitals build packages from. */
export function registerPartnerOffers(list: { perk: Perk; offer: PerkOffer }[]) {
  for (let i = PERKS.length - 1; i >= 0; i--) if (PERKS[i]!.custom) PERKS.splice(i, 1);
  for (const { perk, offer } of list) { PERKS.push({ ...perk, custom: true }); OFFER_PATCH[perk.id] = offer; }
}

// More partner perks so every corner of the island has a real menu.
PERKS.push(
  { id: "culebra-flamenco", title: "Flamenco Beach day by ferry", partner: "Culebra Ferry Tours", category: "Adventure", retail: 160, cost: 45, locations: ["fajardo"] },
  { id: "rincon-whales", title: "Whale-watching sunset sail", partner: "Rincón Sailing", category: "Adventure", retail: 210, cost: 70, locations: ["mayaguez", "aguadilla"] },
  { id: "cabo-rojo-light", title: "Los Morrillos lighthouse & salt flats tour", partner: "Cabo Rojo Tours", category: "Food & Culture", retail: 95, cost: 25, locations: ["mayaguez"] },
  { id: "arecibo-cave", title: "Cueva Ventana guided hike", partner: "Cueva Ventana", category: "Adventure", retail: 85, cost: 20, locations: ["aguadilla", "utuado", "dorado"] },
  { id: "jayuya-coffee", title: "Jayuya coffee harvest weekend", partner: "Hacienda San Pedro", category: "Food & Culture", retail: 280, cost: 80, locations: ["utuado"] },
  { id: "guavate-lechon", title: "Guavate lechonera crawl", partner: "Ruta del Lechón", category: "Food & Culture", retail: 120, cost: 35, locations: ["san-juan", "ponce"] },
  { id: "humacao-golf", title: "Palmas del Mar golf & beach club", partner: "Palmas del Mar", category: "Wellness", retail: 900, cost: 350, locations: ["fajardo"] },
  { id: "salinas-mangrove", title: "Bahía de Jobos mangrove kayak", partner: "Salinas Eco Kayak", category: "Adventure", retail: 110, cost: 30, locations: ["ponce"] },
  { id: "guanica-forest", title: "Guánica dry-forest & Gilligan’s Island trip", partner: "Guánica Boat Trips", category: "Adventure", retail: 140, cost: 40, locations: ["ponce", "mayaguez"] },
  { id: "lajas-biobay", title: "La Parguera bio-bay swim", partner: "Parguera Tours", category: "Adventure", retail: 150, cost: 45, locations: ["mayaguez"] },
  { id: "isabela-horse", title: "Beach horseback ride", partner: "Tropical Trail Rides", category: "Adventure", retail: 180, cost: 60, locations: ["aguadilla"] },
  { id: "caguas-botanical", title: "Caguas botanical garden & food hall pass", partner: "Caguas Gastronomy", category: "Food & Culture", retail: 90, cost: 20, locations: ["san-juan"] },
);
