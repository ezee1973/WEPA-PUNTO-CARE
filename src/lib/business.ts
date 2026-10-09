import { useCallback, useEffect, useState } from "react";

/* ---------- Rates (single source of truth; all amounts are demo / simulated) ---------- */
export const WEPA_FEE_RATE = 0.08;
export const FEE_PER_BED = 60; // per licensed bed, per year
export const CLINIC_FLAT_FEE = 1800; // clinics / no-bed sites, per location, per year
/** Annual membership: per bed for hospitals, flat per location for clinics with no beds. */
export function membershipFee(beds: number, locations = 1) {
  return beds > 0 ? beds * FEE_PER_BED : CLINIC_FLAT_FEE * Math.max(locations, 1);
}

export const netPay = (gross: number) => Math.round(gross * (1 - WEPA_FEE_RATE));
export const wepaFee = (gross: number) => Math.round(gross * WEPA_FEE_RATE);
/** What the hospital pays per week for a nurse: gross pay + WEPA fee on top. */
export function hospitalWeekly(gross: number) {
  const fee = wepaFee(gross);
  return { nurseNet: netPay(gross), gross, fee, total: gross + fee };
}

export type BoostId = "boost" | "featured" | "spotlight";
export const BOOST_TIERS: { id: BoostId; name: string; price: number; lift: number; blurb: string }[] = [
  { id: "boost", name: "Boost", price: 49, lift: 1.5, blurb: "Rises above standard offers in your region." },
  { id: "featured", name: "Featured", price: 149, lift: 2.5, blurb: "Featured badge and top placement in every hospital perk menu." },
  { id: "spotlight", name: "Spotlight", price: 399, lift: 4, blurb: "Top of the directory island-wide plus a hospital newsletter mention." },
];
export const boostRank = (b?: BoostId) => (b === "spotlight" ? 3 : b === "featured" ? 2 : b === "boost" ? 1 : 0);
export const boostTier = (b?: BoostId) => BOOST_TIERS.find((t) => t.id === b);

export type ServiceKind = "Flights" | "Airport transfer" | "Concierge";
export type Service = { id: string; kind: ServiceKind; title: string; detail: string; price: number; wepaShare: number; often?: string };
export const SERVICES: Service[] = [
  { id: "flight-east", kind: "Flights", title: "Flight to San Juan (SJU)", detail: "From East Coast hubs · one way, 1 bag", price: 289, wepaShare: 35, often: "Often covered by your gig package" },
  { id: "flight-central", kind: "Flights", title: "Flight to San Juan (SJU)", detail: "From Central / West hubs · one way, 1 bag", price: 419, wepaShare: 35, often: "Often covered by your gig package" },
  { id: "flight-family", kind: "Flights", title: "Family fare add-on", detail: "Each extra traveler on your itinerary", price: 259, wepaShare: 25 },
  { id: "transfer-sju", kind: "Airport transfer", title: "SJU airport pickup", detail: "Private car to your housing · up to 4 bags", price: 65, wepaShare: 13, often: "Often covered by your gig package" },
  { id: "transfer-bqn", kind: "Airport transfer", title: "Aguadilla (BQN) pickup", detail: "Private car · west coast", price: 85, wepaShare: 17 },
  { id: "transfer-pse", kind: "Airport transfer", title: "Ponce (PSE) pickup", detail: "Private car · south coast", price: 75, wepaShare: 15 },
  { id: "housing-setup", kind: "Concierge", title: "Housing move-in setup", detail: "Linens, Wi-Fi check, stocked kitchen basics", price: 149, wepaShare: 30 },
  { id: "car-week", kind: "Concierge", title: "Car rental, first week", detail: "Compact car delivered to your housing", price: 329, wepaShare: 45 },
  { id: "groceries", kind: "Concierge", title: "First grocery delivery", detail: "Local market basket before you arrive", price: 89, wepaShare: 18 },
  { id: "family-help", kind: "Concierge", title: "Family settle-in help", detail: "School, childcare, and pediatrician intros", price: 199, wepaShare: 40 },
  { id: "concierge-line", kind: "Concierge", title: "24/7 island concierge", detail: "Bilingual help line for your whole assignment", price: 49, wepaShare: 49 },
];

/* ---------- Deterministic sample generators ---------- */
export const SAMPLE_ASSIGNMENT = { gross: 1850, weeks: 13, start: "2027-01-11", hospital: "Hospital Auxilio Mutuo" };

export function payoutSchedule(gross = SAMPLE_ASSIGNMENT.gross, weeks = SAMPLE_ASSIGNMENT.weeks, start = SAMPLE_ASSIGNMENT.start) {
  const base = new Date(`${start}T12:00:00Z`).getTime();
  return Array.from({ length: weeks }, (_, i) => ({
    week: i + 1,
    date: new Date(base + (i * 7 + 5) * 86400000).toISOString().slice(0, 10),
    net: netPay(gross),
  }));
}

export function bookingTotals(bookings: Booking[]) {
  const paid = bookings.filter((b) => !b.covered);
  return { count: bookings.length, nurseTotal: paid.reduce((a, b) => a + b.price, 0), covered: bookings.filter((b) => b.covered).length };
}

/** Sample WEPA revenue model for a pilot year (synthetic). */
export function revenueModel(opts = { hospitals: 20, nursesPlaced: 240, avgGross: 1800, avgWeeks: 10, boosts: { boost: 30, featured: 18, spotlight: 6 }, bookingsPerNurse: 3, avgShare: 30 }) {
  const payFees = Math.round(opts.nursesPlaced * opts.avgWeeks * opts.avgGross * WEPA_FEE_RATE * 2); // fee charged on both sides
  const memberships = opts.hospitals * membershipFee(200) + 15 * CLINIC_FLAT_FEE; // avg 200-bed hospitals + 15 clinic sites
  const boosts = (opts.boosts.boost * 49 + opts.boosts.featured * 149 + opts.boosts.spotlight * 399) * 12;
  const services = opts.nursesPlaced * opts.bookingsPerNurse * opts.avgShare;
  return [
    { id: "pay", label: "Pay processing (8% nurse + 8% hospital)", value: payFees },
    { id: "membership", label: "Hospital memberships", value: memberships },
    { id: "boosts", label: "Partner boosts", value: boosts },
    { id: "services", label: "Traveler services", value: services },
  ];
}

/* ---------- Local store: traveler bookings + hospital billing ---------- */
export type Booking = { id: string; serviceId: string; title: string; detail: string; price: number; date: string; covered: boolean };
export type BusinessState = { bookings: Booking[]; autopay: boolean; payoutMethod: string };
export const businessSeed: BusinessState = {
  bookings: [
    { id: "b-seed-1", serviceId: "flight-east", title: "Flight to San Juan (SJU)", detail: "MCO → SJU · one way, 1 bag", price: 289, date: "2027-01-09", covered: true },
  ],
  autopay: true,
  payoutMethod: "Direct deposit · checking ••4821",
};
const KEY = "wepa-business-v1";
const EVT = "wepa-business-change";
function read(): BusinessState {
  if (typeof window === "undefined") return businessSeed;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...businessSeed, ...(JSON.parse(raw) as BusinessState) } : businessSeed;
  } catch {
    return businessSeed;
  }
}
export function useBusiness() {
  const [state, setState] = useState<BusinessState>(businessSeed);
  useEffect(() => {
    const load = () => setState(read());
    load();
    window.addEventListener(EVT, load);
    window.addEventListener("storage", load);
    return () => { window.removeEventListener(EVT, load); window.removeEventListener("storage", load); };
  }, []);
  const update = useCallback((fn: (s: BusinessState) => BusinessState) => {
    const next = fn(read());
    localStorage.setItem(KEY, JSON.stringify(next));
    setState(next);
    window.dispatchEvent(new Event(EVT));
  }, []);
  const reset = useCallback(() => { localStorage.removeItem(KEY); setState(businessSeed); window.dispatchEvent(new Event(EVT)); }, []);
  return { state, update, reset };
}

export const usd = (n: number) => `$${Math.round(n).toLocaleString()}`;
