import { useCallback, useEffect, useState } from "react";

export type ItemStatus =
  | "Missing" | "Action needed" | "Ready for review" | "Nurse confirmed" | "Submitted — self-reported"
  | "Official review" | "Accepted" | "Expired" | "Manual review";

export type ChecklistItem = {
  id: string; title: string; status: ItemStatus; source: string; expires?: string; next: string; help: string; file?: string;
};

export type Stage = "Applied" | "Readiness review" | "Clinical review" | "Conditional offer" | "Credentialing" | "Cleared to start";
export const STAGES: Stage[] = ["Applied", "Readiness review", "Clinical review", "Conditional offer", "Credentialing", "Cleared to start"];

export const elena = {
  name: "Elena Rivera", city: "Orlando, Florida", specialty: "Emergency Department RN", years: 7,
  license: "Florida RN #RN9481726 (fictional)", licenseIssued: "2018-06-14", licenseExpires: "2027-07-31",
  certs: ["BLS (exp. 2027-03)", "ACLS (exp. 2026-12)"], availability: "4-week assignment, from Nov 2 2026",
  spanish: "Conversational", travelingWith: "Spouse and child", email: "elena.rivera@example.com",
};

export const assignment = {
  hospital: "Hospital del Mar (fictional)", title: "Emergency Department RN — 4 weeks", location: "Carolina, Puerto Rico",
  pay: "$1,850/wk local pay", perks: "Flight, beachside condo for a family of 3, El Yunque + bio-bay weekend",
};

export type Pathway = {
  active: boolean; oneYear: boolean; continuous: boolean; inactive: boolean; goodStanding: boolean; pending: boolean; revoked: boolean; category: string;
};

export type ReadinessState = {
  pathway: Pathway;
  checklist: ChecklistItem[];
  packetPrepared: boolean;
  packetConfirmed: boolean;
  declarationDraft: string;
  spanish?: "English-supported setting ready" | "Developing clinical Spanish" | "Hospital review recommended";
  credentialing: { id: string; title: string; done: boolean }[];
  applied?: string; // consent timestamp
  stage: Stage;
  officialAuthorization: "Not started" | "Pending" | "Issued";
};

const seedChecklist: ChecklistItem[] = [
  { id: "id", title: "Government-issued photo ID", status: "Nurse confirmed", source: "Florida driver license", expires: "2029-04-02", next: "None", help: "A valid passport, REAL ID or driver license. The Board also asks for a recent 2×2 photo." },
  { id: "citizen", title: "Citizenship or work-authorization evidence", status: "Nurse confirmed", source: "U.S. passport", expires: "2031-09-10", next: "None", help: "U.S. citizens use a passport or birth certificate. Others provide valid work authorization." },
  { id: "license", title: "Current out-of-state license", status: "Nurse confirmed", source: "Florida Board of Nursing", expires: "2027-07-31", next: "None", help: "Your active home-state RN license: number, issue date and status (Vigente / Good standing)." },
  { id: "standing", title: "Good-standing certificate", status: "Ready for review", source: "Nursys license verification (requested)", next: "Confirm the request details", help: "An official letter or Nursys verification showing your license is active with no restrictions." },
  { id: "discipline", title: "Disciplinary-history certification", status: "Ready for review", source: "Florida Board of Nursing", next: "Confirm the request details", help: "A certification from your home board stating whether any disciplinary action exists." },
  { id: "declaration", title: "Notarized sworn declaration", status: "Missing", source: "Not started", next: "Draft with Wepa Guide, then sign before a notary", help: "The Puerto Rico application is a 'declaración jurada' — you swear the information is true before a notary public. If sworn outside Puerto Rico, the notary usually also needs County Clerk authentication." },
  { id: "liability", title: "Professional liability policy or employer coverage certificate", status: "Action needed", source: "Not provided", next: "Request coverage letter from Hospital del Mar", help: "Proof of malpractice coverage — your own policy or a certificate from the hiring hospital." },
  { id: "background", title: "Background-verification authorization", status: "Action needed", source: "PR Background Check Program", next: "Sign the authorization form", help: "You authorize Puerto Rico to run a criminal-history and credentials check, including places you lived in the last 5 years." },
  { id: "fee", title: "$100 application fee", status: "Action needed", source: "Not paid", next: "Pay at submission", help: "A non-refundable application fee. Confirm the current amount and payment method with the Department of Health." },
  { id: "reviewed", title: "Application reviewed by nurse", status: "Missing", source: "—", next: "Review the prepared packet", help: "You read every prepared answer and confirm it is accurate before anything is submitted." },
];

export const seed: ReadinessState = {
  pathway: { active: true, oneYear: true, continuous: true, inactive: false, goodStanding: true, pending: false, revoked: false, category: "RN — Emergency" },
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

export function pathwayResult(p: Pathway) {
  if (p.revoked || p.pending || !p.goodStanding) return "Manual board review recommended" as const;
  if (!p.active || !p.category.trim()) return "Additional information required" as const;
  if (!p.oneYear || !p.continuous || p.inactive) return "Manual board review recommended" as const;
  return "Potential Regulation 9746 pathway" as const;
}

const KEY = "wepa-readiness-v1";
const EVT = "wepa-readiness-change";

export function useReadiness() {
  const [state, setState] = useState<ReadinessState>(seed);
  useEffect(() => {
    const load = () => {
      try { const raw = localStorage.getItem(KEY); if (raw) setState({ ...seed, ...JSON.parse(raw) }); } catch { /* ignore */ }
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
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ task, detail, context }), signal,
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
