import { CreditCard, FileText } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { CLINIC_FLAT_FEE, FEE_PER_BED, membershipFee, WEPA_FEE_RATE, hospitalWeekly, usd } from "@/lib/business";
import { FACILITIES, POOL, useHospital } from "@/lib/hospital-data";
import { FeeSchedule } from "@/components/fee-schedule";

export function HospitalBilling() {
  const { t: tr } = useLanguage();
  const { state } = useHospital();
  const facility = FACILITIES.find((f) => f.id === state.facilityId) ?? FACILITIES[0]!;
  const placed = state.candidates.filter((c) => c.stage === "Accepted" || c.stage === "Offer sent" || c.stage === "Negotiating");
  const rows = placed.map((c) => {
    const n = POOL.find((p) => p.id === c.nurseId);
    const g = state.gigs.find((x) => x.id === c.gigId);
    return { id: `${c.nurseId}-${c.gigId}`, name: n?.name ?? c.nurseId, stage: c.stage, weeks: g?.weeks ?? 13, ...hospitalWeekly(c.weeklyPay) };
  });
  const active = rows.filter((r) => r.stage === "Accepted");
  const weeklyInvoice = active.reduce((a, r) => a + r.total, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="border border-border bg-card p-5">
          <p className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground"><CreditCard className="size-4" />{tr("Membership")}</p>
          <p className="mt-2 text-3xl font-black">{usd(membershipFee(facility.beds))}<span className="text-sm font-bold text-muted-foreground">{tr("/yr")}</span></p>
          <p className="text-sm text-muted-foreground">{tr(`${facility.beds} beds × $${FEE_PER_BED}/bed`)} · {tr("renews Jul 1, 2027")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{tr(`Clinics and sites without beds: $${CLINIC_FLAT_FEE.toLocaleString()}/yr per location`)}</p>
        </div>
        <div className="border border-border bg-card p-5">
          <p className="text-xs font-bold uppercase text-muted-foreground">{tr("Platform fee")}</p>
          <p className="mt-2 text-3xl font-black">{Math.round(WEPA_FEE_RATE * 100)}%</p>
          <p className="text-sm text-muted-foreground">{tr("On nurse pay processed through WEPA")}</p>
        </div>
        <div className="border-2 border-primary bg-primary/5 p-5">
          <p className="text-xs font-bold uppercase text-muted-foreground">{tr("Next weekly invoice")}</p>
          <p className="mt-2 text-3xl font-black">{usd(weeklyInvoice)}</p>
          <p className="text-sm text-muted-foreground">{tr(`${active.length} nurses on assignment`)}</p>
        </div>
      </div>

      <div className="overflow-x-auto border border-border bg-card">
        <h3 className="flex items-center gap-2 p-4 font-black"><FileText className="size-4" />{tr("Cost per nurse (weekly)")}</h3>
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-2">{tr("Nurse")}</th><th className="p-2">{tr("Stage")}</th><th className="p-2">{tr("Nurse take-home")}</th><th className="p-2">{tr("Gross pay")}</th><th className="p-2">{tr("WEPA fee")}</th><th className="p-2">{tr("Your total")}</th><th className="p-2">{tr("Assignment")}</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-2 font-semibold">{r.name}</td><td className="p-2">{tr(r.stage)}</td>
                <td className="p-2">{usd(r.nurseNet)}</td><td className="p-2">{usd(r.gross)}</td><td className="p-2">{usd(r.fee)}</td>
                <td className="p-2 font-black">{usd(r.total)}</td><td className="p-2">{usd(r.total * r.weeks)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="p-3 text-xs text-muted-foreground">{tr("Nurse take-home = gross pay minus WEPA's 8%. Your total = gross pay plus WEPA's 8%.")}</p>
      </div>

      <FeeSchedule />
      <p className="text-center text-xs text-muted-foreground">{tr("Simulated billing for demonstration. No real invoices or charges.")}</p>
    </div>
  );
}
