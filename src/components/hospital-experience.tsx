import { useMemo, useState } from "react";
import {
  ArrowRight, BarChart3, Check, CheckCircle2, Handshake, LogIn, LogOut, MapPin, MessageSquare, Plus, RotateCcw, Search, Send, Trophy, Users,
} from "lucide-react";
import { toast } from "sonner";

import heroImage from "@/assets/hospital-hero.jpg";
import hospitalIconAsset from "@/assets/wepa-hospital.png.asset.json";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  ATS_STAGES, COMPETITORS, FACILITIES, LOCATIONS, POOL, matchScore, packageTotals, perksFor, useHospital, weeklyValue,
  type AtsStage, type HospitalGig, type LocationId, type PerkCategory, type PoolNurse,
} from "@/lib/hospital-data";

type Tab = "dashboard" | "pool" | "pipeline" | "build";
const money = (n: number) => `$${n.toLocaleString()}`;
const locName = (id: LocationId) => LOCATIONS.find((l) => l.id === id)?.name ?? id;

export function HospitalExperience() {
  const { state, update, reset } = useHospital();
  const [tab, setTab] = useState<Tab>("dashboard");
  const facility = FACILITIES.find((f) => f.id === state.facilityId) ?? FACILITIES[0];

  if (!state.loggedIn) return <HospitalLanding onLogin={(id) => update((s) => ({ ...s, loggedIn: true, facilityId: id }))} />;

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
          <img src={hospitalIconAsset.url} alt="" aria-hidden className="size-12 object-contain" />
          <div>
            <h2 className="text-2xl font-black sm:text-3xl">{facility.name}</h2>
            <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-3.5" /> {locName(facility.location)} · {facility.beds} beds</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { reset(); toast.success("Demo data restored."); }}><RotateCcw /> Reset demo</Button>
          <Button variant="ghost" size="sm" onClick={() => update((s) => ({ ...s, loggedIn: false }))}><LogOut /> Log out</Button>
        </div>
      </div>

      <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} className={cn("flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors", tab === t.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
            <t.icon className="size-4" /> {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {tab === "dashboard" && <Dashboard facilityLocation={facility.location} onGo={setTab} />}
        {tab === "pool" && <NursePool facilityLocation={facility.location} />}
        {tab === "pipeline" && <Pipeline />}
        {tab === "build" && <GigBuilder facilityName={facility.name} facilityLocation={facility.location} onDone={() => setTab("dashboard")} />}
      </div>
    </section>
  );
}

/* ---------------- Landing ---------------- */

function HospitalLanding({ onLogin }: { onLogin: (facilityId: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <section className="relative isolate overflow-hidden bg-surface-dark text-surface-dark-foreground">
        <img src={heroImage} alt="Puerto Rico hospital at golden hour with mountains behind" width={1600} height={912} className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-hero-wash" />
        <div className="mx-auto max-w-[1440px] px-4 pb-14 pt-20 sm:px-6 lg:px-8 lg:pb-20">
          <h1 className="max-w-2xl text-4xl font-black leading-[1.02] sm:text-6xl lg:text-7xl">Pay local.<br /><span className="text-primary">Let the island recruit.</span></h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-surface-dark-foreground/85 sm:text-lg">You can’t outbid mainland travel contracts — and you don’t have to. Pair honest local pay with travel, lodging and adventures from partners near you, and <strong className="text-surface-dark-foreground">reach nurses who are already Puerto Rico ready.</strong></p>
          <div className="mt-6 grid max-w-lg grid-cols-3 gap-3">
            <Stat value={String(POOL.filter((n) => n.status === "Passport ready").length)} label="passported nurses in pool" />
            <Stat value={String(new Set(POOL.flatMap((n) => n.regions)).size)} label="regions nurses want" />
            <Stat value="~60%" label="perk value at partner cost" />
          </div>
          <Button size="lg" className="mt-7" onClick={() => setOpen(true)}><LogIn /> Log in</Button>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black sm:text-4xl">Your location is your offer.</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">Utuado sells mountains, coffee and rivers. Dorado sells resort beaches. Ponce sells culture and sun. WEPA shows you the partners and perks that make sense where you are.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LOCATIONS.slice(0, 4).map((l) => (
            <div key={l.id} className="border border-border bg-card p-5">
              <p className="text-[10px] font-black uppercase text-muted-foreground">{l.region}</p>
              <h3 className="mt-1 text-xl font-black">{l.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{l.vibe}</p>
              <p className="mt-3 text-xs font-bold text-primary">{perksFor(l.id).length} perks available</p>
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[["Explore", "Browse nurses who finished their Puerto Rico Readiness Passport, filtered by the island regions they want."], ["Build", "Assemble a gig package from dozens of partner perks — at partner cost, or free from your own facility."], ["Compete & hire", "See how your pay + perks rank against other facilities, then message, negotiate and send offers."]].map(([t, d], i) => (
            <div key={t} className="border-l-4 border-primary bg-primary/5 p-5"><p className="text-xs font-black text-primary">0{i + 1}</p><h3 className="text-lg font-black">{t}</h3><p className="mt-1 text-sm text-muted-foreground">{d}</p></div>
          ))}
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log in to your facility</DialogTitle><DialogDescription>Demo access — no password needed. Pick a facility to see how location changes everything.</DialogDescription></DialogHeader>
          <div className="grid gap-2">
            {FACILITIES.map((f) => (
              <button key={f.id} type="button" onClick={() => onLogin(f.id)} className="flex items-center justify-between border border-border bg-card p-4 text-left hover:border-primary">
                <span><strong className="block">{f.name}</strong><span className="text-xs text-muted-foreground">{locName(f.location)} · {f.beds} beds</span></span>
                <ArrowRight className="size-4 text-primary" />
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">All facilities are fictional demo accounts.</p>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return <div className="border-l-2 border-primary pl-3"><strong className="block text-2xl font-black">{value}</strong><span className="text-[11px] leading-tight text-surface-dark-foreground/75">{label}</span></div>;
}

/* ---------------- Dashboard ---------------- */

function Dashboard({ facilityLocation, onGo }: { facilityLocation: LocationId; onGo: (t: Tab) => void }) {
  const { state } = useHospital();
  const c = state.candidates;
  const accepted = c.filter((x) => x.stage === "Accepted").length;
  const offers = c.filter((x) => x.stage === "Offer sent" || x.stage === "Accepted" || x.stage === "Declined").length;
  const matches = POOL.filter((n) => matchScore(n, facilityLocation) >= 80).length;
  const avgCost = state.gigs.length ? Math.round(state.gigs.reduce((a, g) => a + packageTotals(g.perks).cost, 0) / state.gigs.length) : 0;
  const funnel = ATS_STAGES.map((s) => ({ s, n: c.filter((x) => ATS_STAGES.indexOf(x.stage as AtsStage) >= ATS_STAGES.indexOf(s)).length }));
  const maxF = Math.max(1, ...funnel.map((f) => f.n));
  const regionDemand = LOCATIONS.map((l) => ({ l, n: POOL.filter((p) => p.regions.includes(l.id)).length })).sort((a, b) => b.n - a.n);
  const maxR = Math.max(1, ...regionDemand.map((r) => r.n));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Kpi label="Live gigs" value={String(state.gigs.filter((g) => g.status === "Published").length)} />
        <Kpi label="Strong pool matches" value={String(matches)} />
        <Kpi label="In pipeline" value={String(c.length)} />
        <Kpi label="Offers out" value={String(offers)} />
        <Kpi label="Acceptance rate" value={offers ? `${Math.round((accepted / offers) * 100)}%` : "—"} />
        <Kpi label="Avg package cost" value={money(avgCost)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Hiring funnel">
          <div className="space-y-2">
            {funnel.map((f) => (
              <div key={f.s} className="flex items-center gap-3 text-sm"><span className="w-24 shrink-0 text-muted-foreground">{f.s}</span><div className="h-6 flex-1 bg-muted"><div className="flex h-full items-center bg-primary px-2 text-xs font-bold text-primary-foreground" style={{ width: `${(f.n / maxF) * 100}%` }}>{f.n}</div></div></div>
            ))}
          </div>
        </Panel>
        <Panel title="Where passported nurses want to go">
          <div className="space-y-2">
            {regionDemand.map(({ l, n }) => (
              <div key={l.id} className="flex items-center gap-3 text-sm"><span className={cn("w-24 shrink-0", l.id === facilityLocation ? "font-black text-primary" : "text-muted-foreground")}>{l.name}</span><div className="h-6 flex-1 bg-muted"><div className={cn("flex h-full items-center px-2 text-xs font-bold", l.id === facilityLocation ? "bg-coral text-primary-foreground" : "bg-primary/60 text-primary-foreground")} style={{ width: `${(n / maxR) * 100}%` }}>{n}</div></div></div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Your gigs" action={<Button size="sm" onClick={() => onGo("build")}><Plus /> Build a gig</Button>}>
        <div className="divide-y divide-border">
          {state.gigs.map((g) => {
            const t = packageTotals(g.perks);
            const wv = weeklyValue(g.weeklyPay, t.retail, g.weeks);
            const rank = competitiveRank(g.location, wv);
            const applicants = c.filter((x) => x.gigId === g.id).length;
            return (
              <div key={g.id} className="grid gap-2 py-3 text-sm sm:grid-cols-[2fr_repeat(4,1fr)] sm:items-center">
                <div><strong>{g.title}</strong><p className="text-xs text-muted-foreground">{g.specialty} · {locName(g.location)} · {g.weeks} wks · <span className={g.status === "Published" ? "text-primary" : ""}>{g.status}</span></p></div>
                <span>{money(g.weeklyPay)}/wk</span>
                <span className="text-primary">{money(wv)}/wk value</span>
                <span>{g.views} views · {applicants} in pipeline</span>
                <span className="flex items-center gap-1 font-bold"><Trophy className="size-4 text-coral" /> #{rank.rank} of {rank.total}</span>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return <div className="border border-border bg-card p-4"><strong className="block text-2xl font-black">{value}</strong><span className="text-[11px] uppercase text-muted-foreground">{label}</span></div>;
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <div className="border border-border bg-card p-5"><div className="mb-4 flex items-center justify-between gap-2"><h3 className="text-lg font-black">{title}</h3>{action}</div>{children}</div>;
}

function competitiveRank(loc: LocationId, mine: number) {
  const values = COMPETITORS.map((c) => weeklyValue(c.weeklyPay, c.perkValue, 13));
  const rank = values.filter((v) => v > mine).length + 1;
  return { rank, total: values.length + 1, local: COMPETITORS.filter((c) => c.location === loc) };
}

/* ---------------- Nurse pool ---------------- */

function NursePool({ facilityLocation }: { facilityLocation: LocationId }) {
  const { state, update } = useHospital();
  const [q, setQ] = useState("");
  const [region, setRegion] = useState<LocationId | "any">(facilityLocation);
  const [specialty, setSpecialty] = useState("Any");
  const [readyOnly, setReadyOnly] = useState(true);
  const specialties = ["Any", ...Array.from(new Set(POOL.map((n) => n.specialty)))];
  const list = POOL
    .filter((n) => (region === "any" || n.regions.includes(region)) && (specialty === "Any" || n.specialty === specialty) && (!readyOnly || n.status === "Passport ready") && `${n.name} ${n.home}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => matchScore(b, facilityLocation) - matchScore(a, facilityLocation));
  const gig = state.gigs[0];

  function shortlist(n: PoolNurse) {
    if (!gig) { toast.error("Build a gig first."); return; }
    if (state.candidates.some((c) => c.nurseId === n.id)) { toast(`${n.name} is already in your pipeline.`); return; }
    update((s) => ({ ...s, candidates: [...s.candidates, { nurseId: n.id, gigId: gig.id, stage: "Shortlisted", weeklyPay: gig.weeklyPay, messages: [] }] }));
    toast.success(`${n.name} added to your pipeline.`);
  }

  const sel = "h-10 rounded-md border border-input bg-card px-3 text-sm";
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-48 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search nurses" className="pl-9" /></div>
        <select className={sel} value={region} onChange={(e) => setRegion(e.target.value as LocationId | "any")}><option value="any">Any region</option>{LOCATIONS.map((l) => <option key={l.id} value={l.id}>Wants {l.name}</option>)}</select>
        <select className={sel} value={specialty} onChange={(e) => setSpecialty(e.target.value)}>{specialties.map((s) => <option key={s}>{s}</option>)}</select>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={readyOnly} onChange={(e) => setReadyOnly(e.target.checked)} /> Passport ready only</label>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{list.length} nurses · readiness is preparation progress, not license approval. Only Puerto Rico’s licensing authority authorizes practice.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((n) => {
          const m = matchScore(n, facilityLocation);
          const inPipe = state.candidates.some((c) => c.nurseId === n.id);
          return (
            <div key={n.id} className="flex flex-col border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <div><h3 className="text-lg font-black">{n.name}</h3><p className="text-xs text-muted-foreground">{n.specialty} · {n.years} yrs · {n.home}</p></div>
                <span className="bg-primary px-2 py-1 text-xs font-black text-primary-foreground">{m}% match</span>
              </div>
              <div className="mt-3"><div className="flex justify-between text-xs"><span>{n.status}</span><span>{n.readiness}%</span></div><Progress value={n.readiness} className="mt-1 h-1.5" /></div>
              <dl className="mt-3 grid grid-cols-2 gap-1 text-xs">
                <dt className="text-muted-foreground">Spanish</dt><dd>{n.spanish}</dd>
                <dt className="text-muted-foreground">Length</dt><dd>{n.length} weeks</dd>
                <dt className="text-muted-foreground">Traveling</dt><dd>{n.family}</dd>
              </dl>
              <div className="mt-3 flex flex-wrap gap-1">
                {n.regions.map((r) => <span key={r} className={cn("px-2 py-0.5 text-[11px] font-bold", r === facilityLocation ? "bg-coral text-primary-foreground" : "bg-muted")}>{locName(r)}</span>)}
                {n.experiences.map((x) => <span key={x} className="border border-border px-2 py-0.5 text-[11px]">{x}</span>)}
              </div>
              <Button className="mt-4" variant={inPipe ? "outline" : "default"} disabled={inPipe} onClick={() => shortlist(n)}>{inPipe ? <><Check /> In pipeline</> : <><Plus /> Shortlist & contact</>}</Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Pipeline (ATS) ---------------- */

function Pipeline() {
  const { state, update } = useHospital();
  const [openId, setOpenId] = useState<string | null>(null);
  const open = state.candidates.find((c) => c.nurseId === openId) ?? null;
  const nurse = open ? POOL.find((n) => n.id === open.nurseId) : null;
  const gig = open ? state.gigs.find((g) => g.id === open.gigId) : null;
  const [msg, setMsg] = useState("");
  const [pay, setPay] = useState(0);

  function patch(stage?: AtsStage, text?: string, from: "hospital" | "nurse" = "hospital", weeklyPay?: number) {
    if (!open) return;
    update((s) => ({ ...s, candidates: s.candidates.map((c) => c.nurseId === open.nurseId ? { ...c, stage: stage ?? c.stage, weeklyPay: weeklyPay ?? c.weeklyPay, messages: text ? [...c.messages, { from, text, at: new Date().toISOString() }] : c.messages } : c) }));
  }

  function send() {
    if (!msg.trim() || !open) return;
    patch(open.stage === "Shortlisted" ? "Contacted" : undefined, msg.trim());
    setMsg("");
    // Simulated nurse reply for the demo
    setTimeout(() => update((s) => ({ ...s, candidates: s.candidates.map((c) => c.nurseId === open.nurseId ? { ...c, messages: [...c.messages, { from: "nurse", text: "Thanks! That sounds great — can you tell me more about the housing?", at: new Date().toISOString() }] } : c) })), 1200);
  }

  return (
    <div>
      <div className="grid gap-3 overflow-x-auto md:grid-cols-5">
        {ATS_STAGES.map((stage) => (
          <div key={stage} className="min-w-56 bg-muted/60 p-3">
            <p className="mb-2 flex justify-between text-xs font-black uppercase">{stage}<span>{state.candidates.filter((c) => c.stage === stage).length}</span></p>
            <div className="space-y-2">
              {state.candidates.filter((c) => c.stage === stage).map((c) => {
                const n = POOL.find((x) => x.id === c.nurseId);
                const g = state.gigs.find((x) => x.id === c.gigId);
                if (!n) return null;
                return (
                  <button key={c.nurseId} type="button" onClick={() => { setOpenId(c.nurseId); setPay(c.weeklyPay); }} className="w-full border border-border bg-card p-3 text-left hover:border-primary">
                    <strong className="block text-sm">{n.name}</strong>
                    <span className="block text-xs text-muted-foreground">{n.specialty}</span>
                    <span className="mt-1 block text-xs">{g?.title ?? "—"} · {money(c.weeklyPay)}/wk</span>
                    {c.messages.length > 0 && <span className="mt-1 flex items-center gap-1 text-[11px] text-primary"><MessageSquare className="size-3" /> {c.messages.length}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {open && nurse && (
            <>
              <DialogHeader><DialogTitle>{nurse.name}</DialogTitle><DialogDescription>{nurse.specialty} · {nurse.years} yrs · {nurse.home} · {gig?.title}</DialogDescription></DialogHeader>
              <div className="flex flex-wrap gap-1">{ATS_STAGES.map((s) => <button key={s} type="button" onClick={() => patch(s)} className={cn("px-2 py-1 text-xs font-bold", open.stage === s ? "bg-primary text-primary-foreground" : "bg-muted")}>{s}</button>)}<button type="button" onClick={() => patch("Declined")} className={cn("px-2 py-1 text-xs font-bold", open.stage === "Declined" ? "bg-coral text-primary-foreground" : "bg-muted")}>Declined</button></div>

              <div className="max-h-64 space-y-2 overflow-y-auto bg-muted/50 p-3">
                {open.messages.length === 0 && <p className="text-sm text-muted-foreground">No messages yet — say hello.</p>}
                {open.messages.map((m, i) => <div key={i} className={cn("max-w-[80%] p-2 text-sm", m.from === "hospital" ? "ml-auto bg-primary text-primary-foreground" : "bg-card")}>{m.text}</div>)}
              </div>
              <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}><Input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={`Message ${nurse.name.split(" ")[0]}`} /><Button type="submit"><Send /></Button></form>

              <div className="border border-border p-4">
                <p className="text-sm font-black">Negotiate & offer</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-sm">Weekly pay</span>
                  <Input type="number" value={pay} onChange={(e) => setPay(Number(e.target.value))} className="w-28" />
                  {gig && <span className="text-xs text-muted-foreground">+ {money(packageTotals(gig.perks).retail)} island package</span>}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => { patch("Negotiating", `Counter proposal: ${money(pay)}/wk + full island package.`, "hospital", pay); toast.success("Counter sent."); }}>Send counter</Button>
                  <Button size="sm" onClick={() => { patch("Offer sent", `Formal offer: ${money(pay)}/wk, ${gig?.weeks} weeks, starting ${gig?.start}, with the full island package.`, "hospital", pay); toast.success("Offer sent."); }}>Send formal offer</Button>
                  {open.stage === "Offer sent" && <Button size="sm" variant="secondary" onClick={() => { patch("Accepted", "Offer accepted! 🎉", "nurse"); toast.success(`${nurse.name} accepted.`); }}>Simulate acceptance</Button>}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Start remains conditional on official Puerto Rico authorization and your credentialing.</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- Gig builder ---------------- */

const CATS: PerkCategory[] = ["Housing", "Travel", "Mobility", "Adventure", "Wellness", "Food & Culture", "Family", "Professional"];

function GigBuilder({ facilityName, facilityLocation, onDone }: { facilityName: string; facilityLocation: LocationId; onDone: () => void }) {
  const { update } = useHospital();
  const [title, setTitle] = useState("");
  const [specialty, setSpecialty] = useState("ICU / Critical Care");
  const [location, setLocation] = useState<LocationId>(facilityLocation);
  const [weeks, setWeeks] = useState(13);
  const [weeklyPay, setWeeklyPay] = useState(1750);
  const [shift, setShift] = useState("3 × 12 nights");
  const [start, setStart] = useState("2027-01-11");
  const [perks, setPerks] = useState<string[]>(["flight", "pickup", "meal-card"]);
  const [cat, setCat] = useState<PerkCategory | "All">("All");
  const [freeOnly, setFreeOnly] = useState(false);

  const loc = LOCATIONS.find((l) => l.id === location)!;
  const available = perksFor(location).filter((p) => (cat === "All" || p.category === cat) && (!freeOnly || p.cost === 0));
  const totals = packageTotals(perks);
  const mine = weeklyValue(weeklyPay, totals.retail, weeks);
  const board = useMemo(() => [...COMPETITORS.map((c) => ({ name: c.name, loc: c.location, pay: c.weeklyPay, value: weeklyValue(c.weeklyPay, c.perkValue, 13), me: false })), { name: `${facilityName} (this gig)`, loc: location, pay: weeklyPay, value: mine, me: true }].sort((a, b) => b.value - a.value), [mine, weeklyPay, location, facilityName]);
  const rank = board.findIndex((b) => b.me) + 1;
  const maxV = board[0].value;
  const interested = POOL.filter((n) => n.regions.includes(location)).length;

  function toggle(id: string) { setPerks((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]); }
  function save(status: HospitalGig["status"]) {
    const gig: HospitalGig = { id: `g${Date.now()}`, title: title.trim() || `${specialty} in ${loc.name}`, specialty, location, weeks, weeklyPay, shift, start, perks, status, views: 0 };
    update((s) => ({ ...s, gigs: [gig, ...s.gigs] }));
    toast.success(status === "Published" ? "Gig published to the nurse pool." : "Draft saved.");
    onDone();
  }

  const field = "h-10 w-full rounded-md border border-input bg-card px-3 text-sm";
  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-6">
        <Panel title="1 · The gig">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm sm:col-span-2">Title<Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`${specialty} in ${loc.name}`} /></label>
            <label className="text-sm">Specialty<select className={field} value={specialty} onChange={(e) => setSpecialty(e.target.value)}>{Array.from(new Set(POOL.map((n) => n.specialty))).map((s) => <option key={s}>{s}</option>)}</select></label>
            <label className="text-sm">Shift<select className={field} value={shift} onChange={(e) => setShift(e.target.value)}>{["3 × 12 nights", "3 × 12 days", "3 × 12 rotating", "4 × 10 days"].map((s) => <option key={s}>{s}</option>)}</select></label>
            <label className="text-sm">Weekly pay (local)<Input type="number" value={weeklyPay} onChange={(e) => setWeeklyPay(Number(e.target.value))} /></label>
            <label className="text-sm">Length<select className={field} value={weeks} onChange={(e) => setWeeks(Number(e.target.value))}>{[4, 8, 13, 26].map((w) => <option key={w} value={w}>{w} weeks</option>)}</select></label>
            <label className="text-sm">Start date<Input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></label>
          </div>
        </Panel>

        <Panel title="2 · Location shapes the package">
          <div className="flex flex-wrap gap-2">{LOCATIONS.map((l) => <button key={l.id} type="button" onClick={() => setLocation(l.id)} className={cn("px-3 py-1.5 text-sm font-bold", location === l.id ? "bg-primary text-primary-foreground" : "bg-muted")}>{l.name}</button>)}</div>
          <div className="mt-4 border-l-4 border-coral bg-coral/5 p-4 text-sm">
            <p className="font-black">{loc.name} · {loc.region}</p>
            <p className="mt-1 text-muted-foreground">{loc.vibe}</p>
            <p className="mt-2 text-xs"><strong>Housing:</strong> {loc.housingNote}</p>
            <div className="mt-2 flex flex-wrap gap-1">{loc.draws.map((d) => <span key={d} className="bg-card px-2 py-0.5 text-[11px]">{d}</span>)}</div>
            <p className="mt-2 text-xs font-bold text-primary">{interested} passported nurses want {loc.name}</p>
          </div>
        </Panel>

        <Panel title={`3 · Add perks (${perksFor(location).length} available here)`} action={<label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={freeOnly} onChange={(e) => setFreeOnly(e.target.checked)} /> Free only</label>}>
          <div className="mb-4 flex gap-1 overflow-x-auto">{(["All", ...CATS] as const).map((c) => <button key={c} type="button" onClick={() => setCat(c)} className={cn("shrink-0 px-3 py-1 text-xs font-bold", cat === c ? "bg-foreground text-background" : "bg-muted")}>{c}</button>)}</div>
          <div className="grid gap-3 sm:grid-cols-2">
            {available.map((p) => {
              const on = perks.includes(p.id);
              return (
                <button key={p.id} type="button" onClick={() => toggle(p.id)} aria-pressed={on} className={cn("flex flex-col border p-4 text-left transition-colors", on ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50")}>
                  <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase text-muted-foreground">{p.category}</span><span className={cn("flex size-5 items-center justify-center rounded-full border", on ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent")}><Check className="size-3" /></span></div>
                  <strong className="mt-2 leading-tight">{p.title}</strong>
                  <span className="text-xs text-primary">{p.partner}</span>
                  {p.note && <span className="mt-1 text-[11px] text-coral">{p.note}</span>}
                  <span className="mt-2 text-sm">{p.cost === 0 ? <strong className="text-primary">FREE</strong> : <strong>{money(p.cost)}</strong>} <span className="text-xs text-muted-foreground">your cost · nurse value {money(p.retail)}</span></span>
                </button>
              );
            })}
            {available.length === 0 && <p className="text-sm text-muted-foreground">No perks match these filters here.</p>}
          </div>
        </Panel>
      </div>

      <aside className="h-fit space-y-4 lg:sticky lg:top-24">
        <div className="border-2 border-primary bg-primary/5">
          <div className="bg-primary px-5 py-4 text-primary-foreground"><h3 className="text-lg font-black">Your gig package</h3><p className="text-xs opacity-80">{specialty} · {weeks} wks · {loc.name}</p></div>
          <ul className="max-h-56 space-y-1.5 overflow-y-auto p-5 text-sm">{totals.list.map((p) => <li key={p.id} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /> {p.title}</li>)}{totals.list.length === 0 && <li className="text-muted-foreground">Add perks to build the package.</li>}</ul>
          <div className="grid grid-cols-2 border-t border-primary/20 text-center">
            <div className="border-r border-primary/20 p-3"><strong className="block text-xl">{money(totals.cost)}</strong><span className="text-[11px] uppercase text-muted-foreground">your cost</span></div>
            <div className="p-3"><strong className="block text-xl text-primary">{money(totals.retail)}</strong><span className="text-[11px] uppercase text-muted-foreground">nurse value</span></div>
          </div>
          <div className="border-t border-primary/20 p-3 text-center"><strong className="text-2xl">{money(mine)}</strong><span className="ml-1 text-xs text-muted-foreground">/wk total value (pay + perks)</span></div>
        </div>

        <div className="border border-border bg-card p-5">
          <h3 className="flex items-center gap-2 text-lg font-black"><Trophy className="size-5 text-coral" /> Competitive rating: #{rank} of {board.length}</h3>
          <p className="text-xs text-muted-foreground">Weekly pay + perk value per week vs other PR facilities (demo benchmarks).</p>
          <div className="mt-3 space-y-1.5">
            {board.map((b) => (
              <div key={b.name} className="text-xs">
                <div className="flex justify-between"><span className={cn(b.me && "font-black text-primary")}>{b.name} <span className="text-muted-foreground">· {locName(b.loc)}</span></span><span className="font-bold">{money(b.value)}</span></div>
                <div className="mt-0.5 flex h-2 bg-muted"><div className={b.me ? "bg-coral" : "bg-primary/50"} style={{ width: `${(b.pay / maxV) * 100}%` }} /><div className={b.me ? "bg-coral/50" : "bg-primary/25"} style={{ width: `${((b.value - b.pay) / maxV) * 100}%` }} /></div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">Solid = pay · light = perks</p>
        </div>

        <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => save("Draft")}>Save draft</Button><Button onClick={() => save("Published")}>Publish <ArrowRight /></Button></div>
      </aside>
    </div>
  );
}
