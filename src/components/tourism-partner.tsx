import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  Bookmark,
  CreditCard,
  Copy,
  Eye,
  Flame,
  Hospital,
  LogIn,
  LogOut,
  MapPin,
  Megaphone,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  Sparkles,
  Store,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import { LOCATIONS, type LocationId, type OfferType, type PerkCategory } from "@/lib/hospital-data";
import {
  CATEGORIES,
  OFFER_TYPES,
  PARTNER_ACCOUNTS,
  REGIONS,
  SAMPLE_IMAGES,
  accountOffers,
  boostSpend,
  customToDirectory,
  fullDirectory,
  hash,
  trending,
  usePartner,
  type AccountSlice,
  type CustomOffer,
  type DirectoryOffer,
  type OfferStatus,
  type PartnerAccount,
} from "@/lib/partner-offers";
import { BOOST_TIERS, boostTier, type BoostId } from "@/lib/business";
import { FeeSchedule } from "@/components/fee-schedule";
import heroImg from "@/assets/partners/el-conquistador.jpg";

const money = (n: number) => `$${n.toLocaleString()}`;
type Tab = "directory" | "trending" | "mine" | "billing";

export function TourismExperience() {
  const { t: tr } = useLanguage();
  const { state, account, slice, update, loginAs, logout, reset } = usePartner();
  const [tab, setTab] = useState<Tab>("directory");
  const [editing, setEditing] = useState<CustomOffer | null>(null);
  const [wizard, setWizard] = useState(false);
  const [boosting, setBoosting] = useState<CustomOffer | null>(null);
  const directory = useMemo(() => fullDirectory(state), [state]);

  if (!state.loggedIn) return <PartnerLanding count={directory.length} onLogin={loginAs} />;

  function save(o: CustomOffer) {
    update((s) => ({ ...s, offers: s.offers.some((x) => x.id === o.id) ? s.offers.map((x) => (x.id === o.id ? o : x)) : [o, ...s.offers] }));
    toast.success(tr(o.status === "Live" ? "Offer is live for hospitals." : "Draft saved."));
    setWizard(false);
    setEditing(null);
    setTab("mine");
  }

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">{tr("Partner workspace")}</p>
          <h2 className="text-2xl font-black sm:text-3xl">{account.name}</h2>
          <p className="text-xs text-muted-foreground">{tr(`${account.town} · ${account.category}`)}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setEditing(null); setWizard(true); }}><Plus />{tr("Create an offer")}</Button>
          <Button variant="outline" size="icon" aria-label={tr("Sign out")} onClick={logout}><LogOut /></Button>
        </div>
      </div>
      <nav className="sticky top-0 z-10 -mx-4 mt-5 flex gap-1 overflow-x-auto border-b border-border bg-background px-4 sm:mx-0 sm:px-0">
        {([["directory", "Offer directory", Store], ["trending", "Trending", Flame], ["mine", "My offers", BarChart3], ["billing", "Billing", CreditCard]] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)} className={cn("flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold", tab === id ? "border-primary text-foreground" : "border-transparent text-muted-foreground")}>
            <Icon className="size-4" />{tr(label)}
          </button>
        ))}
      </nav>
      <div className="mt-6">
        {tab === "directory" && <Directory list={directory} />}
        {tab === "trending" && <Trending list={directory} onCreate={() => setWizard(true)} />}
        {tab === "mine" && (
          <MyOffers
            offers={state.offers}
            boosts={state.boosts ?? {}}
            onBoost={setBoosting}
            onEdit={(o) => { setEditing(o); setWizard(true); }}
            onStatus={(id, status) => update((s) => ({ ...s, offers: s.offers.map((o) => (o.id === id ? { ...o, status } : o)) }))}
            onDuplicate={(o) => update((s) => ({ ...s, offers: [{ ...o, id: `partner-${Date.now()}`, title: `${o.title} (copy)`, status: "Draft" }, ...s.offers] }))}
            onReset={reset}
          />
        )}
      </div>
      <p className="mt-10 text-center text-xs text-muted-foreground">
        {tr("Real Puerto Rico businesses shown for demonstration. All deals, prices, and performance figures are synthetic.")}
      </p>
      <BoostDialog
        offer={boosting}
        current={boosting ? state.boosts?.[boosting.id] : undefined}
        onClose={() => setBoosting(null)}
        onSet={(id, tier) => {
          update((s) => { const b = { ...(s.boosts ?? {}) }; if (tier) b[id] = tier; else delete b[id]; return { ...s, boosts: b }; });
          toast.success(tr(tier ? "Boost active. Your offer now ranks higher for hospitals." : "Boost removed."));
          setBoosting(null);
        }}
      />
      <OfferWizard open={wizard} initial={editing} onClose={() => { setWizard(false); setEditing(null); }} onSave={save} />
    </section>
  );
}

/* ---------- Landing: sell participation ---------- */
function PartnerLanding({ count, onLogin }: { count: number; onLogin: () => void }) {
  const { t: tr } = useLanguage();
  return (
    <>
      <section className="relative isolate overflow-hidden bg-surface-dark text-surface-dark-foreground">
        <img src={heroImg} alt={tr("Cliffside resort over the Caribbean in Fajardo")} width={1600} height={900} className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-hero-wash" />
        <div className="mx-auto max-w-[1440px] px-4 pb-14 pt-20 sm:px-6 lg:px-8 lg:pb-20">
          <h1 className="max-w-3xl text-4xl font-black leading-[1.02] sm:text-6xl lg:text-7xl">
            {tr("Your island.")}<br /><span className="text-primary">{tr("Their perk.")}</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-surface-dark-foreground/85 sm:text-lg">
            {tr("Hospitals add your offer to travel-nurse gig packages. Nurses arrive with you already booked — a steady stream of guests who stay for weeks, not nights.")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={onLogin}><LogIn />{tr("Log in as a partner")}</Button>
          </div>
          <p className="mt-3 text-xs text-surface-dark-foreground/60">{tr("Demo login — no password needed.")}</p>
          <dl className="mt-12 grid max-w-3xl grid-cols-3 gap-4 border-t border-surface-dark-foreground/20 pt-6">
            {[[count, "offers in the directory"], [20, "hospitals building packages"], [120, "passported nurses matching"]].map(([n, l]) => (
              <div key={l}><dt className="text-3xl font-black sm:text-4xl">{n}</dt><dd className="text-xs text-surface-dark-foreground/70 sm:text-sm">{tr(String(l))}</dd></div>
            ))}
          </dl>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1440px] gap-4 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        {[
          [Megaphone, "1 · Post an offer", "Sell the experience and the perk: photo, deal headline, partner price, and optional requirements like hospital signage."],
          [Hospital, "2 · Hospitals select it", "Offers stay private to hospitals. When one adds yours to a gig package, it reaches every matched nurse."],
          [Users, "3 · Nurses arrive booked", "Weeks-long guests who post, review, and refer — affiliate marketing with a mission."],
        ].map(([Icon, t, d]) => {
          const I = Icon as typeof Megaphone;
          return (
            <article key={t as string} className="border border-border bg-card p-6">
              <I className="size-6 text-coral" />
              <h3 className="mt-3 text-lg font-extrabold">{tr(t as string)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tr(d as string)}</p>
            </article>
          );
        })}
      </section>
    </>
  );
}

/* ---------- Directory ---------- */
function Directory({ list }: { list: DirectoryOffer[] }) {
  const { t: tr } = useLanguage();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<PerkCategory | "All">("All");
  const [region, setRegion] = useState("All");
  const [type, setType] = useState<OfferType | "All">("All");
  const [freeOnly, setFreeOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(0);
  const [open, setOpen] = useState<DirectoryOffer | null>(null);
  const shown = list.filter((o) =>
    o.status === "Live" &&
    (cat === "All" || o.category === cat) &&
    (region === "All" || o.region.includes(region)) &&
    (type === "All" || o.offerType === type) &&
    (!freeOnly || o.free) &&
    (!maxPrice || o.cost <= maxPrice) &&
    (!q || `${o.title} ${o.partner} ${o.towns} ${o.headline ?? ""}`.toLowerCase().includes(q.toLowerCase())),
  );
  const sel = "h-9 border border-input bg-background px-2 text-sm";
  return (
    <>
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr("Search partners, towns, deals…")} className="pl-9" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["All", ...CATEGORIES] as const).map((c) => (
            <button key={c} onClick={() => setCat(c)} className={cn("shrink-0 px-3 py-1.5 text-xs font-bold", cat === c ? "bg-foreground text-background" : "bg-muted")}>{tr(c)}</button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select aria-label={tr("Region")} className={sel} value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="All">{tr("All regions")}</option>
            {REGIONS.map((r) => <option key={r} value={r}>{tr(r)}</option>)}
          </select>
          <select aria-label={tr("Offer type")} className={sel} value={type} onChange={(e) => setType(e.target.value as OfferType | "All")}>
            <option value="All">{tr("All offer types")}</option>
            {OFFER_TYPES.map((r) => <option key={r} value={r}>{tr(r)}</option>)}
          </select>
          <select aria-label={tr("Hospital price")} className={sel} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}>
            <option value={0}>{tr("Any hospital price")}</option>
            {[50, 100, 250, 1000, 5000].map((n) => <option key={n} value={n}>{tr("Up to")} {money(n)}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={freeOnly} onChange={(e) => setFreeOnly(e.target.checked)} />{tr("Free to hospital")}</label>
          <span className="ml-auto text-xs font-bold text-muted-foreground">{shown.length} {tr("offers")}</span>
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((o) => <OfferCard key={o.id} o={o} onOpen={() => setOpen(o)} />)}
      </div>
      {!shown.length && <p className="py-16 text-center text-sm text-muted-foreground">{tr("No offers match those filters.")}</p>}
      <OfferDetail o={open} onClose={() => setOpen(null)} />
    </>
  );
}

function TypeBadge({ t }: { t: OfferType }) {
  const { t: tr } = useLanguage();
  return <span className={cn("px-2 py-0.5 text-[10px] font-black uppercase", t === "Limited time" ? "bg-coral text-coral-foreground" : t === "Special" ? "bg-primary text-primary-foreground" : "bg-background/90 text-foreground")}>{tr(t)}</span>;
}

export function OfferCard({ o, onOpen }: { o: DirectoryOffer; onOpen?: () => void }) {
  const { t: tr } = useLanguage();
  const save = o.retail ? Math.round((1 - o.cost / o.retail) * 100) : 0;
  return (
    <button type="button" onClick={onOpen} className="group flex flex-col overflow-hidden border border-border bg-card text-left transition hover:border-primary">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={o.image} alt={tr(o.title)} loading="lazy" width={640} height={400} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface-dark/90 to-transparent p-3 pt-10 text-surface-dark-foreground">
          <p className="text-[11px] font-bold uppercase tracking-wide opacity-80">{o.partner}</p>
          {o.headline && <p className="text-lg font-black leading-tight">{tr(o.headline)}</p>}
        </div>
        <div className="absolute left-2 top-2 flex gap-1"><TypeBadge t={o.offerType} />{o.boost && <span className="bg-coral px-2 py-0.5 text-[10px] font-black uppercase text-coral-foreground">{tr("Featured")}</span>}</div>
        {save > 0 && <span className="absolute right-2 top-2 bg-background px-2 py-0.5 text-[11px] font-black">-{save}%</span>}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-extrabold leading-tight">{tr(o.title)}</h3>
        <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-primary"><MapPin className="size-3" />{tr(o.towns)}</p>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{tr(o.perkPitch)}</p>
        {o.requirement && <p className="mt-2 text-xs font-semibold text-coral">{tr("Requires:")} {tr(o.requirement)}</p>}
        {o.endsAt && <p className="mt-1 text-xs text-muted-foreground">{tr("Ends")} {o.endsAt}</p>}
        <div className="mt-auto flex items-end justify-between border-t border-border pt-3">
          <p><strong className="text-lg">{o.free ? tr("Free") : money(o.cost)}</strong> <span className="text-xs text-muted-foreground">{tr("to hospitals")}</span></p>
          <p className="text-xs text-muted-foreground line-through">{money(o.retail)}</p>
        </div>
      </div>
    </button>
  );
}

function OfferDetail({ o, onClose }: { o: DirectoryOffer | null; onClose: () => void }) {
  const { t: tr } = useLanguage();
  return (
    <Dialog open={!!o} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto p-0">
        {o && (
          <>
            <div className="relative aspect-[16/9]">
              <img src={o.image} alt={tr(o.title)} className="h-full w-full object-cover" />
              <div className="absolute left-3 top-3"><TypeBadge t={o.offerType} /></div>
            </div>
            <div className="space-y-4 p-5">
              <DialogHeader>
                <p className="text-xs font-bold uppercase text-primary">{o.partner} · {tr(o.category)}</p>
                <DialogTitle className="text-2xl font-black">{tr(o.title)}</DialogTitle>
                <DialogDescription>{tr(o.pitch)}</DialogDescription>
              </DialogHeader>
              {o.headline && <p className="bg-coral/10 p-3 font-extrabold text-coral">{tr(o.headline)}</p>}
              <div>
                <p className="text-xs font-bold uppercase text-muted-foreground">{tr("What nurses see")}</p>
                <p className="mt-1 font-semibold">“{tr(o.perkPitch)}”</p>
              </div>
              <ul className="flex flex-wrap gap-2">{o.included.map((i) => <li key={i} className="bg-muted px-2 py-1 text-xs font-semibold">{tr(i)}</li>)}</ul>
              <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                {[["Retail value", money(o.retail)], ["Hospital price", o.free ? tr("Free") : money(o.cost)], ["Capacity / month", String(o.capacity)], ["Where", tr(o.towns)]].map(([k, v]) => (
                  <div key={k} className="bg-muted p-3"><dt className="text-[11px] text-muted-foreground">{tr(k!)}</dt><dd className="font-bold">{v}</dd></div>
                ))}
              </dl>
              <div className="text-sm">
                <p className="font-bold">{tr("Terms")}</p>
                <p className="text-muted-foreground">
                  {o.requirement ? `${tr("Marketing requirement:")} ${tr(o.requirement)}. ` : ""}
                  {o.endsAt ? `${tr("Offer ends")} ${o.endsAt}. ` : ""}
                  {tr("Private to hospitals until selected into a nurse-facing gig package.")}
                </p>
              </div>
              <div className="flex flex-wrap gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Eye className="size-3" />{o.stats.views} {tr("hospital views")}</span>
                <span className="flex items-center gap-1"><Hospital className="size-3" />{o.stats.hospitalAdds} {tr("packages")}</span>
                <span className="flex items-center gap-1"><Users className="size-3" />{o.stats.nurseInterest}% {tr("nurse interest")}</span>
                <span>{tr("Synthetic metrics")}</span>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Trending ---------- */
function Trending({ list, onCreate }: { list: DirectoryOffer[]; onCreate: () => void }) {
  const { t: tr } = useLanguage();
  const t = useMemo(() => trending(list), [list]);
  const top = t.categories[0];
  const gap = t.regions[0];
  return (
    <div className="space-y-8">
      <div className="grid gap-3 md:grid-cols-2">
        {top && (
          <div className="bg-surface-dark p-5 text-surface-dark-foreground">
            <TrendingUp className="size-5 text-primary" />
            <p className="mt-2 text-xl font-black">{tr(top.name)} {tr("is up")} {top.trend}% {tr("this month")}</p>
            <p className="text-sm opacity-75">{tr("Hospitals are adding these to packages faster than any other category.")}</p>
          </div>
        )}
        {gap && (
          <div className="border-2 border-coral bg-card p-5">
            <Sparkles className="size-5 text-coral" />
            <p className="mt-2 text-xl font-black">{tr("Opportunity:")} {gap.name}</p>
            <p className="text-sm text-muted-foreground">{gap.demand} {tr("nurses interested")} · {gap.offers} {tr("offers available")}. {tr("Few partners compete here.")}</p>
            <Button size="sm" className="mt-3" onClick={onCreate}><Plus />{tr("Create an offer here")}</Button>
          </div>
        )}
      </div>
      <Ranked title="Most added by hospitals" list={t.byHospital} metric={(o) => `${o.stats.hospitalAdds} ${tr("packages")}`} />
      <Ranked title="Most wanted by nurses" list={t.byNurse} metric={(o) => `${o.stats.nurseInterest}% ${tr("interest")}`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h3 className="text-lg font-black">{tr("Category momentum")}</h3>
          <ul className="mt-3 space-y-2">
            {t.categories.map((c) => (
              <li key={c.name} className="flex items-center gap-3 text-sm">
                <span className="w-32 font-semibold">{tr(c.name)}</span>
                <div className="h-2 flex-1 bg-muted"><div className={cn("h-2", c.trend >= 0 ? "bg-primary" : "bg-coral")} style={{ width: `${Math.min(100, Math.abs(c.trend) * 3)}%` }} /></div>
                <span className="w-14 text-right font-bold">{c.trend > 0 ? "+" : ""}{c.trend}%</span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="text-lg font-black">{tr("Demand vs. supply by region")}</h3>
          <ul className="mt-3 space-y-2">
            {t.regions.map((r) => (
              <li key={r.id} className="flex items-center justify-between border-b border-border pb-2 text-sm">
                <span><strong>{r.name}</strong> <span className="text-muted-foreground">· {tr(r.region)}</span></span>
                <span className="text-xs">{r.demand} {tr("nurses")} · {r.offers} {tr("offers")} {r.gap > 0 && <span className="ml-1 bg-coral/15 px-1.5 font-bold text-coral">{tr("gap")}</span>}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <p className="text-xs text-muted-foreground">{tr("Trend signals are synthetic, generated for demonstration.")}</p>
    </div>
  );
}

function Ranked({ title, list, metric }: { title: string; list: DirectoryOffer[]; metric: (o: DirectoryOffer) => string }) {
  const { t: tr } = useLanguage();
  return (
    <section>
      <h3 className="text-lg font-black">{tr(title)}</h3>
      <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-2">
        {list.map((o, i) => (
          <article key={o.id} className="relative w-60 shrink-0 snap-start overflow-hidden border border-border bg-card">
            <img src={o.image} alt={tr(o.title)} loading="lazy" className="aspect-[16/10] w-full object-cover" />
            <span className="absolute left-2 top-2 bg-foreground px-2 font-black text-background">#{i + 1}</span>
            <div className="p-3">
              <p className="text-[11px] font-bold uppercase text-muted-foreground">{o.partner}</p>
              <p className="line-clamp-2 text-sm font-extrabold">{tr(o.title)}</p>
              <p className="mt-1 text-xs font-bold text-primary">{metric(o)}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------- My offers ---------- */
function MyOffers({ offers, boosts, onBoost, onEdit, onStatus, onDuplicate, onReset }: {
  offers: CustomOffer[]; boosts: Record<string, BoostId>; onBoost: (o: CustomOffer) => void; onEdit: (o: CustomOffer) => void; onStatus: (id: string, s: OfferStatus) => void; onDuplicate: (o: CustomOffer) => void; onReset: () => void;
}) {
  const { t: tr } = useLanguage();
  const d = offers.map(customToDirectory);
  const live = d.filter((o) => o.status === "Live");
  const sum = (k: keyof DirectoryOffer["stats"]) => live.reduce((a, o) => a + o.stats[k], 0);
  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[["Live offers", live.length], ["Hospital views", sum("views")], ["Saves", sum("saves")], ["Packages selected", sum("hospitalAdds")]].map(([k, v]) => (
          <div key={k as string} className="border border-border bg-card p-4"><dt className="text-xs text-muted-foreground">{tr(k as string)}</dt><dd className="text-3xl font-black">{(v as number).toLocaleString()}</dd></div>
        ))}
      </dl>
      <div className="space-y-3">
        {d.map((o) => {
          const raw = offers.find((x) => x.id === o.id)!;
          return (
            <article key={o.id} className="flex flex-col gap-3 border border-border bg-card p-3 sm:flex-row">
              <img src={o.image} alt={tr(o.title)} className="aspect-[16/10] w-full object-cover sm:w-48" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("px-2 py-0.5 text-[10px] font-black uppercase", o.status === "Live" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>{tr(o.status)}</span>
                  <TypeBadge t={o.offerType} />
                  {boosts[o.id] && <span className="bg-coral px-2 py-0.5 text-[10px] font-black uppercase text-coral-foreground">{tr(boostTier(boosts[o.id])!.name)}</span>}
                </div>
                <h3 className="mt-1 font-extrabold">{tr(o.title)}</h3>
                <p className="text-xs text-muted-foreground">{tr(o.headline ?? "")} · {o.free ? tr("Free") : money(o.cost)} {tr("to hospitals")} · {tr(o.towns)}</p>
                {o.status === "Live" && (
                  <p className="mt-2 flex flex-wrap gap-3 text-xs">
                    <span className="flex items-center gap-1"><Eye className="size-3" />{Math.round(o.stats.views * (boostTier(boosts[o.id])?.lift ?? 1))}</span>
                    <span className="flex items-center gap-1"><Bookmark className="size-3" />{o.stats.saves}</span>
                    <span className="flex items-center gap-1"><Hospital className="size-3" />{o.stats.hospitalAdds} {tr("packages")}</span>
                    <span className="flex items-center gap-1"><Users className="size-3" />{o.stats.hospitalAdds * 6} {tr("nurses reached")}</span>
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-start gap-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(raw)}><Pencil />{tr("Edit")}</Button>
                {o.status === "Live" ? (
                  <Button size="sm" variant="outline" onClick={() => onStatus(o.id, "Paused")}><Pause />{tr("Pause")}</Button>
                ) : o.status !== "Ended" ? (
                  <Button size="sm" onClick={() => onStatus(o.id, "Live")}><Play />{tr("Publish")}</Button>
                ) : null}
                {o.status === "Live" && <Button size="sm" onClick={() => onBoost(raw)}><Megaphone />{tr(boosts[o.id] ? "Boosted" : "Boost")}</Button>}
                <Button size="sm" variant="outline" onClick={() => onDuplicate(raw)}><Copy />{tr("Duplicate")}</Button>
                {o.status !== "Ended" && <Button size="sm" variant="ghost" onClick={() => onStatus(o.id, "Ended")}><X />{tr("End")}</Button>}
              </div>
            </article>
          );
        })}
      </div>
      <button onClick={onReset} className="text-xs text-muted-foreground underline">{tr("Reset demo")}</button>
    </div>
  );
}

/* ---------- Create / edit wizard ---------- */
const STEPS = ["Experience", "Perk", "Deal", "Requirements", "Where", "Preview"] as const;
const REQS = ["Poster in nurses' station", "Logo on hospital partner page", "Mention in nurse onboarding email", "Flyer at employee entrance"];
const blank = (): CustomOffer => ({
  id: `partner-${Date.now()}`, title: "", category: "Adventure", image: SAMPLE_IMAGES[7]!, pitch: "", perkPitch: "", included: [],
  offerType: "Standard", headline: "", retail: 0, cost: 0, capacity: 10, locations: ["fajardo"], status: "Draft",
});

function OfferWizard({ open, initial, onClose, onSave }: { open: boolean; initial: CustomOffer | null; onClose: () => void; onSave: (o: CustomOffer) => void }) {
  const { t: tr } = useLanguage();
  const [step, setStep] = useState(0);
  const [o, setO] = useState<CustomOffer>(blank);
  const [key, setKey] = useState<string | null>(null);
  const k = open ? (initial?.id ?? "new") : null;
  if (k !== key) { setKey(k); setStep(0); setO(initial ?? blank()); }
  const set = (p: Partial<CustomOffer>) => setO((c) => ({ ...c, ...p }));
  const canNext = step !== 0 || (o.title.trim() && o.pitch.trim());
  const locs = o.locations === "all" ? [] : o.locations;
  function upload(f?: File) {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => set({ image: String(r.result) });
    r.readAsDataURL(f);
  }
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">{tr(initial ? "Edit offer" : "New partner offer")}</DialogTitle>
          <DialogDescription>{tr("Hospitals see this privately. Nurses only see it once it's in a gig package.")}</DialogDescription>
        </DialogHeader>
        <ol className="flex gap-1">{STEPS.map((s, i) => <li key={s} className={cn("h-1 flex-1", i <= step ? "bg-primary" : "bg-muted")} />)}</ol>
        <p className="text-xs font-bold uppercase text-muted-foreground">{step + 1}/{STEPS.length} · {tr(STEPS[step]!)}</p>
        <div className="space-y-4">
          {step === 0 && (
            <>
              <F label={tr("Experience title")}><Input value={o.title} onChange={(e) => set({ title: e.target.value })} placeholder={tr("e.g. Sunset sail for two")} /></F>
              <F label={tr("Category")}>
                <div className="flex flex-wrap gap-2">{CATEGORIES.map((c) => <Chip key={c} on={o.category === c} onClick={() => set({ category: c })}>{tr(c)}</Chip>)}</div>
              </F>
              <F label={tr("Sell the experience")}><Textarea value={o.pitch} onChange={(e) => set({ pitch: e.target.value })} placeholder={tr("What makes it unforgettable?")} /></F>
              <F label={tr("Photo")}>
                <div className="grid grid-cols-5 gap-2">
                  {SAMPLE_IMAGES.slice(0, 9).map((src) => (
                    <button key={src} type="button" onClick={() => set({ image: src })} className={cn("aspect-square overflow-hidden border-2", o.image === src ? "border-primary" : "border-transparent")}><img src={src} alt="" className="h-full w-full object-cover" /></button>
                  ))}
                  <label className="flex aspect-square cursor-pointer items-center justify-center border-2 border-dashed border-border text-[10px] font-bold">{tr("Upload")}<input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} /></label>
                </div>
              </F>
            </>
          )}
          {step === 1 && (
            <>
              <F label={tr("Nurse-facing perk line")}><Input value={o.perkPitch} onChange={(e) => set({ perkPitch: e.target.value })} placeholder={tr("e.g. Celebrate your first week with a sunset sail.")} /></F>
              <F label={tr("What's included (comma separated)")}><Input value={o.included.join(", ")} onChange={(e) => set({ included: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} placeholder={tr("Guide, gear, drinks")} /></F>
            </>
          )}
          {step === 2 && (
            <>
              <F label={tr("Offer type")}><div className="flex gap-2">{OFFER_TYPES.map((t) => <Chip key={t} on={o.offerType === t} onClick={() => set({ offerType: t })}>{tr(t)}</Chip>)}</div></F>
              <F label={tr("Deal headline")}><Input value={o.headline} onChange={(e) => set({ headline: e.target.value })} placeholder={tr("e.g. 50% off for nurses")} /></F>
              {o.offerType === "Limited time" && <F label={tr("Ends on")}><Input type="date" value={o.endsAt ?? ""} onChange={(e) => set({ endsAt: e.target.value })} /></F>}
              <div className="grid grid-cols-3 gap-3">
                <F label={tr("Retail ($)")}><Input type="number" min={0} value={o.retail || ""} onChange={(e) => set({ retail: Number(e.target.value) })} /></F>
                <F label={tr("Hospital price ($)")}><Input type="number" min={0} value={o.cost || ""} onChange={(e) => set({ cost: Number(e.target.value) })} placeholder="0 = free" /></F>
                <F label={tr("Capacity / month")}><Input type="number" min={1} value={o.capacity} onChange={(e) => set({ capacity: Number(e.target.value) })} /></F>
              </div>
            </>
          )}
          {step === 3 && (
            <F label={tr("Marketing requirement (optional)")}>
              <div className="flex flex-wrap gap-2">
                <Chip on={!o.requirement} onClick={() => set({ requirement: undefined })}>{tr("None")}</Chip>
                {REQS.map((r) => <Chip key={r} on={o.requirement === r} onClick={() => set({ requirement: r })}>{tr(r)}</Chip>)}
              </div>
              <Input className="mt-2" value={o.requirement ?? ""} onChange={(e) => set({ requirement: e.target.value || undefined })} placeholder={tr("Or write your own")} />
            </F>
          )}
          {step === 4 && (
            <F label={tr("Available for gigs near")}>
              <div className="flex flex-wrap gap-2">
                <Chip on={o.locations === "all"} onClick={() => set({ locations: "all" })}>{tr("Island-wide")}</Chip>
                {LOCATIONS.map((l) => (
                  <Chip key={l.id} on={locs.includes(l.id)} onClick={() => {
                    const next = locs.includes(l.id) ? locs.filter((x) => x !== l.id) : [...locs, l.id as LocationId];
                    set({ locations: next.length ? next : "all" });
                  }}>{l.name}</Chip>
                ))}
              </div>
            </F>
          )}
          {step === 5 && (
            <>
              <p className="text-sm text-muted-foreground">{tr("This is exactly how hospitals will see your offer.")}</p>
              <div className="mx-auto max-w-xs"><OfferCard o={customToDirectory(o)} /></div>
            </>
          )}
        </div>
        <div className="flex justify-between gap-2 pt-2">
          <Button variant="ghost" onClick={() => (step ? setStep(step - 1) : onClose())}>{tr(step ? "Back" : "Cancel")}</Button>
          {step < STEPS.length - 1 ? (
            <Button disabled={!canNext} onClick={() => setStep(step + 1)}>{tr("Continue")}<ArrowRight /></Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onSave({ ...o, status: "Draft" })}>{tr("Save draft")}</Button>
              <Button onClick={() => onSave({ ...o, status: "Live" })}>{tr("Publish to hospitals")}</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function F({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1.5"><p className="text-sm font-bold">{label}</p>{children}</div>;
}
function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" onClick={onClick} className={cn("px-3 py-1.5 text-xs font-bold", on ? "bg-foreground text-background" : "bg-muted")}>{children}</button>;
}

/* ---------- Boost (paid placement, simulated checkout) ---------- */
function BoostDialog({ offer, current, onClose, onSet }: { offer: CustomOffer | null; current?: BoostId | undefined; onClose: () => void; onSet: (id: string, tier?: BoostId) => void }) {
  const { t: tr } = useLanguage();
  const [pick, setPick] = useState<BoostId>("featured");
  if (!offer) return null;
  const tier = BOOST_TIERS.find((t) => t.id === pick)!;
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">{tr("Boost this offer")}</DialogTitle>
          <DialogDescription>{tr(offer.title)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {BOOST_TIERS.map((t) => (
            <button key={t.id} type="button" onClick={() => setPick(t.id)} className={cn("flex w-full items-start justify-between gap-3 border p-3 text-left", pick === t.id ? "border-primary ring-2 ring-primary" : "border-border")}>
              <div><p className="font-black">{tr(t.name)}{current === t.id && <span className="ml-2 text-xs text-primary">{tr("Current")}</span>}</p><p className="text-xs text-muted-foreground">{tr(t.blurb)}</p><p className="mt-1 text-xs font-semibold text-primary">{tr(`About ${t.lift}× hospital views`)}</p></div>
              <strong className="shrink-0 text-lg">{money(t.price)}<span className="text-xs text-muted-foreground">{tr("/mo")}</span></strong>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-3">
          {current ? <Button variant="ghost" onClick={() => onSet(offer.id)}>{tr("Remove boost")}</Button> : <span />}
          <Button onClick={() => onSet(offer.id, pick)}><Sparkles />{tr(`Pay ${money(tier.price)}/mo · simulated`)}</Button>
        </div>
        <p className="text-xs text-muted-foreground">{tr("Simulated checkout for demonstration. No card is charged.")}</p>
      </DialogContent>
    </Dialog>
  );
}
