import { pathwayResult, preparationProgress, type ReadinessState } from "@/lib/readiness";

export type SharedPassport = {
  id: string; name: string; specialty: string; years: number; city: string; progress: number;
  pathway: string; spanish: string; certs: string[]; availability: string; regions: string[]; issued: string; pool: boolean;
};

export function passportId(name: string, license: string) {
  let h = 0;
  for (const c of name + license) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return "PR-" + h.toString(36).toUpperCase().padStart(7, "0").slice(0, 7);
}

export function toShared(s: ReadinessState): SharedPassport {
  return {
    id: passportId(s.profile.name, s.profile.license), name: s.profile.name, specialty: s.profile.specialty, years: s.profile.years,
    city: s.profile.city, progress: preparationProgress(s), pathway: pathwayResult(s.pathway), spanish: s.spanish ?? "Not completed",
    certs: s.profile.certs, availability: s.profile.availability, regions: s.interests.regions,
    issued: (s.applied ? new Date(s.applied) : new Date()).toISOString().slice(0, 10), pool: !!s.applied,
  };
}

export function encodePassport(p: SharedPassport) {
  const bytes = new TextEncoder().encode(JSON.stringify(p));
  let bin = ""; bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodePassport(d: string): SharedPassport | null {
  try {
    const bin = atob(d.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
  } catch { return null; }
}

export function shareUrl(p: SharedPassport) {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://wepa.care";
  return `${origin}/passport?d=${encodePassport(p)}`;
}
