import { describe, expect, it } from "vitest";
import { perksFor, PERKS, offerOf } from "@/lib/hospital-data";
import { boostSpend } from "@/lib/business";
import {
  ACCOUNT_BOOSTS,
  PARTNER_ACCOUNTS,
  accountOffers,
  accountSlice,
  baseDirectory,
  fullDirectory,
  partnerSeed,
  trending,
  usePartner,
} from "@/lib/partner-offers";
import { renderHook, act } from "@testing-library/react";

describe("partner offers", () => {
  it("directory has at least 60 real-partner offers", () => {
    expect(baseDirectory().length).toBeGreaterThanOrEqual(60);
  });
  it("trending is deterministic", () => {
    const a = trending(fullDirectory(partnerSeed)); const b = trending(fullDirectory(partnerSeed));
    expect(a.byHospital.map((o) => o.id)).toEqual(b.byHospital.map((o) => o.id));
  });
  it("every operator account opens with its own book of offers", () => {
    expect(PARTNER_ACCOUNTS.length).toBeGreaterThanOrEqual(8);
    for (const a of PARTNER_ACCOUNTS) {
      const slice = accountSlice(partnerSeed, a.id);
      expect(slice.offers.length).toBeGreaterThanOrEqual(3);
      expect(slice.offers.some((o) => o.status === "Live")).toBe(true);
    }
    expect(accountOffers("east-island").some((o) => o.status === "Draft")).toBe(true);
  });
  it("the directory carries every operator, not just the signed-in one", () => {
    const list = fullDirectory(partnerSeed);
    expect(list.filter((o) => o.partner === "La Concha Resort").length).toBeGreaterThanOrEqual(3);
    expect(list.filter((o) => o.partner === "Toro Verde Adventure Park").length).toBeGreaterThanOrEqual(3);
  });
  it("placement spend follows the active boosts", () => {
    expect(boostSpend(ACCOUNT_BOOSTS["la-concha"]!)).toBe(399);
    expect(boostSpend({})).toBe(0);
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
