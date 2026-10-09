import { describe, expect, it } from "vitest";
import { bookingTotals, hospitalWeekly, netPay, payoutSchedule } from "@/lib/business";
import { fullDirectory, partnerSeed } from "@/lib/partner-offers";

describe("business model", () => {
  it("nurse sees net, hospital pays gross + fee", () => {
    expect(netPay(1850)).toBe(1702);
    expect(hospitalWeekly(1850)).toEqual({ nurseNet: 1702, gross: 1850, fee: 148, total: 1998 });
    expect(payoutSchedule(1000, 4).map((p) => p.net)).toEqual([920, 920, 920, 920]);
  });
  it("boosted offers rank first", () => {
    const base = fullDirectory(partnerSeed);
    const last = base[base.length - 1]!.id;
    const boosted = fullDirectory({ ...partnerSeed, boosts: { [last]: "spotlight" } });
    expect(boosted[0]!.id).toBe(last);
    expect(boosted[0]!.boost).toBe("spotlight");
  });
  it("booking totals exclude package-covered items", () => {
    const t = bookingTotals([
      { id: "a", serviceId: "x", title: "", detail: "", price: 289, date: "", covered: true },
      { id: "b", serviceId: "y", title: "", detail: "", price: 65, date: "", covered: false },
    ]);
    expect(t).toEqual({ count: 2, nurseTotal: 65, covered: 1 });
  });
});
