import { useLanguage } from "@/lib/i18n";
import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Handshake,
  LogIn,
  LogOut,
  MapPin,
  MessageSquare,
  Plus,
  RotateCcw,
  Search,
  Send,
  Trophy,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import heroImage from "@/assets/hospital-hero.jpg";
import coastImg from "@/assets/puerto-rico-coast.jpg";
import hiltonImg from "@/assets/partners/caribe-hilton.jpg";
import villaImg from "@/assets/partners/villa-montana.jpg";
import eastImg from "@/assets/partners/east-island.jpg";
import bioImg from "@/assets/partners/bio-bay.jpg";
import toroImg from "@/assets/partners/toro-verde.jpg";
import bacardiImg from "@/assets/partners/casa-bacardi.jpg";
import spaImg from "@/assets/partners/copamarina.jpg";
import doradoImg from "@/assets/partners/dorado-beach.jpg";
import conqImg from "@/assets/partners/el-conquistador.jpg";
import hospitalIconAsset from "@/assets/wepa-hospital.png.asset.json";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { PassportThumb, PassportViewer, Pipeline } from "@/components/hospital-ats";
import {
  ATS_STAGES,
  COMPETITORS,
  FACILITIES,
  LOCATIONS,
  MUNICIPALITIES,
  POOL,
  hubFor,
  offerOf,
  matchScore,
  packageTotals,
  perksFor,
  useHospital,
  weeklyValue,
  type AtsStage,
  type HospitalGig,
  type LocationId,
  type Perk,
  type PerkCategory,
  type PoolNurse,
} from "@/lib/hospital-data";

type Tab = "dashboard" | "pool" | "pipeline" | "build";
const money = (n: number) => `$${n.toLocaleString()}`;
const locName = (id: LocationId) => LOCATIONS.find((l) => l.id === id)?.name ?? id;

export function HospitalExperience() {
  const { t: tr } = useLanguage();
  const { state, update, reset } = useHospital();
  const [tab, setTab] = useState<Tab>("dashboard");
  const facility = FACILITIES.find((f) => f.id === state.facilityId) ?? FACILITIES[0]!;

  if (!state.loggedIn)
    return (
      <HospitalLanding
        onLogin={(id) => {
          const loc = FACILITIES.find((f) => f.id === id)?.location ?? "dorado";
          update((s) => ({
            ...s,
            loggedIn: true,
            facilityId: id,
            gigs: s.gigs.map((g) =>
              g.views > 0 ? { ...g, location: loc, title: `${g.specialty} in ${locName(loc)}` } : g,
            ),
          }));
        }}
      />
    );

  const tabs: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "pool", label: "Nurse pool", icon: Users },
    { id: "pipeline", label: "Pipeline", icon: Handshake },
    { id: "build", label: "Build a gig", icon: Plus },
  ];

  return (
    <section className="mx-auto max-w-[1440px] px-4 pb-28 pt-8 sm:px-6 md:pb-12 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={hospitalIconAsset.url}
            alt={tr("")}
            aria-hidden
            className="size-12 object-contain"
          />
          <div>
            <h2 className="text-2xl font-black sm:text-3xl">{tr(facility.name)}</h2>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5" /> {tr(locName(facility.location))} · {tr(facility.beds)}
              {tr(" beds")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              reset();
              toast.success(tr("Demo data restored."));
            }}
          >
            <RotateCcw />
            {tr(" Reset demo")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => update((s) => ({ ...s, loggedIn: false }))}
          >
            <LogOut />
            {tr(" Log out")}
          </Button>
        </div>
      </div>

      <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors",
              tab === t.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <t.icon className="size-4" /> {tr(t.label)}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {tab === "dashboard" && <Dashboard facilityLocation={facility.location} onGo={setTab} />}
        {tab === "pool" && <NursePool facilityLocation={facility.location} />}
        {tab === "pipeline" && <Pipeline facilityLocation={facility.location} />}
        {tab === "build" && (
          <GigBuilder
            facilityName={facility.name}
            facilityLocation={facility.location}
            onDone={() => setTab("dashboard")}
          />
        )}
      </div>
    </section>
  );
}

/* ---------------- Landing ---------------- */

function HospitalLanding({ onLogin }: { onLogin: (facilityId: string) => void }) {
  const { t: tr } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <>
      <section className="relative isolate overflow-hidden bg-surface-dark text-surface-dark-foreground">
        <img
          src={heroImage}
          alt={tr("Puerto Rico hospital at golden hour with mountains behind")}
          width={1600}
          height={912}
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-hero-wash" />
        <div className="mx-auto max-w-[1440px] px-4 pb-14 pt-20 sm:px-6 lg:px-8 lg:pb-20">
          <h1 className="max-w-2xl text-4xl font-black leading-[1.02] sm:text-6xl lg:text-7xl">
            {tr("Pay local.")}
            <br />
            <span className="text-primary">{tr("Let the island recruit.")}</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-surface-dark-foreground/85 sm:text-lg">
            {tr(
              "You can’t outbid mainland travel contracts — and you don’t have to. Pair honest local pay with travel, lodging and adventures from partners near you, and ",
            )}
            <strong className="text-surface-dark-foreground">
              {tr("reach nurses who are already Puerto Rico ready.")}
            </strong>
          </p>
          <div className="mt-6 grid max-w-lg grid-cols-3 gap-3">
            <Stat
              value={String(POOL.filter((n) => n.status === "Passport ready").length)}
              label={tr("passported nurses in pool")}
            />
            <Stat
              value={String(new Set(POOL.flatMap((n) => n.regions)).size)}
              label={tr("regions nurses want")}
            />
            <Stat value="~60%" label={tr("perk value at partner cost")} />
          </div>
          <Button size="lg" className="mt-7" onClick={() => setOpen(true)}>
            <LogIn />
            {tr(" Log in")}
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black sm:text-4xl">{tr("Your location is your offer.")}</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          {tr(
            "Utuado sells mountains, coffee and rivers. Dorado sells resort beaches. Ponce sells culture and sun. WEPA shows you the partners and perks that make sense where you are.",
          )}
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LOCATIONS.slice(0, 4).map((l) => (
            <div key={l.id} className="border border-border bg-card p-5">
              <p className="text-[10px] font-black uppercase text-muted-foreground">
                {tr(l.region)}
              </p>
              <h3 className="mt-1 text-xl font-black">{tr(l.name)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{tr(l.vibe)}</p>
              <p className="mt-3 text-xs font-bold text-primary">
                {tr(perksFor(l.id).length)}
                {tr(" perks available")}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            [
              "Explore",
              "Browse nurses who finished their Puerto Rico Readiness Passport, filtered by the island regions they want.",
            ],
            [
              "Build",
              "Assemble a gig package from dozens of partner perks — at partner cost, or free from your own facility.",
            ],
            [
              "Compete & hire",
              "See how your pay + perks rank against other facilities, then message, negotiate and send offers.",
            ],
          ].map(([t, d], i) => (
            <div key={t} className="border-l-4 border-primary bg-primary/5 p-5">
              <p className="text-xs font-black text-primary">0{i + 1}</p>
              <h3 className="text-lg font-black">{tr(t)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{tr(d)}</p>
            </div>
          ))}
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tr("Log in to your facility")}</DialogTitle>
            <DialogDescription>
              {tr(
                "Demo access — no password needed. Pick a facility to see how location changes everything.",
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            {FACILITIES.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onLogin(f.id)}
                className="flex items-center justify-between border border-border bg-card p-4 text-left hover:border-primary"
              >
                <span>
                  <strong className="block">{tr(f.name)}</strong>
                  <span className="text-xs text-muted-foreground">
                    {tr(locName(f.location))} · {tr(f.beds)}
                    {tr(" beds")}
                  </span>
                </span>
                <ArrowRight className="size-4 text-primary" />
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {tr("All facilities are fictional demo accounts.")}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  const { t: tr } = useLanguage();
  return (
    <div className="border-l-2 border-primary pl-3">
      <strong className="block text-2xl font-black">{tr(value)}</strong>
      <span className="text-[11px] leading-tight text-surface-dark-foreground/75">{tr(label)}</span>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */

function Dashboard({
  facilityLocation,
  onGo,
}: {
  facilityLocation: LocationId;
  onGo: (t: Tab) => void;
}) {
  const { t: tr } = useLanguage();
  const { state } = useHospital();
  const c = state.candidates;
  const accepted = c.filter((x) => x.stage === "Accepted").length;
  const offers = c.filter(
    (x) => x.stage === "Offer sent" || x.stage === "Accepted" || x.stage === "Declined",
  ).length;
  const matches = POOL.filter((n) => matchScore(n, facilityLocation) >= 80).length;
  const avgCost = state.gigs.length
    ? Math.round(
        state.gigs.reduce((a, g) => a + packageTotals(g.perks).cost, 0) / state.gigs.length,
      )
    : 0;
  const funnel = ATS_STAGES.map((s) => ({
    s,
    n: c.filter((x) => ATS_STAGES.indexOf(x.stage as AtsStage) >= ATS_STAGES.indexOf(s)).length,
  }));
  const maxF = Math.max(1, ...funnel.map((f) => f.n));
  const regionDemand = LOCATIONS.map((l) => ({
    l,
    n: POOL.filter((p) => p.regions.includes(l.id)).length,
  })).sort((a, b) => b.n - a.n);
  const maxR = Math.max(1, ...regionDemand.map((r) => r.n));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Kpi
          label={tr("Live gigs")}
          value={String(state.gigs.filter((g) => g.status === "Published").length)}
        />
        <Kpi label={tr("Strong pool matches")} value={String(matches)} />
        <Kpi label={tr("In pipeline")} value={String(c.length)} />
        <Kpi label={tr("Offers out")} value={String(offers)} />
        <Kpi
          label={tr("Acceptance rate")}
          value={offers ? `${Math.round((accepted / offers) * 100)}%` : "—"}
        />
        <Kpi label={tr("Avg package cost")} value={money(avgCost)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title={tr("Hiring funnel")}>
          <div className="space-y-2">
            {funnel.map((f) => (
              <div key={f.s} className="flex items-center gap-3 text-sm">
                <span className="w-24 shrink-0 text-muted-foreground">{tr(f.s)}</span>
                <div className="h-6 flex-1 bg-muted">
                  <div
                    className="flex h-full items-center bg-primary px-2 text-xs font-bold text-primary-foreground"
                    style={{ width: `${(f.n / maxF) * 100}%` }}
                  >
                    {tr(f.n)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title={tr("Where passported nurses want to go")}>
          <div className="space-y-2">
            {regionDemand.map(({ l, n }) => (
              <div key={l.id} className="flex items-center gap-3 text-sm">
                <span
                  className={cn(
                    "w-24 shrink-0",
                    l.id === facilityLocation ? "font-black text-primary" : "text-muted-foreground",
                  )}
                >
                  {tr(l.name)}
                </span>
                <div className="h-6 flex-1 bg-muted">
                  <div
                    className={cn(
                      "flex h-full items-center px-2 text-xs font-bold",
                      l.id === facilityLocation
                        ? "bg-coral text-primary-foreground"
                        : "bg-primary/60 text-primary-foreground",
                    )}
                    style={{ width: `${(n / maxR) * 100}%` }}
                  >
                    {tr(n)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel
        title={tr("Your gigs")}
        action={
          <Button size="sm" onClick={() => onGo("build")}>
            <Plus />
            {tr(" Build a gig")}
          </Button>
        }
      >
        <div className="divide-y divide-border">
          {state.gigs.map((g) => {
            const t = packageTotals(g.perks);
            const wv = weeklyValue(g.weeklyPay, t.retail, g.weeks);
            const rank = competitiveRank(g.location, wv);
            const applicants = c.filter((x) => x.gigId === g.id).length;
            return (
              <div
                key={g.id}
                className="grid gap-2 py-3 text-sm sm:grid-cols-[2fr_repeat(4,1fr)] sm:items-center"
              >
                <div>
                  <strong>{tr(g.title)}</strong>
                  <p className="text-xs text-muted-foreground">
                    {tr(g.specialty)} · {tr(locName(g.location))} · {tr(g.weeks)}
                    {tr(" wks · ")}
                    <span className={g.status === "Published" ? "text-primary" : ""}>
                      {tr(g.status)}
                    </span>
                  </p>
                </div>
                <span>
                  {tr(money(g.weeklyPay))}
                  {tr("/wk")}
                </span>
                <span className="text-primary">
                  {tr(money(wv))}
                  {tr("/wk value")}
                </span>
                <span>
                  {tr(g.views)}
                  {tr(" views · ")}
                  {tr(applicants)}
                  {tr(" in pipeline")}
                </span>
                <span className="flex items-center gap-1 font-bold">
                  <Trophy className="size-4 text-coral" /> #{tr(rank.rank)}
                  {tr(" of ")}
                  {tr(rank.total)}
                </span>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  const { t: tr } = useLanguage();
  return (
    <div className="border border-border bg-card p-4">
      <strong className="block text-2xl font-black">{tr(value)}</strong>
      <span className="text-[11px] uppercase text-muted-foreground">{tr(label)}</span>
    </div>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const { t: tr } = useLanguage();
  return (
    <div className="border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-lg font-black">{tr(title)}</h3>
        {tr(action)}
      </div>
      {tr(children)}
    </div>
  );
}

function competitiveRank(loc: LocationId, mine: number) {
  const values = COMPETITORS.map((c) => weeklyValue(c.weeklyPay, c.perkValue, 13));
  const rank = values.filter((v) => v > mine).length + 1;
  return { rank, total: values.length + 1, local: COMPETITORS.filter((c) => c.location === loc) };
}

/* ---------------- Nurse pool ---------------- */

function NursePool({ facilityLocation }: { facilityLocation: LocationId }) {
  const { t: tr } = useLanguage();
  const { state, update } = useHospital();
  const [q, setQ] = useState("");
  const [region, setRegion] = useState<LocationId | "any">(facilityLocation);
  const [specialty, setSpecialty] = useState("Any");
  const [readyOnly, setReadyOnly] = useState(true);
  const specialties = ["Any", ...Array.from(new Set(POOL.map((n) => n.specialty)))];
  const list = POOL.filter(
    (n) =>
      (region === "any" || n.regions.includes(region)) &&
      (specialty === "Any" || n.specialty === specialty) &&
      (!readyOnly || n.status === "Passport ready") &&
      `${n.name} ${n.home}`.toLowerCase().includes(q.toLowerCase()),
  ).sort((a, b) => matchScore(b, facilityLocation) - matchScore(a, facilityLocation));
  const gig = state.gigs[0];
  const [passport, setPassport] = useState<PoolNurse | null>(null);
  const [limit, setLimit] = useState(24);

  function shortlist(n: PoolNurse) {
    if (!gig) {
      toast.error(tr("Build a gig first."));
      return;
    }
    if (state.candidates.some((c) => c.nurseId === n.id)) {
      toast(tr(`${n.name} is already in your pipeline.`));
      return;
    }
    update((s) => ({
      ...s,
      candidates: [
        ...s.candidates,
        {
          nurseId: n.id,
          gigId: gig.id,
          stage: "Shortlisted",
          weeklyPay: gig.weeklyPay,
          messages: [],
        },
      ],
    }));
    toast.success(tr(`${n.name} added to your pipeline.`));
  }

  const sel = "h-10 rounded-md border border-input bg-card px-3 text-sm";
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-48 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tr("Search nurses")}
            className="pl-9"
          />
        </div>
        <select
          className={sel}
          value={region}
          onChange={(e) => setRegion(e.target.value as LocationId | "any")}
        >
          <option value="any">{tr("Any region")}</option>
          {LOCATIONS.map((l) => (
            <option key={l.id} value={l.id}>
              {tr("Wants ")}
              {tr(l.name)}
            </option>
          ))}
        </select>
        <select className={sel} value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
          {specialties.map((s) => (
            <option key={s} value={s}>
              {tr(s)}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={readyOnly}
            onChange={(e) => setReadyOnly(e.target.checked)}
          />
          {tr(" Passport ready only")}
        </label>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {tr(list.length)}
        {tr(
          " nurses · readiness is preparation progress, not license approval. Only Puerto Rico’s licensing authority authorizes practice.",
        )}
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.slice(0, limit).map((n) => {
          const m = matchScore(n, facilityLocation);
          const inPipe = state.candidates.some((c) => c.nurseId === n.id);
          return (
            <div key={n.id} className="flex flex-col border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-black">{tr(n.name)}</h3>
                  <p className="text-xs text-muted-foreground">
                    {tr(n.specialty)} · {tr(n.years)}
                    {tr(" yrs · ")}
                    {tr(n.home)}
                  </p>
                </div>
                <span className="bg-primary px-2 py-1 text-xs font-black text-primary-foreground">
                  {tr(m)}
                  {tr("% match")}
                </span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs">
                  <span>{tr(n.status)}</span>
                  <span>{tr(n.readiness)}%</span>
                </div>
                <Progress value={n.readiness} className="mt-1 h-1.5" />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-1 text-xs">
                <dt className="text-muted-foreground">{tr("Spanish")}</dt>
                <dd>{tr(n.spanish)}</dd>
                <dt className="text-muted-foreground">{tr("Length")}</dt>
                <dd>
                  {tr(n.length)}
                  {tr(" weeks")}
                </dd>
                <dt className="text-muted-foreground">{tr("Traveling")}</dt>
                <dd>{tr(n.family)}</dd>
              </dl>
              <div className="mt-3 flex flex-wrap gap-1">
                {n.regions.map((r) => (
                  <span
                    key={r}
                    className={cn(
                      "px-2 py-0.5 text-[11px] font-bold",
                      r === facilityLocation ? "bg-coral text-primary-foreground" : "bg-muted",
                    )}
                  >
                    {tr(locName(r))}
                  </span>
                ))}
                {n.experiences.map((x) => (
                  <span key={x} className="border border-border px-2 py-0.5 text-[11px]">
                    {tr(x)}
                  </span>
                ))}
              </div>
              <div className="mt-3">
                <PassportThumb nurse={n} onOpen={() => setPassport(n)} />
              </div>
              <Button
                className="mt-4"
                variant={inPipe ? "outline" : "default"}
                disabled={inPipe}
                onClick={() => shortlist(n)}
              >
                {tr(
                  inPipe ? (
                    <>
                      <Check />
                      {tr(" In pipeline")}
                    </>
                  ) : (
                    <>
                      <Plus />
                      {tr(" Shortlist & contact")}
                    </>
                  ),
                )}
              </Button>
            </div>
          );
        })}
      </div>
      {list.length > limit && (
        <Button variant="outline" className="mt-4 w-full" onClick={() => setLimit((l) => l + 24)}>
          {tr("Show more nurses (")}
          {list.length - limit}
          {tr(" left)")}
        </Button>
      )}
      <PassportViewer nurse={passport} onClose={() => setPassport(null)} />
    </div>
  );
}

/* ---------------- Gig builder ---------------- */

const CAT_IMG: Record<PerkCategory, string[]> = {
  Housing: [hiltonImg, villaImg, doradoImg, conqImg],
  Travel: [coastImg, conqImg],
  Mobility: [coastImg, villaImg],
  Adventure: [bioImg, toroImg, eastImg, conqImg],
  Wellness: [spaImg, doradoImg],
  "Food & Culture": [bacardiImg, coastImg],
  Family: [villaImg, coastImg],
  Professional: [heroImage],
};
function perkImage(p: Perk) {
  const l = CAT_IMG[p.category];
  let h = 0;
  for (const c of p.id) h = (h + c.charCodeAt(0)) % 997;
  return l[h % l.length]!;
}

const CATS: PerkCategory[] = [
  "Housing",
  "Travel",
  "Mobility",
  "Adventure",
  "Wellness",
  "Food & Culture",
  "Family",
  "Professional",
];

function GigBuilder({
  facilityName,
  facilityLocation,
  onDone,
}: {
  facilityName: string;
  facilityLocation: LocationId;
  onDone: () => void;
}) {
  const { t: tr } = useLanguage();
  const { update } = useHospital();
  const [title, setTitle] = useState("");
  const [specialty, setSpecialty] = useState("ICU / Critical Care");
  const [town, setTown] = useState<string>(locName(facilityLocation));
  const location: LocationId = hubFor(town);
  const [weeks, setWeeks] = useState(13);
  const [weeklyPay, setWeeklyPay] = useState(1750);
  const [service, setService] = useState(false);
  const [shift, setShift] = useState("3 × 12 nights");
  const [start, setStart] = useState("2027-01-11");
  const [perks, setPerks] = useState<string[]>(["flight", "pickup", "meal-card"]);
  const [cat, setCat] = useState<PerkCategory | "All">("All");
  const [freeOnly, setFreeOnly] = useState(false);

  const loc = LOCATIONS.find((l) => l.id === location)!;
  const available = perksFor(location).filter(
    (p) => (cat === "All" || p.category === cat) && (!freeOnly || p.cost === 0),
  );
  const totals = packageTotals(perks);
  const mine = weeklyValue(weeklyPay, totals.retail, weeks);
  const board = useMemo(
    () =>
      [
        ...COMPETITORS.map((c) => ({
          name: c.name,
          loc: c.location,
          pay: c.weeklyPay,
          value: weeklyValue(c.weeklyPay, c.perkValue, 13),
          me: false,
        })),
        {
          name: `${facilityName} (this gig)`,
          loc: location,
          pay: weeklyPay,
          value: mine,
          me: true,
        },
      ].sort((a, b) => b.value - a.value),
    [mine, weeklyPay, location, facilityName],
  );
  const rank = board.findIndex((b) => b.me) + 1;
  const maxV = board[0]?.value ?? 1;
  const interested = POOL.filter((n) => n.regions.includes(location)).length;

  function toggle(id: string) {
    setPerks((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }
  function save(status: HospitalGig["status"]) {
    const gig: HospitalGig = {
      id: `g${Date.now()}`,
      title: title.trim() || `${specialty} in ${town}`,
      specialty,
      location,
      town,
      weeks,
      weeklyPay: service ? 0 : weeklyPay,
      shift,
      start,
      perks,
      status,
      views: 0,
      service,
    };
    update((s) => ({ ...s, gigs: [gig, ...s.gigs] }));
    toast.success(tr(status === "Published" ? "Gig published to the nurse pool." : "Draft saved."));
    onDone();
  }

  const field = "h-10 w-full rounded-md border border-input bg-card px-3 text-sm";
  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-6">
        <Panel title={tr("1 · The gig")}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm sm:col-span-2">
              {tr("Title")}
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={tr(`${specialty} in ${town}`)}
              />
            </label>
            <label className="text-sm">
              {tr("Specialty")}
              <select
                className={field}
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              >
                {Array.from(new Set(POOL.map((n) => n.specialty))).map((s) => (
                  <option key={s} value={s}>
                    {tr(s)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              {tr("Shift")}
              <select className={field} value={shift} onChange={(e) => setShift(e.target.value)}>
                {["3 × 12 nights", "3 × 12 days", "3 × 12 rotating", "4 × 10 days"].map((s) => (
                  <option key={s} value={s}>
                    {tr(s)}
                  </option>
                ))}
              </select>
            </label>
            {tr(
              service ? (
                <div className="text-sm">
                  {tr("Weekly pay")}
                  <p className="mt-2 text-muted-foreground">{tr("Unpaid community service")}</p>
                </div>
              ) : (
                <label className="text-sm">
                  {tr("Weekly pay (local)")}
                  <Input
                    type="number"
                    value={weeklyPay}
                    onChange={(e) => setWeeklyPay(Number(e.target.value))}
                  />
                </label>
              ),
            )}
            <label className="flex items-start gap-2 text-xs text-muted-foreground sm:col-span-2">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={service}
                onChange={(e) => setService(e.target.checked)}
              />{" "}
              <span>
                {tr(
                  "Make this an unpaid community service gig (rural or underserved outreach, faith-based or secular). It's shown only to nurses who opt in, with lodging and meals covered by you or partners.",
                )}
              </span>
            </label>
            <label className="text-sm">
              {tr("Length")}
              <select
                className={field}
                value={weeks}
                onChange={(e) => setWeeks(Number(e.target.value))}
              >
                {[4, 8, 13, 26].map((w) => (
                  <option key={w} value={w}>
                    {tr(w)}
                    {tr(" weeks")}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              {tr("Start date")}
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </label>
          </div>
        </Panel>

        <Panel title={tr("2 · Location shapes the package")}>
          <label className="text-sm">
            {tr("Town or city (any of Puerto Rico’s 78 municipalities) ")}
            <Input
              list="pr-towns"
              value={town}
              onChange={(e) => setTown(e.target.value)}
              placeholder={tr("Start typing — Utuado, Rincón, Vieques…")}
            />
            <datalist id="pr-towns">
              {MUNICIPALITIES.map((m) => (
                <option key={m.name} value={m.name} />
              ))}
            </datalist>
          </label>
          <div className="mt-4 border-l-4 border-coral bg-coral/5 p-4 text-sm">
            <p className="font-black">
              {town || "—"} · {tr(loc.region)}{" "}
              <span className="font-normal text-muted-foreground">
                {tr("(perks from the ")}
                {tr(loc.name)}
                {tr(" area)")}
              </span>
            </p>
            <p className="mt-1 text-muted-foreground">{tr(loc.vibe)}</p>
            <p className="mt-2 text-xs">
              <strong>{tr("Housing:")}</strong> {tr(loc.housingNote)}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {loc.draws.map((d) => (
                <span key={d} className="bg-card px-2 py-0.5 text-[11px]">
                  {tr(d)}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs font-bold text-primary">
              {tr(interested)}
              {tr(" passported nurses want the ")}
              {tr(loc.region.toLowerCase())}
              {tr(" region")}
            </p>
          </div>
        </Panel>

        <Panel
          title={tr(`3 · Add perks (${perksFor(location).length} available here)`)}
          action={
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={freeOnly}
                onChange={(e) => setFreeOnly(e.target.checked)}
              />
              {tr(" Free only")}
            </label>
          }
        >
          <div className="mb-4 flex gap-1 overflow-x-auto">
            {(["All", ...CATS] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCat(c)}
                className={cn(
                  "shrink-0 px-3 py-1 text-xs font-bold",
                  cat === c ? "bg-foreground text-background" : "bg-muted",
                )}
              >
                {tr(c)}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {available.map((p) => {
              const on = perks.includes(p.id);
              const o = offerOf(p.id);
              const off = p.retail ? Math.round((1 - p.cost / p.retail) * 100) : 0;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggle(p.id)}
                  aria-pressed={on}
                  className={cn(
                    "group flex flex-col overflow-hidden border text-left transition-colors",
                    on
                      ? "border-primary ring-2 ring-primary"
                      : "border-border bg-card hover:border-primary/50",
                  )}
                >
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={perkImage(p)}
                      alt={tr("")}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-dark/90 via-surface-dark/20 to-transparent" />
                    <span
                      className={cn(
                        "absolute left-2 top-2 px-2 py-0.5 text-[10px] font-black uppercase",
                        o.offerType === "Limited time"
                          ? "bg-coral text-primary-foreground"
                          : o.offerType === "Special"
                            ? "bg-primary text-primary-foreground"
                            : "bg-card text-foreground",
                      )}
                    >
                      {tr(o.offerType)}
                    </span>
                    <span
                      className={cn(
                        "absolute right-2 top-2 flex size-6 items-center justify-center rounded-full border-2",
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-surface-dark-foreground/80 bg-surface-dark/40 text-transparent",
                      )}
                    >
                      <Check className="size-3.5" />
                    </span>
                    <div className="absolute inset-x-3 bottom-2 text-surface-dark-foreground">
                      <p className="text-[10px] font-bold uppercase opacity-80">
                        {tr(p.partner)} · {tr(p.category)}
                      </p>
                      <strong className="block leading-tight">{tr(p.title)}</strong>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    {o.headline && (
                      <p className="text-sm font-black text-coral">{tr(o.headline)}</p>
                    )}
                    {o.endsAt && (
                      <p className="text-[11px] text-muted-foreground">
                        {tr("Ends ")}
                        {tr(
                          new Date(o.endsAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }),
                        )}
                      </p>
                    )}
                    {o.requirement && (
                      <p className="mt-1 border-l-2 border-primary bg-primary/5 px-2 py-1 text-[11px]">
                        <strong>{tr("Requires:")}</strong> {tr(o.requirement)}
                      </p>
                    )}
                    {p.note && (
                      <p className="mt-1 text-[11px] text-muted-foreground">{tr(p.note)}</p>
                    )}
                    <div className="mt-auto flex items-end justify-between pt-2">
                      <span>
                        {tr(
                          p.cost === 0 ? (
                            <strong className="text-lg text-primary">{tr("FREE")}</strong>
                          ) : (
                            <strong className="text-lg">{tr(money(p.cost))}</strong>
                          ),
                        )}{" "}
                        <span className="text-[11px] text-muted-foreground line-through">
                          {tr(money(p.retail))}
                        </span>
                      </span>
                      {off > 0 && (
                        <span className="text-xs font-black text-primary">
                          {tr(off)}
                          {tr("% off")}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
            {available.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {tr("No perks match these filters here.")}
              </p>
            )}
          </div>
        </Panel>
      </div>

      <aside className="h-fit space-y-4 lg:sticky lg:top-24">
        <div className="border-2 border-primary bg-primary/5">
          <div className="bg-primary px-5 py-4 text-primary-foreground">
            <h3 className="text-lg font-black">{tr("Your gig package")}</h3>
            <p className="text-xs opacity-80">
              {tr(specialty)} · {tr(weeks)}
              {tr(" wks · ")}
              {tr(town)}
            </p>
          </div>
          <ul className="max-h-56 space-y-1.5 overflow-y-auto p-5 text-sm">
            {totals.list.map((p) => (
              <li key={p.id} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /> {tr(p.title)}
              </li>
            ))}
            {totals.list.length === 0 && (
              <li className="text-muted-foreground">{tr("Add perks to build the package.")}</li>
            )}
          </ul>
          <div className="grid grid-cols-2 border-t border-primary/20 text-center">
            <div className="border-r border-primary/20 p-3">
              <strong className="block text-xl">{tr(money(totals.cost))}</strong>
              <span className="text-[11px] uppercase text-muted-foreground">{tr("your cost")}</span>
            </div>
            <div className="p-3">
              <strong className="block text-xl text-primary">{tr(money(totals.retail))}</strong>
              <span className="text-[11px] uppercase text-muted-foreground">
                {tr("nurse value")}
              </span>
            </div>
          </div>
          <div className="border-t border-primary/20 p-3 text-center">
            <strong className="text-2xl">{tr(money(mine))}</strong>
            <span className="ml-1 text-xs text-muted-foreground">
              {tr("/wk total value (pay + perks)")}
            </span>
          </div>
        </div>

        <div className="border border-border bg-card p-5">
          <h3 className="flex items-center gap-2 text-lg font-black">
            <Trophy className="size-5 text-coral" />
            {tr(" Competitive rating: #")}
            {tr(rank)}
            {tr(" of ")}
            {tr(board.length)}
          </h3>
          <p className="text-xs text-muted-foreground">
            {tr("Weekly pay + perk value per week vs other PR facilities (demo benchmarks).")}
          </p>
          <div className="mt-3 space-y-1.5">
            {board.map((b) => (
              <div key={b.name} className="text-xs">
                <div className="flex justify-between">
                  <span className={cn(b.me && "font-black text-primary")}>
                    {tr(b.name)}{" "}
                    <span className="text-muted-foreground">· {tr(locName(b.loc))}</span>
                  </span>
                  <span className="font-bold">{tr(money(b.value))}</span>
                </div>
                <div className="mt-0.5 flex h-2 bg-muted">
                  <div
                    className={b.me ? "bg-coral" : "bg-primary/50"}
                    style={{ width: `${(b.pay / maxV) * 100}%` }}
                  />
                  <div
                    className={b.me ? "bg-coral/50" : "bg-primary/25"}
                    style={{ width: `${((b.value - b.pay) / maxV) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            {tr("Solid = pay · light = perks")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => save("Draft")}>
            {tr("Save draft")}
          </Button>
          <Button onClick={() => save("Published")}>
            {tr("Publish ")}
            <ArrowRight />
          </Button>
        </div>
      </aside>
    </div>
  );
}
