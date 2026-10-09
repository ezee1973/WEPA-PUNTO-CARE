import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowRight,
  Bell,
  BriefcaseMedical,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  FileCheck2,
  HeartPulse,
  MapPin,
  Menu,
  Music2,
  Palmtree,
  Play,
  Plane,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import coastImage from "@/assets/puerto-rico-coast.jpg";
import jingleAsset from "@/assets/wepa-jingle.asset.json";
import logoAsset from "@/assets/wepa-care-logo.asset.json";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { demoGigs, demoOffers, qualificationSteps, type DemoGig, type DemoOffer, type DemoRole } from "@/lib/wepa-data";
import { cn } from "@/lib/utils";

const logoUrl = logoAsset.url;
const jingleUrl = jingleAsset.url;

const roleMeta: Record<DemoRole, { label: string; short: string; icon: typeof HeartPulse }> = {
  nurse: { label: "Nurse", short: "Find my gig", icon: HeartPulse },
  hospital: { label: "Hospital", short: "Build a package", icon: Building2 },
  tourism: { label: "Tourism partner", short: "Make an offer", icon: Palmtree },
};

export function WepaMarketplace() {
  const [role, setRole] = useState<DemoRole>("nurse");
  const [selectedGig, setSelectedGig] = useState<DemoGig | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const mediaRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setSignedInEmail(data.user?.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setSignedInEmail(session?.user.email ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  async function toggleSound() {
    const media = mediaRef.current;
    if (!media) return;
    if (soundOn) {
      media.pause();
      media.currentTime = 0;
      setSoundOn(false);
      return;
    }
    try {
      media.currentTime = 0;
      await media.play();
      setSoundOn(true);
    } catch {
      toast.error("Sound is waiting for browser permission. Tap again to play.");
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("You’re signed out.");
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {role !== "nurse" && <video ref={mediaRef} src={jingleUrl} className="hidden" onEnded={() => setSoundOn(false)} playsInline />}
      <Header
        role={role}
        setRole={setRole}
        soundOn={soundOn}
        onSound={() => void toggleSound()}
        signedInEmail={signedInEmail}
        onAuth={() => setAuthOpen(true)}
        onSignOut={() => void signOut()}
      />
      <RoleRail role={role} setRole={setRole} />
      {role === "nurse" && (
        <NurseExperience
          onSelectGig={setSelectedGig}
          soundOn={soundOn}
          onSound={() => void toggleSound()}
          jingleMedia={<video ref={mediaRef} src={jingleUrl} onEnded={() => setSoundOn(false)} playsInline className="aspect-video w-full object-cover" />}
        />
      )}
      {role === "hospital" && <HospitalExperience />}
      {role === "tourism" && <TourismExperience />}
      <GigDialog gig={selectedGig} onClose={() => setSelectedGig(null)} signedIn={Boolean(signedInEmail)} onAuth={() => setAuthOpen(true)} />
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </main>
  );
}

function Header({
  role,
  setRole,
  soundOn,
  onSound,
  signedInEmail,
  onAuth,
  onSignOut,
}: {
  role: DemoRole;
  setRole: (role: DemoRole) => void;
  soundOn: boolean;
  onSound: () => void;
  signedInEmail: string | null;
  onAuth: () => void;
  onSignOut: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <img src={logoUrl} alt="WEPA.care" className="h-11 w-auto object-contain" />
        <div className="hidden h-7 w-px bg-border sm:block" />
        <p className="hidden text-xs font-semibold uppercase text-muted-foreground sm:block">Come for the Island.<br />Care for its People.</p>
        <div className="ml-auto hidden rounded-md bg-muted p-1 md:flex" aria-label="Demo role switcher">
          {(Object.keys(roleMeta) as DemoRole[]).map((key) => {
            const Icon = roleMeta[key].icon;
            return (
              <Button key={key} variant={role === key ? "default" : "ghost"} size="sm" onClick={() => setRole(key)} className="h-8">
                <Icon /> {roleMeta[key].label}
              </Button>
            );
          })}
        </div>
        <Button variant="ghost" size="icon" onClick={onSound} aria-label={soundOn ? "Stop WEPA jingle" : "Play WEPA jingle"} title="Play the WEPA jingle">
          <Music2 className={soundOn ? "text-coral" : ""} />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notifications"><Bell /></Button>
        {signedInEmail ? (
          <Button variant="outline" size="sm" onClick={onSignOut} className="hidden sm:inline-flex">Sign out</Button>
        ) : (
          <Button size="sm" onClick={onAuth}>Sign in</Button>
        )}
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu"><Menu /></Button>
      </div>
    </header>
  );
}

function RoleRail({ role, setRole }: { role: DemoRole; setRole: (role: DemoRole) => void }) {
  return (
    <div className="border-b border-border bg-surface-dark text-surface-dark-foreground">
      <div className="mx-auto flex max-w-[1440px] items-center gap-2 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
        <span className="shrink-0 text-[11px] font-bold uppercase text-surface-dark-foreground/55">Judge view</span>
        <ChevronRight className="size-3 shrink-0 text-surface-dark-foreground/40" />
        {(Object.keys(roleMeta) as DemoRole[]).map((key) => (
          <Button
            key={key}
            variant="ghost"
            size="sm"
            onClick={() => setRole(key)}
            className={cn("h-7 shrink-0 text-surface-dark-foreground/65 hover:bg-surface-dark-foreground/10 hover:text-surface-dark-foreground md:hidden", role === key && "bg-surface-dark-foreground/15 text-surface-dark-foreground")}
          >
            {roleMeta[key].label}
          </Button>
        ))}
        <span className="ml-auto hidden text-xs text-surface-dark-foreground/55 md:block">Switch roles to follow one offer from partner → hospital → nurse</span>
      </div>
    </div>
  );
}

function NurseExperience({ onSelectGig, soundOn, onSound, jingleMedia }: { onSelectGig: (gig: DemoGig) => void; soundOn: boolean; onSound: () => void; jingleMedia: ReactNode }) {
  const [specialty, setSpecialty] = useState("All specialties");
  const [stepState, setStepState] = useState(qualificationSteps);
  const complete = stepState.filter((step) => step.done).length;
  const progress = Math.round((complete / stepState.length) * 100);
  const filtered = specialty === "All specialties" ? demoGigs : demoGigs.filter((gig) => gig.specialty.includes(specialty));

  function finishStep(id: string) {
    setStepState((steps) => steps.map((step) => step.id === id ? { ...step, done: true } : step));
    toast.success("Qualification progress saved.");
  }

  return (
    <>
      <section className="relative isolate overflow-hidden bg-surface-dark text-surface-dark-foreground">
        <img src={coastImage} alt="Puerto Rico coast and turquoise Caribbean water" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 -z-10 bg-hero-wash" />
        <div className="mx-auto grid max-w-[1440px] items-end gap-10 px-4 pb-12 pt-20 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-16">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 border-l-2 border-accent px-3 text-xs font-bold uppercase text-surface-dark-foreground/80">
              <Sparkles className="size-4 text-accent" /> Travel nursing, Puerto Rico remixed
            </div>
            <h1 className="max-w-2xl text-4xl font-black leading-[1.02] sm:text-6xl lg:text-7xl">Come for the Island.<br /><span className="text-primary">Care for its People.</span></h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-surface-dark-foreground/85 sm:text-lg">Come for the island — and make a little money while you’re here. Puerto Rico hospitals pay honest local wages, and the island picks up the rest: <strong className="font-bold text-surface-dark-foreground">free travel, lodging, and entertainment instead of high pay.</strong></p>
            <div className="mt-6 grid max-w-lg grid-cols-3 gap-3">
              <HeroStat value="$1,850" label="weekly, local hospital pay" />
              <HeroStat value="+$1,400" label="island living covered" />
              <HeroStat value="100%" label="turnkey arrival" />
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => document.getElementById("gigs")?.scrollIntoView({ behavior: "smooth" })}>Explore live gigs <ArrowRight /></Button>
              <Button size="lg" variant="outline" className="border-surface-dark-foreground/30 bg-surface-dark/30 text-surface-dark-foreground hover:bg-surface-dark-foreground/10 hover:text-surface-dark-foreground" onClick={() => document.getElementById("ready")?.scrollIntoView({ behavior: "smooth" })}>Get Puerto Rico ready</Button>
            </div>
          </div>
          <div className="relative overflow-hidden border border-surface-dark-foreground/25 bg-surface-dark/55 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between border-b border-surface-dark-foreground/15 px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-surface-dark-foreground/70">The WEPA anthem</span>
              <span className="text-[11px] text-surface-dark-foreground/50">6 seconds of island</span>
            </div>
            <button type="button" onClick={onSound} aria-label={soundOn ? "Pause the WEPA anthem" : "Play the WEPA anthem"} className="group relative block w-full cursor-pointer">
              {jingleMedia}
              {soundOn ? (
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-1.5 bg-gradient-to-t from-black/60 to-transparent p-4" aria-hidden>
                  {[10, 18, 26, 14, 22, 8, 16, 24, 12].map((h, i) => (
                    <span key={i} className="w-1.5 animate-pulse rounded-full bg-primary" style={{ height: `${h}px`, animationDelay: `${i * 90}ms` }} />
                  ))}
                </span>
              ) : (
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-dark/35 transition-colors group-hover:bg-surface-dark/20">
                  <span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-105"><Play className="ml-0.5 size-6" /></span>
                  <span className="text-xs font-bold uppercase tracking-wide text-surface-dark-foreground">Watch &amp; listen · 6s</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      <section id="formula" className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow">The WEPA formula</p>
          <h2 className="mt-1 text-3xl font-black sm:text-4xl">Free travel, lodging, and fun — instead of high pay.</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Mainland travel contracts pay big, then quietly take it back in rent, overtime, and burnout. Here you make a little money while you’re here — and the island picks up almost everything else.</p>
        </div>
        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          <div className="border border-border bg-card">
            <div className="flex items-baseline justify-between border-b border-border bg-muted px-5 py-4">
              <h3 className="text-lg font-black">The mainland contract</h3>
              <span className="text-sm font-bold text-muted-foreground line-through decoration-coral decoration-2">$3,800/wk</span>
            </div>
            <ul className="space-y-3 p-5">
              <li className="flex items-start gap-3 text-sm"><X className="mt-0.5 size-4 shrink-0 text-coral" /> Gouged short-term rent swallows most of the paycheck</li>
              <li className="flex items-start gap-3 text-sm"><X className="mt-0.5 size-4 shrink-0 text-coral" /> Crisis overtime just to break even</li>
              <li className="flex items-start gap-3 text-sm"><X className="mt-0.5 size-4 shrink-0 text-coral" /> Winter shifts in a city you never see</li>
            </ul>
            <p className="border-t border-border px-5 py-3 text-xs font-bold uppercase text-muted-foreground">Bottom line: a paycheck that disappears</p>
          </div>
          <div className="border-2 border-primary bg-primary/5">
            <div className="flex items-baseline justify-between border-b border-primary/20 bg-primary px-5 py-4 text-primary-foreground">
              <h3 className="text-lg font-black">The WEPA island chapter</h3>
              <span className="text-sm font-bold">$1,850/wk + island</span>
            </div>
            <ul className="space-y-3 p-5">
              <li className="flex items-start gap-3 text-sm"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /> Honest local pay from Puerto Rico hospitals</li>
              <li className="flex items-start gap-3 text-sm"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /> Travel, lodging, and food covered by island partners</li>
              <li className="flex items-start gap-3 text-sm"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /> Bio-bay weekends, surf, and rainforest built into the gig</li>
            </ul>
            <p className="border-t border-primary/20 bg-primary/10 px-5 py-3 text-xs font-bold uppercase text-primary">Bottom line: you keep the island — and still bank savings</p>
          </div>
        </div>
      </section>

      <section id="ready" className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_1.95fr] lg:px-8">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">Puerto Rico ready</p>
                <h2 className="mt-1 text-2xl font-extrabold">You’re {progress}% there, Maya.</h2>
              </div>
              <div className="flex size-14 items-center justify-center rounded-full border-4 border-primary bg-primary/10 text-sm font-black text-primary">{progress}%</div>
            </div>
            <Progress value={progress} className="mt-5 h-2.5" />
            <div className="mt-5 border-l-2 border-accent bg-accent/8 p-4">
              <div className="flex gap-3"><Sparkles className="mt-0.5 size-4 shrink-0 text-accent-strong" /><div><p className="text-sm font-bold">WEPA Guide</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Your clinical profile is strong. Finish the document packet next; it unlocks fast-track review for 3 matching gigs.</p></div></div>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {stepState.map((step) => (
              <button key={step.id} type="button" onClick={() => !step.done && finishStep(step.id)} className="group flex min-h-24 items-start gap-3 border border-border bg-background p-4 text-left transition-colors hover:border-primary">
                <span className={cn("mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border", step.done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted text-muted-foreground")}>
                  {step.done ? <Check className="size-3.5" /> : <span className="size-1.5 rounded-full bg-current" />}
                </span>
                <span><span className="block text-sm font-bold">{step.title}</span><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{step.detail}</span></span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="gigs" className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="eyebrow">Live opportunities</p><h2 className="mt-1 text-3xl font-black sm:text-4xl">Gigs with more life in them.</h2></div>
          <div className="relative w-full sm:w-64"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><select value={specialty} onChange={(event) => setSpecialty(event.target.value)} className="h-11 w-full appearance-none rounded-md border border-input bg-card pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"><option>All specialties</option><option>ICU</option><option>Emergency</option><option>NICU</option></select></div>
        </div>
        <div className="mt-7 grid gap-5 lg:grid-cols-3">
          {filtered.map((gig, index) => <GigCard key={gig.id} gig={gig} featured={index === 0} onOpen={() => onSelectGig(gig)} />)}
        </div>
      </section>

      {!soundOn && (
        <button type="button" onClick={onSound} className="fixed inset-x-4 bottom-20 z-40 flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-xl md:hidden">
          <Music2 /> Experience the WEPA anthem
        </button>
      )}
      <MobileNurseNav />
    </>
  );
}

function GigCard({ gig, featured, onOpen }: { gig: DemoGig; featured: boolean; onOpen: () => void }) {
  return (
    <article className={cn("group flex flex-col overflow-hidden border bg-card transition-all hover:-translate-y-1 hover:shadow-xl", featured ? "border-primary" : "border-border")}>
      <div className={cn("flex items-center justify-between px-4 py-2 text-xs font-bold uppercase", featured ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
        <span>{featured ? "Top match" : "Great match"}</span><span>{gig.match}% fit</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground"><Building2 className="size-4" /> {gig.hospital}</div>
        <h3 className="mt-4 text-2xl font-extrabold leading-tight">{gig.title}</h3>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground"><span className="flex items-center gap-1"><MapPin className="size-4" /> {gig.city}</span><span className="flex items-center gap-1"><Stethoscope className="size-4" /> {gig.specialty}</span></div>
        <div className="my-5 grid grid-cols-3 border-y border-border py-4 text-center"><div><strong className="block text-lg">${gig.pay.toLocaleString()}</strong><span className="text-[11px] uppercase text-muted-foreground">weekly</span></div><div className="border-x border-border"><strong className="block text-lg">{gig.duration}</strong><span className="text-[11px] uppercase text-muted-foreground">weeks</span></div><div><strong className="block text-lg">{gig.start}</strong><span className="text-[11px] uppercase text-muted-foreground">starts</span></div></div>
        <p className="text-xs font-bold uppercase text-muted-foreground">Your island package</p>
        <ul className="mt-3 space-y-2">{gig.benefits.map((benefit) => <li key={benefit} className="flex items-center gap-2 text-sm"><CheckCircle2 className="size-4 text-primary" /> {benefit}</li>)}</ul>
        <Button className="mt-6 w-full" variant={featured ? "default" : "outline"} onClick={onOpen}>See the full gig <ArrowRight /></Button>
      </div>
    </article>
  );
}

function HospitalExperience() {
  const [selected, setSelected] = useState(() => demoOffers.filter((offer) => offer.selected).map((offer) => offer.id));
  const [published, setPublished] = useState(true);
  const packageValue = useMemo(() => demoOffers.filter((offer) => selected.includes(offer.id)).reduce((total, offer) => total + offer.retail, 0), [selected]);

  function toggleOffer(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((key) => key !== id) : [...current, id]);
  }

  return (
    <WorkspaceShell role="hospital" title="Build the gig they’ll cross an ocean for." subtitle="Centro Médico del Caribe · San Juan">
      <div className="grid gap-6 xl:grid-cols-[1.45fr_.55fr]">
        <section>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">Private partner marketplace</p><h2 className="mt-1 text-3xl font-black">Make your offer impossible to ignore.</h2><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Compare island partners competing to strengthen your Cardiac ICU package. Their private pricing never appears to nurses.</p></div><Button variant="outline"><Search /> Filter offers</Button></div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">{demoOffers.map((offer) => <OfferCard key={offer.id} offer={offer} selected={selected.includes(offer.id)} onToggle={() => toggleOffer(offer.id)} />)}</div>
        </section>
        <aside className="xl:sticky xl:top-28 xl:self-start">
          <div className="border border-border bg-card">
            <div className="border-b border-border bg-surface-dark p-5 text-surface-dark-foreground"><p className="text-xs font-bold uppercase text-surface-dark-foreground/60">Package preview</p><h3 className="mt-2 text-2xl font-black">Cardiac ICU, with an island built in</h3><p className="mt-2 text-sm text-surface-dark-foreground/65">San Juan · 13 weeks · $2,450/wk</p></div>
            <div className="p-5"><div className="flex items-end justify-between"><span className="text-sm text-muted-foreground">Nurse-facing value</span><strong className="text-3xl font-black text-primary">${packageValue.toLocaleString()}</strong></div><div className="mt-5 space-y-3">{demoOffers.filter((offer) => selected.includes(offer.id)).map((offer) => <div key={offer.id} className="flex items-start gap-3 border-b border-border pb-3"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /><div><p className="text-sm font-bold">{offer.title}</p><p className="text-xs text-muted-foreground">{offer.partner}</p></div></div>)}</div>
              <Button className="mt-5 w-full" onClick={() => { setPublished(true); toast.success("Gig package published to matched nurses."); }}>{published ? <><Check /> Package is live</> : <>Publish package <ArrowRight /></>}</Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">Private partner prices stay hidden.</p>
            </div>
          </div>
          <div className="mt-4 border-l-2 border-coral bg-coral/8 p-4"><div className="flex gap-3"><Users className="size-5 text-coral" /><div><p className="font-bold">12 qualified matches</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">4 nurses are ready to interview now.</p></div></div></div>
        </aside>
      </div>
      <Applicants />
    </WorkspaceShell>
  );
}

function OfferCard({ offer, selected, onToggle }: { offer: DemoOffer; selected: boolean; onToggle: () => void }) {
  const savings = offer.retail ? Math.round((1 - offer.price / offer.retail) * 100) : 100;
  return (
    <article className={cn("flex flex-col border bg-card p-5 transition-colors", selected ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/60")}>
      <div className="flex items-start justify-between gap-3"><span className="tag">{offer.category}</span>{offer.price === 0 ? <span className="tag tag-coral">Partner gift</span> : <span className="tag tag-teal">Save {savings}%</span>}</div>
      <p className="mt-4 text-xs font-bold uppercase text-muted-foreground">{offer.partner}</p><h3 className="mt-1 text-xl font-extrabold">{offer.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{offer.description}</p>
      <div className="mt-5 flex items-end justify-between border-t border-border pt-4"><div><span className="block text-xs text-muted-foreground">Private hospital price</span><strong className="text-2xl">{offer.price === 0 ? "FREE" : `$${offer.price}`}</strong> <span className="text-xs text-muted-foreground line-through">${offer.retail}</span></div><Button size="sm" variant={selected ? "default" : "outline"} onClick={onToggle}>{selected ? <><Check /> Added</> : <><Plus /> Add</>}</Button></div>
    </article>
  );
}

function Applicants() {
  const [status, setStatus] = useState("Qualified");
  return (
    <section className="mt-12"><div className="flex items-end justify-between"><div><p className="eyebrow">Candidate pipeline</p><h2 className="mt-1 text-3xl font-black">Ready talent, clearly ranked.</h2></div><span className="hidden text-sm text-muted-foreground sm:block">Updated now</span></div>
      <div className="mt-6 overflow-x-auto border border-border bg-card"><table className="w-full min-w-[760px] text-left"><thead className="border-b border-border bg-muted text-xs uppercase text-muted-foreground"><tr><th className="p-4">Nurse</th><th className="p-4">Specialty</th><th className="p-4">PR ready</th><th className="p-4">Match</th><th className="p-4">Stage</th><th className="p-4"></th></tr></thead><tbody><tr><td className="p-4"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-full bg-primary/15 font-bold text-primary">MR</span><div><strong className="block">Maya Rivera, RN</strong><span className="text-xs text-muted-foreground">Austin, TX · 6 yrs</span></div></div></td><td className="p-4 text-sm">Cardiac ICU</td><td className="p-4"><span className="tag tag-teal">80% complete</span></td><td className="p-4 font-black text-primary">94%</td><td className="p-4"><select value={status} onChange={(event) => { setStatus(event.target.value); toast.success(`Maya moved to ${event.target.value}.`); }} className="h-9 rounded-md border border-input bg-background px-3 text-sm"><option>Applied</option><option>Qualified</option><option>Interview</option><option>Offered</option></select></td><td className="p-4"><Button variant="outline" size="sm">Review</Button></td></tr></tbody></table></div>
    </section>
  );
}

function TourismExperience() {
  const [offers, setOffers] = useState(demoOffers);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState({ title: "", category: "Stay", location: "", retail: "", price: "", description: "" });

  function submitOffer(event: FormEvent) {
    event.preventDefault();
    const offer: DemoOffer = { id: crypto.randomUUID(), partner: "Your Puerto Rico brand", title: draft.title, category: draft.category, location: draft.location, retail: Number(draft.retail), price: Number(draft.price), description: draft.description, selected: false };
    setOffers((current) => [offer, ...current]);
    setFormOpen(false);
    toast.success("Your private hospital offer is live.");
  }

  return (
    <WorkspaceShell role="tourism" title="Put your brand inside the journey." subtitle="Private offers · Puerto Rico-wide">
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <section className="bg-coral p-6 text-coral-foreground sm:p-8"><Palmtree className="size-8" /><p className="mt-10 text-xs font-bold uppercase text-coral-foreground/65">Marketplace impact</p><h2 className="mt-2 text-3xl font-black">You make the gig feel like Puerto Rico.</h2><p className="mt-3 text-sm leading-relaxed text-coral-foreground/80">Hospitals compete for great nurses. Your private offer can be the reason one chooses their team—and discovers your business.</p><Button className="mt-7 bg-surface-dark text-surface-dark-foreground hover:bg-surface-dark/90" onClick={() => setFormOpen(true)}><Plus /> Create an offer</Button></section>
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4"><Stat label="Live offers" value={String(offers.length)} icon={BriefcaseMedical} /><Stat label="Package adds" value="11" icon={CheckCircle2} /><Stat label="Nurses reached" value="284" icon={Users} /><Stat label="Value contributed" value="$18.6k" icon={CircleDollarSign} /></section>
      </div>
      <section className="mt-12"><div className="flex items-end justify-between"><div><p className="eyebrow">Your private offers</p><h2 className="mt-1 text-3xl font-black">Compete on what makes you memorable.</h2></div><Button onClick={() => setFormOpen(true)}><Plus /> New offer</Button></div><div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{offers.slice(0, 6).map((offer, index) => <article key={offer.id} className="border border-border bg-card p-5"><div className="flex items-center justify-between"><span className="tag">{offer.category}</span><span className="flex items-center gap-1 text-xs font-bold text-primary"><span className="size-2 rounded-full bg-primary" /> Live</span></div><h3 className="mt-4 text-xl font-extrabold">{offer.title}</h3><p className="mt-2 text-sm text-muted-foreground">{offer.location}</p><div className="mt-5 grid grid-cols-2 border-y border-border py-3"><div><span className="block text-xs text-muted-foreground">Hospital price</span><strong>{offer.price === 0 ? "Partner gift" : `$${offer.price}`}</strong></div><div className="border-l border-border pl-4"><span className="block text-xs text-muted-foreground">Package adds</span><strong>{index === 0 ? 6 : Math.max(1, 4 - index)}</strong></div></div><Button variant="ghost" className="mt-3 w-full justify-between">View activity <ArrowRight /></Button></article>)}</div></section>
      <Dialog open={formOpen} onOpenChange={setFormOpen}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Create a private hospital offer</DialogTitle><DialogDescription>Hospitals see your terms and price. Nurses see only the benefit when it’s selected.</DialogDescription></DialogHeader><form onSubmit={submitOffer} className="space-y-4"><Field label="Offer title"><Input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. First month waterfront stay" /></Field><div className="grid grid-cols-2 gap-3"><Field label="Category"><select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}><option>Stay</option><option>Mobility</option><option>Experience</option><option>Wellness</option><option>Food</option></select></Field><Field label="Location"><Input required value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} /></Field></div><Field label="What’s included"><Textarea required value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></Field><div className="grid grid-cols-2 gap-3"><Field label="Retail value"><Input required type="number" value={draft.retail} onChange={(e) => setDraft({ ...draft, retail: e.target.value })} /></Field><Field label="Hospital price"><Input required type="number" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} /></Field></div><Button type="submit" className="w-full">Publish private offer <ArrowRight /></Button></form></DialogContent></Dialog>
    </WorkspaceShell>
  );
}

function WorkspaceShell({ role, title, subtitle, children }: { role: DemoRole; title: string; subtitle: string; children: ReactNode }) {
  const Icon = roleMeta[role].icon;
  return <><section className="border-b border-border bg-card"><div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-8 sm:px-6 lg:px-8"><span className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary"><Icon className="size-6" /></span><div><p className="text-xs font-bold uppercase text-muted-foreground">{roleMeta[role].label} workspace · {subtitle}</p><h1 className="mt-1 text-3xl font-black sm:text-4xl">{title}</h1></div></div></section><div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">{children}</div></>;
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return <div className="border border-surface-dark-foreground/20 bg-surface-dark/50 px-3 py-3 backdrop-blur"><strong className="block text-lg font-black text-primary sm:text-xl">{value}</strong><span className="mt-0.5 block text-[11px] leading-tight text-surface-dark-foreground/70">{label}</span></div>;
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Star }) {
  return <div className="border border-border bg-card p-4"><Icon className="size-5 text-primary" /><strong className="mt-5 block text-2xl font-black">{value}</strong><span className="text-xs text-muted-foreground">{label}</span></div>;
}

function GigDialog({ gig, onClose, signedIn, onAuth }: { gig: DemoGig | null; onClose: () => void; signedIn: boolean; onAuth: () => void }) {
  const [applied, setApplied] = useState(false);
  useEffect(() => setApplied(false), [gig?.id]);
  if (!gig) return null;
  return <Dialog open={Boolean(gig)} onOpenChange={(open) => !open && onClose()}><DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><p className="eyebrow">{gig.match}% match · {gig.city}</p><DialogTitle className="text-3xl font-black">{gig.title}</DialogTitle><DialogDescription>{gig.hospital} · {gig.specialty}</DialogDescription></DialogHeader><div className="grid grid-cols-3 border-y border-border py-4 text-center"><div><strong className="text-xl">${gig.pay}</strong><span className="block text-xs text-muted-foreground">per week</span></div><div className="border-x border-border"><strong className="text-xl">{gig.duration}</strong><span className="block text-xs text-muted-foreground">weeks</span></div><div><strong className="text-xl">{gig.start}</strong><span className="block text-xs text-muted-foreground">start</span></div></div><p className="text-sm leading-relaxed text-muted-foreground">{gig.description}</p><div className="bg-primary/8 p-5"><p className="text-xs font-bold uppercase text-primary">Built into this gig</p><ul className="mt-3 grid gap-2 sm:grid-cols-2">{gig.benefits.map((item) => <li key={item} className="flex items-center gap-2 text-sm font-medium"><CheckCircle2 className="size-4 text-primary" /> {item}</li>)}</ul></div>{applied ? <div className="flex items-center gap-3 bg-primary p-4 text-primary-foreground"><CheckCircle2 /><div><strong className="block">Application sent</strong><span className="text-sm text-primary-foreground/75">The hospital can now review your Puerto Rico readiness.</span></div></div> : <Button size="lg" className="w-full" onClick={() => { if (!signedIn) { onClose(); onAuth(); return; } setApplied(true); toast.success("Application sent to the hospital."); }}>Apply to this gig <ArrowRight /></Button>}</DialogContent></Dialog>;
}

function AuthDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true);
    const result = mode === "signin" ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password, options: { data: { full_name: email.split("@")[0] } } });
    setBusy(false);
    if (result.error) { toast.error(result.error.message); return; }
    if (mode === "signup" && !result.data.session) toast.success("Check your email to confirm your WEPA.care account."); else { toast.success("Welcome to WEPA.care."); onOpenChange(false); }
  }

  async function google() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    setBusy(false);
    if (result.error) toast.error(result.error.message); else if (!result.redirected) onOpenChange(false);
  }

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle className="text-2xl font-black">{mode === "signin" ? "Welcome back." : "Start your Puerto Rico journey."}</DialogTitle><DialogDescription>One account. Your role and workspace follow you.</DialogDescription></DialogHeader><Button variant="outline" className="w-full" disabled={busy} onClick={() => void google()}><svg viewBox="0 0 24 24" className="size-4" aria-hidden><path fill="currentColor" d="M21.35 11.1h-9.17v2.98h5.26c-.23 1.5-1.73 4.4-5.26 4.4A6.48 6.48 0 1 1 12.18 5c2.01 0 3.36.86 4.13 1.6l2.82-2.73A10.3 10.3 0 0 0 12.18 1.2a10.8 10.8 0 1 0 0 21.6c6.23 0 10.36-4.38 10.36-10.54 0-.7-.08-1.23-.17-1.76z" /></svg>Continue with Google</Button><div className="flex items-center gap-3 text-xs uppercase text-muted-foreground"><span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" /></div><form onSubmit={submit} className="space-y-4"><Field label="Email"><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field><Field label="Password"><Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></Field><Button type="submit" className="w-full" disabled={busy}>{busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"}</Button></form><Button variant="ghost" className="w-full" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>{mode === "signin" ? "New to WEPA.care? Create an account" : "Already have an account? Sign in"}</Button></DialogContent></Dialog>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <Label className="flex flex-col gap-1.5"><span>{label}</span>{children}</Label>; }

function MobileNurseNav() {
  return <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-card/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden"><Button variant="ghost" className="h-auto flex-col gap-1 text-[10px] text-primary"><HeartPulse /> Home</Button><Button variant="ghost" className="h-auto flex-col gap-1 text-[10px]"><Search /> Gigs</Button><Button variant="ghost" className="h-auto flex-col gap-1 text-[10px]"><ClipboardCheck /> Ready</Button><Button variant="ghost" className="h-auto flex-col gap-1 text-[10px]"><FileCheck2 /> Applications</Button></nav>;
}