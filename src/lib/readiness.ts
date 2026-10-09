import { useCallback, useEffect, useState } from "react";

export type ItemStatus =
  | "Missing" | "Action needed" | "Ready for review" | "Nurse confirmed" | "Submitted — self-reported"
  | "Official review" | "Accepted" | "Expired" | "Manual review";

export type ChecklistItem = {
  id: string; title: string; status: ItemStatus; source: string; expires?: string; next: string; help: string; file?: string; fileData?: string | undefined; fileType?: string | undefined;
};

function sampleDoc(title: string, lines: string[], tone = "#16C9AD") {
  const rows = lines.map((l, i) => `<text x="40" y="${200 + i * 34}" font-size="20" fill="#092D37">${l}</text>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><rect width="640" height="420" rx="24" fill="#F5F2E9"/><rect width="640" height="90" rx="24" fill="${tone}"/><text x="40" y="58" font-size="28" font-weight="700" fill="#092D37" font-family="sans-serif">${title}</text><rect x="470" y="130" width="130" height="160" rx="12" fill="#092D37" opacity=".15"/><g font-family="sans-serif">${rows}</g><text x="40" y="390" font-size="16" fill="#FF7563" font-family="sans-serif" font-weight="700">SAMPLE · FICTIONAL DEMO DOCUMENT</text></svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

export type Stage = "Applied" | "Readiness review" | "Clinical review" | "Conditional offer" | "Credentialing" | "Cleared to start";
export const STAGES: Stage[] = ["Applied", "Readiness review", "Clinical review", "Conditional offer", "Credentialing", "Cleared to start"];

export const elena = {
  name: "Elena Rivera", city: "Orlando, Florida", specialty: "Emergency Department RN", years: 7,
  license: "Florida RN #RN9481726 (fictional)", licenseIssued: "2018-06-14", licenseExpires: "2027-07-31",
  certs: ["BLS (exp. 2027-03)", "ACLS (exp. 2026-12)"], availability: "4-week assignment, from Nov 2 2026",
  spanish: "Conversational", travelingWith: "Spouse and child", email: "elena.rivera@example.com",
  photo: "" as string,
};

export const INTEREST_OPTIONS = {
  regions: ["San Juan metro", "East coast & El Yunque", "Ponce & the south", "West coast surf towns", "Vieques & Culebra", "Anywhere on the island"],
  experiences: ["Beaches & snorkeling", "Rainforest & hiking", "Bio-bay nights", "Surf", "Food & rum culture", "Spa & wellness", "Old San Juan history", "Family-friendly"],
  lengths: ["4 weeks", "8 weeks", "13 weeks"],
  housing: ["Beachside", "City / walkable", "Quiet countryside"],
} as const;

export type Interests = { regions: string[]; experiences: string[]; length: string; housing: string; settings: string[]; service?: boolean };

export type Pathway = {
  active: boolean | null; oneYear: boolean | null; continuous: boolean | null; inactive: boolean | null; goodStanding: boolean | null; pending: boolean | null; revoked: boolean | null; category: string;
};

export type NurseProfile = typeof elena;

export type ReadinessState = {
  profile: NurseProfile;
  pathway: Pathway;
  checklist: ChecklistItem[];
  packetPrepared: boolean;
  packetConfirmed: boolean;
  declarationDraft: string;
  spanish?: "English-supported setting ready" | "Developing clinical Spanish" | "Hospital review recommended";
  credentialing: { id: string; title: string; done: boolean }[];
  interests: Interests;
  applied?: string; // consent timestamp — joined the WEPA gig pool
  stage: Stage;
  officialAuthorization: "Not started" | "Pending" | "Issued";
};

export function interestsComplete(i: Interests) {
  return i.regions.length > 0 && i.experiences.length > 0 && !!i.length && !!i.housing;
}

// Single source of truth for "what should the nurse do next" — the passport
// workspace and the nurse home both read this so the two can never drift.
export function nextBestAction(s: ReadinessState) {
  if (!pathwayComplete(s.pathway)) return "Answer the pathway questions to find your authorization route";
  if (!s.packetConfirmed) return s.packetPrepared ? "Review and confirm your prepared packet" : "Prepare your document packet with Wepa Guide";
  if (s.checklist.find((c) => c.id === "declaration")?.status !== "Submitted — self-reported") return "Sign your sworn declaration before a notary";
  if (!s.spanish) return "Complete the 3-question clinical Spanish scenario";
  if (!interestsComplete(s.interests)) return "Pick your island interests so we can match you";
  if (!s.applied) return "Join the WEPA gig pool and start matching";
  return "You’re in the gig pool — hospitals with matching gigs can now see your Passport";
}


const seedChecklist: ChecklistItem[] = [
  { id: "id", title: "Government-issued photo ID", status: "Nurse confirmed", source: "Florida driver license", expires: "2029-04-02", next: "None", file: "fl-driver-license.svg", fileType: "image/svg+xml", fileData: sampleDoc("FLORIDA DRIVER LICENSE", ["ELENA RIVERA", "DOB 03/14/1990", "Orlando, FL", "EXP 04/02/2029"]), help: "A valid passport, REAL ID or driver license. The Board also asks for a recent 2×2 photo." },
  { id: "citizen", title: "Citizenship or work-authorization evidence", status: "Nurse confirmed", source: "U.S. passport", expires: "2031-09-10", next: "None", file: "us-passport.svg", fileType: "image/svg+xml", fileData: sampleDoc("UNITED STATES PASSPORT", ["RIVERA, ELENA", "Nationality: USA", "EXP 09/10/2031"], "#FF7563"), help: "U.S. citizens use a passport or birth certificate. Others provide valid work authorization." },
  { id: "license", title: "Current out-of-state license", status: "Nurse confirmed", source: "Florida Board of Nursing", expires: "2027-07-31", next: "None", file: "fl-rn-license.svg", fileType: "image/svg+xml", fileData: sampleDoc("FLORIDA BOARD OF NURSING", ["Registered Nurse · RN9481726", "ELENA RIVERA", "Status: Clear / Active", "EXP 07/31/2027"]), help: "Your active home-state RN license: number, issue date and status (Vigente / Good standing)." },
  { id: "standing", title: "Good-standing certificate", status: "Ready for review", source: "Nursys license verification (requested)", next: "Confirm the request details", help: "An official letter or Nursys verification showing your license is active with no restrictions." },
  { id: "discipline", title: "Disciplinary-history certification", status: "Ready for review", source: "Florida Board of Nursing", next: "Confirm the request details", help: "A certification from your home board stating whether any disciplinary action exists." },
  { id: "declaration", title: "Notarized sworn declaration", status: "Missing", source: "Not started", next: "Draft with Wepa Guide, then sign before a notary", help: "The Puerto Rico application is a 'declaración jurada' — you swear the information is true before a notary public. If sworn outside Puerto Rico, the notary usually also needs County Clerk authentication." },
  { id: "liability", title: "Professional liability policy or employer coverage certificate", status: "Action needed", source: "Not provided", next: "Request coverage letter from Hospital del Mar", help: "Proof of malpractice coverage — your own policy or a certificate from the hiring hospital." },
  { id: "background", title: "Background-verification authorization", status: "Action needed", source: "PR Background Check Program", next: "Sign the authorization form", help: "You authorize Puerto Rico to run a criminal-history and credentials check, including places you lived in the last 5 years." },
  { id: "fee", title: "$100 application fee", status: "Action needed", source: "Not paid", next: "Pay at submission", help: "A non-refundable application fee. Confirm the current amount and payment method with the Department of Health." },
  { id: "reviewed", title: "Application reviewed by nurse", status: "Missing", source: "—", next: "Review the prepared packet", help: "You read every prepared answer and confirm it is accurate before anything is submitted." },
];

export const seed: ReadinessState = {
  profile: elena,
  pathway: { active: null, oneYear: null, continuous: null, inactive: null, goodStanding: null, pending: null, revoked: null, category: "" },
  checklist: seedChecklist,
  packetPrepared: false,
  packetConfirmed: false,
  declarationDraft: "",
  credentialing: [
    { id: "ed", title: "Minimum 2 years ED experience", done: true },
    { id: "bls", title: "BLS", done: true },
    { id: "acls", title: "ACLS", done: true },
    { id: "refs", title: "Two clinical references", done: false },
    { id: "health", title: "Health clearance (TB, immunizations)", done: false },
    { id: "bg", title: "Hospital background screening", done: false },
    { id: "orient", title: "Facility orientation", done: false },
    { id: "ehr", title: "EHR orientation", done: false },
  ],
  interests: { regions: [], experiences: [], length: "", housing: "", settings: [] },
  stage: "Applied",
  officialAuthorization: "Pending",
};

export function preparationProgress(s: ReadinessState) {
  let p = 72;
  if (s.packetConfirmed) p = 92;
  if (s.spanish) p += 4;
  if (s.checklist.find((c) => c.id === "declaration")?.status === "Submitted — self-reported") p += 2;
  return Math.min(p, 98); // the last step is official authorization, which WEPA never controls
}

export function pathwayComplete(p: Pathway) {
  return [p.active, p.oneYear, p.continuous, p.inactive, p.goodStanding, p.pending, p.revoked].every((v) => v !== null) && !!p.category.trim();
}

export function pathwayResult(p: Pathway) {
  if (!pathwayComplete(p)) return "Additional information required" as const;
  if (p.revoked || p.pending || !p.goodStanding) return "Manual board review recommended" as const;
  if (!p.active) return "Additional information required" as const;
  if (!p.oneYear || !p.continuous || p.inactive) return "Manual board review recommended" as const;
  return "Potential Regulation 9746 pathway" as const;
}

const KEY = "wepa-readiness-v1";
const EVT = "wepa-readiness-change";

export function useReadiness() {
  const [state, setState] = useState<ReadinessState>(seed);
  useEffect(() => {
    const load = () => {
      try { const raw = localStorage.getItem(KEY); if (raw) { const saved = { ...seed, ...JSON.parse(raw) } as ReadinessState; saved.checklist = saved.checklist.map((c) => { const sd = seed.checklist.find((x) => x.id === c.id); return !c.file && sd?.file ? { ...c, file: sd.file, fileType: sd.fileType, fileData: sd.fileData } : c; }); setState(saved); } } catch { /* ignore */ }
    };
    load();
    window.addEventListener(EVT, load);
    window.addEventListener("storage", load);
    return () => { window.removeEventListener(EVT, load); window.removeEventListener("storage", load); };
  }, []);
  const update = useCallback((fn: (s: ReadinessState) => ReadinessState) => {
    setState((prev) => {
      const next = fn(prev);
      localStorage.setItem(KEY, JSON.stringify(next));
      queueMicrotask(() => window.dispatchEvent(new Event(EVT)));
      return next;
    });
  }, []);
  const reset = useCallback(() => { localStorage.removeItem(KEY); setState(seed); window.dispatchEvent(new Event(EVT)); }, []);
  return { state, update, reset };
}

export async function streamGuide(task: string, context: unknown, onText: (t: string) => void, detail = "", signal?: AbortSignal) {
  const res = await fetch("/api/wepa-guide", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ task, detail, context }), signal: signal ?? null,
  });
  if (!res.ok || !res.body) {
    const msg = await res.json().then((j) => j.error).catch(() => null);
    throw new Error(msg || (res.status === 402 ? "AI credits are used up for this workspace." : res.status === 429 ? "Wepa Guide is busy — try again in a moment." : "Wepa Guide couldn't respond."));
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += dec.decode(value, { stream: true });
    onText(text);
  }
  if (!text.trim()) throw new Error("Wepa Guide returned no answer. Please try again.");
  return text;
}
