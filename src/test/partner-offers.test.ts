import { describe, expect, it } from "vitest";
import { perksFor, PERKS, offerOf } from "@/lib/hospital-data";
import { baseDirectory, fullDirectory, partnerSeed, trending, usePartner } from "@/lib/partner-offers";
import { renderHook, act } from "@testing-library/react";

describe("partner offers", () => {
  it("directory has at least 60 real-partner offers", () => {
    expect(baseDirectory().length).toBeGreaterThanOrEqual(60);
  });
  it("trending is deterministic", () => {
    const a = trending(fullDirectory(partnerSeed)); const b = trending(fullDirectory(partnerSeed));
    expect(a.byHospital.map((o) => o.id)).toEqual(b.byHospital.map((o) => o.id));
  });
  it("published partner offers reach the hospital perk menu", () => {
    const { result } = renderHook(() => usePartner());
    act(() => result.current.update((s) => ({ ...s, offers: [{ ...s.offers[0]!, id: "partner-test", locations: ["ponce"], status: "Live" }] })));
    expect(perksFor("ponce").some((p) => p.id === "partner-test")).toBe(true);
    expect(offerOf("partner-test").offerType).toBe("Limited time");
    act(() => result.current.update((s) => ({ ...s, offers: [{ ...s.offers[0]!, status: "Paused" }] })));
    expect(PERKS.some((p) => p.id === "partner-test")).toBe(false);
  });
});
