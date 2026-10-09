import { Banknote, CalendarDays, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { SAMPLE_ASSIGNMENT, netPay, payoutSchedule, usd, useBusiness } from "@/lib/business";

/** Nurse pay: everything is shown as net take-home. WEPA is free for nurses. */
export function NursePay() {
  const { t: tr } = useLanguage();
  const { state } = useBusiness();
  const schedule = payoutSchedule();
  const weekly = netPay(SAMPLE_ASSIGNMENT.gross);
  const total = weekly * SAMPLE_ASSIGNMENT.weeks;
  return (
    <section className="space-y-4">
      <div className="rounded-3xl bg-surface-dark p-6 text-surface-dark-foreground">
        <p className="eyebrow text-primary">{tr("Your take-home pay")}</p>
        <p className="mt-2 text-5xl font-black">{usd(weekly)}<span className="text-lg font-bold opacity-70">{tr("/wk")}</span></p>
        <p className="mt-1 text-sm opacity-80">{tr("Net, paid weekly through WEPA")} · {tr(SAMPLE_ASSIGNMENT.hospital)}</p>
        <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
          <div><dt className="text-[11px] uppercase opacity-70">{tr("Weeks")}</dt><dd className="text-xl font-black">{SAMPLE_ASSIGNMENT.weeks}</dd></div>
          <div><dt className="text-[11px] uppercase opacity-70">{tr("Assignment total")}</dt><dd className="text-xl font-black">{usd(total)}</dd></div>
          <div><dt className="text-[11px] uppercase opacity-70">{tr("Cost to you")}</dt><dd className="text-xl font-black text-primary">{tr("Free")}</dd></div>
        </dl>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex gap-3 rounded-2xl border border-border bg-card p-4"><Banknote className="size-5 shrink-0 text-primary" /><div><p className="font-bold">{tr("Payout method")}</p><p className="text-sm text-muted-foreground">{tr(state.payoutMethod)}</p></div></div>
        <div className="flex gap-3 rounded-2xl border border-border bg-card p-4"><ShieldCheck className="size-5 shrink-0 text-primary" /><div><p className="font-bold">{tr("No fees for nurses")}</p><p className="text-sm text-muted-foreground">{tr("Every amount you see is what lands in your account.")}</p></div></div>
      </div>
      <div className="rounded-3xl border border-border bg-card p-5">
        <h3 className="flex items-center gap-2 font-black"><CalendarDays className="size-4" />{tr("Upcoming payouts")}</h3>
        <ul className="mt-3 divide-y divide-border text-sm">
          {schedule.slice(0, 6).map((p) => (
            <li key={p.week} className="flex justify-between py-2"><span>{tr("Week")} {p.week} · {p.date}</span><strong>{usd(p.net)}</strong></li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">{tr(`+ ${schedule.length - 6} more weekly payouts`)}</p>
      </div>
      <p className="text-center text-xs text-muted-foreground">{tr("Sample assignment and payouts for demonstration. No real money moves.")}</p>
    </section>
  );
}
