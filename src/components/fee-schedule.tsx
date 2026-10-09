import { Tags } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { BOOST_TIERS, CLINIC_FLAT_FEE, FEE_PER_BED, WEPA_FEE_RATE, usd } from "@/lib/business";

const boostMin = BOOST_TIERS[0]!.price;
const boostMax = BOOST_TIERS[BOOST_TIERS.length - 1]!.price;
const pct = `${Math.round(WEPA_FEE_RATE * 100)}%`;

const ROWS: { id: string; who: string; price: string; note: string; detail: string }[] = [
  {
    id: "nurse",
    who: "For nurses",
    price: usd(0),
    note: "always",
    detail: `Free to join, apply and work. WEPA's ${pct} comes out of pay processed through the platform before payout.`,
  },
  {
    id: "hospital",
    who: "For hospitals",
    price: usd(FEE_PER_BED),
    note: "/bed/yr",
    detail: `Annual membership by licensed bed count, plus ${pct} on nurse pay processed through WEPA.`,
  },
  {
    id: "clinic",
    who: "For clinics and no-bed sites",
    price: usd(CLINIC_FLAT_FEE),
    note: "/location/yr",
    detail: `Flat annual membership per location, plus ${pct} on nurse pay processed through WEPA.`,
  },
  {
    id: "partner",
    who: "For travel & tourism partners",
    price: `${usd(boostMin)}–${usd(boostMax)}`,
    note: "/mo",
    detail: "Free to list. Boost, Featured and Spotlight raise an offer in the directory and the hospital perk menu.",
  },
  {
    id: "traveler",
    who: "For travelers",
    price: "Per booking",
    note: "",
    detail: "Flights, transfers and concierge are billed at the listed price; providers pay WEPA a share.",
  },
];

/** One fee table, shown to every audience. */
export function FeeSchedule() {
  const { t: tr } = useLanguage();
  return (
    <div className="border border-border bg-card">
      <h3 className="flex items-center gap-2 p-4 font-black">
        <Tags className="size-4" />
        {tr("Fee schedule")}
      </h3>
      <ul className="divide-y divide-border">
        {ROWS.map((r) => (
          <li key={r.id} className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1 p-4">
            <div className="min-w-0">
              <p className="font-black">{tr(r.who)}</p>
              <p className="text-sm text-muted-foreground">{tr(r.detail)}</p>
            </div>
            <p className="shrink-0 text-right text-xl font-black">
              {r.price === "Per booking" ? tr(r.price) : r.price}
              {r.note ? <span className="text-xs font-bold text-muted-foreground">{tr(r.note)}</span> : null}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
