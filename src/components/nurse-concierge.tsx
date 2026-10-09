import { useState } from "react";
import { Car, Check, Plane, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import { SERVICES, bookingTotals, usd, useBusiness, type ServiceKind } from "@/lib/business";

const KINDS: { id: ServiceKind; icon: typeof Plane }[] = [
  { id: "Flights", icon: Plane },
  { id: "Airport transfer", icon: Car },
  { id: "Concierge", icon: Sparkles },
];

export function NurseConcierge() {
  const { t: tr } = useLanguage();
  const { state, update } = useBusiness();
  const [kind, setKind] = useState<ServiceKind>("Flights");
  const [date, setDate] = useState("2027-01-09");
  const totals = bookingTotals(state.bookings);

  function book(id: string, covered: boolean) {
    const s = SERVICES.find((x) => x.id === id)!;
    update((st) => ({ ...st, bookings: [...st.bookings, { id: `b-${Date.now()}`, serviceId: s.id, title: s.title, detail: s.detail, price: s.price, date, covered }] }));
    toast.success(tr(covered ? "Added to your trip — covered by your package." : "Booked. Added to your trip itinerary."));
  }

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-border bg-card p-5">
        <p className="eyebrow">{tr("Travel & concierge")}</p>
        <h3 className="mt-1 text-2xl font-black">{tr("Land ready. We handle the rest.")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{tr("Flights, airport pickups and settle-in help, booked in one place.")}</p>
        <div className="mt-4 flex gap-1 overflow-x-auto">
          {KINDS.map(({ id, icon: Icon }) => (
            <button key={id} type="button" onClick={() => setKind(id)} className={cn("flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold", kind === id ? "bg-foreground text-background" : "bg-muted")}>
              <Icon className="size-3.5" />{tr(id)}
            </button>
          ))}
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm">{tr("Date")}
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9 rounded-md border border-input bg-card px-2 text-sm" />
        </label>
        <ul className="mt-3 space-y-2">
          {SERVICES.filter((s) => s.kind === kind).map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border p-3">
              <div className="min-w-0 flex-1">
                <p className="font-bold">{tr(s.title)}</p>
                <p className="text-xs text-muted-foreground">{tr(s.detail)}</p>
                {s.often && <p className="mt-1 text-[11px] font-semibold text-primary">{tr(s.often)}</p>}
              </div>
              <strong className="text-lg">{usd(s.price)}</strong>
              <div className="flex gap-2">
                {s.often && <Button size="sm" variant="outline" onClick={() => book(s.id, true)}>{tr("Use package")}</Button>}
                <Button size="sm" onClick={() => book(s.id, false)}>{tr("Book")}</Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-3xl border border-border bg-card p-5">
        <h3 className="font-black">{tr("Your trip itinerary")}</h3>
        <ul className="mt-3 divide-y divide-border text-sm">
          {[...state.bookings].sort((a, b) => a.date.localeCompare(b.date)).map((b) => (
            <li key={b.id} className="flex items-center gap-3 py-2">
              <Check className="size-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1"><p className="font-semibold">{tr(b.title)}</p><p className="text-xs text-muted-foreground">{b.date} · {tr(b.detail)}</p></div>
              <strong>{b.covered ? tr("Included") : usd(b.price)}</strong>
              <button type="button" aria-label={tr("Remove")} onClick={() => update((s) => ({ ...s, bookings: s.bookings.filter((x) => x.id !== b.id) }))} className="text-muted-foreground"><Trash2 className="size-4" /></button>
            </li>
          ))}
          {state.bookings.length === 0 && <li className="py-2 text-muted-foreground">{tr("Nothing booked yet.")}</li>}
        </ul>
        <p className="mt-3 flex justify-between border-t border-border pt-3 text-sm"><span>{tr(`${totals.covered} covered by your package`)}</span><strong>{tr("You pay")} {usd(totals.nurseTotal)}</strong></p>
      </div>
      <p className="text-center text-xs text-muted-foreground">{tr("Sample prices for demonstration. No real bookings or charges.")}</p>
    </section>
  );
}
