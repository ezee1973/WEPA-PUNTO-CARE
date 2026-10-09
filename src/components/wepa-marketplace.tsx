import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowRight,
  Bell,
  Building2,
  Palmtree,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  HeartPulse,
  MapPin,
  Menu,
  Search,
  Sparkles,
  Stethoscope,
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
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { demoGigs, demoOffers, demoPartners, qualificationSteps, type DemoGig, type DemoOffer, type DemoPartner } from "@/lib/wepa-data";
import { cn } from "@/lib/utils";

const logoUrl = logoAsset.url;
const jingleUrl = jingleAsset.url;

type MarketRole = "nurse" | "hospital" | "tourism";

export function WepaMarketplace() {
  const [selectedGig, setSelectedGig] = useState<DemoGig | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  // Every land opens with the anthem takeover; it plays, fades, and you're in.
  const [anthemPlaying, setAnthemPlaying] = useState(true);
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const [role, setRole] = useState<MarketRole>("nurse");

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setSignedInEmail(data.user?.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setSignedInEmail(session?.user.email ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("You’re signed out.");
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {anthemPlaying && (
        <AnthemTakeover
          onDone={(chosen) => {
            setRole(chosen);
            setAnthemPlaying(false);
          }}
        />
      )}
      <Header
        signedInEmail={signedInEmail}
        onAuth={() => setAuthOpen(true)}
        onSignOut={() => void signOut()}
        role={role}
        onRole={setRole}
      />
      {role === "nurse" && <NurseExperience onSelectGig={setSelectedGig} />}
      {role === "hospital" && <HospitalExperience />}
      {role === "tourism" && <TourismExperience />}
      <GigDialog gig={selectedGig} onClose={() => setSelectedGig(null)} signedIn={Boolean(signedInEmail)} onAuth={() => setAuthOpen(true)} />
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </main>
  );
}

const JOURNEY_DOORS: { id: MarketRole; label: string; hook: string; icon: typeof Stethoscope }[] = [
  { id: "nurse", label: "I'm a Nurse", hook: "Island gigs, covered living, real adventure.", icon: Stethoscope },
  { id: "hospital", label: "I'm a Hospital", hook: "Build gig packages nurses actually want.", icon: Building2 },
  { id: "tourism", label: "I'm a Tourism Partner", hook: "Put your experiences in front of clinicians.", icon: Palmtree },
];

function AnthemTakeover({ onDone }: { onDone: (role: MarketRole) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fading, setFading] = useState(false);
  const [started, setStarted] = useState(false);
  const chosenRef = useRef<MarketRole>("nurse");
  const doneRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  function finish() {
    if (doneRef.current) return;
    doneRef.current = true;
    setFading(true);
    window.setTimeout(() => onDone(chosenRef.current), 650);
  }

  useEffect(() => () => timersRef.current.forEach((t) => window.clearTimeout(t)), []);

  function enter(role: MarketRole) {
    chosenRef.current = role;
    const video = videoRef.current;
    setStarted(true);
    if (!video) return finish();
    // The tap on a journey door unlocks sound in every browser.
    video.muted = false;
    video.currentTime = 0;
    void video.play().catch(() => finish());
    // Close 3 seconds before the clip ends; safety net if anything stalls.
    const remaining = Math.max(1200, (video.duration || 6) * 1000 - 3000);
    timersRef.current.push(window.setTimeout(finish, remaining), window.setTimeout(finish, 6000));
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-[80] overflow-hidden bg-surface-dark transition-opacity duration-700 ease-in-out",
        fading && "pointer-events-none opacity-0",
      )}
      role="dialog"
      aria-label="Welcome to WEPA.care — choose your journey"
    >
      {/* Full-bleed island backdrop blends the welcome into the anthem */}
      <img
        src={coastImage}
        alt=""
        aria-hidden
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-all duration-700",
          started ? "opacity-0" : "opacity-90",
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-surface-dark/55 via-surface-dark/35 to-surface-dark/80" />
      <video
        ref={videoRef}
        src={jingleUrl}
        playsInline
        preload="auto"
        onEnded={finish}
        className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-500", started ? "opacity-100" : "opacity-0")}
      />
      {!started && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 overflow-y-auto px-5 py-10 sm:gap-10">
          <img
            src={logoUrl}
            alt="WEPA.care"
            className="h-20 w-auto [filter:drop-shadow(0_0_18px_rgba(245,242,233,0.95))_drop-shadow(0_0_55px_rgba(245,242,233,0.75))] sm:h-28"
          />
          <p className="text-center text-sm font-bold uppercase tracking-[0.25em] text-surface-dark-foreground/90 sm:text-base">
            Come for the Island. Care for its People.
          </p>
          <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-3">
            {JOURNEY_DOORS.map((door) => (
              <button
                key={door.id}
                type="button"
                onClick={() => enter(door.id)}
                className="group flex flex-col items-start gap-3 rounded-3xl border border-surface-dark-foreground/15 bg-surface-dark-foreground/5 p-6 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-coral/60 hover:bg-surface-dark-foreground/10 hover:shadow-2xl hover:shadow-coral/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
              >
                <door.icon className="h-8 w-8 text-teal transition-colors group-hover:text-coral" aria-hidden />
                <span className="text-lg font-black text-surface-dark-foreground">{door.label}</span>
                <span className="text-sm leading-snug text-surface-dark-foreground/70">{door.hook}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const ROLE_TABS: { id: MarketRole; label: string }[] = [
  { id: "nurse", label: "Nurses" },
  { id: "hospital", label: "Hospitals" },
  { id: "tourism", label: "Travel & Tourism" },
];

function Header({
  signedInEmail,
  onAuth,
  onSignOut,
  role,
  onRole,
}: {
  signedInEmail: string | null;
  onAuth: () => void;
  onSignOut: () => void;
  role: MarketRole;
  onRole: (role: MarketRole) => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <img src={logoUrl} alt="WEPA.care" className="h-11 w-auto object-contain" />
        <div className="hidden h-7 w-px bg-border sm:block" />
        <p className="hidden text-xs font-semibold uppercase text-muted-foreground lg:block">Come for the Island.<br />Care for its People.</p>
        <nav aria-label="Marketplace sides" className="mx-auto flex items-center gap-1 rounded-full border border-border bg-muted/60 p-1">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onRole(tab.id)}
              aria-pressed={role === tab.id}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-bold transition-colors sm:px-4 sm:text-sm",
                role === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1 sm:ml-0">
          <Button variant="ghost" size="icon" aria-label="Notifications"><Bell /></Button>
          {signedInEmail ? (
            <Button variant="outline" size="sm" onClick={onSignOut} className="hidden sm:inline-flex">Sign out</Button>
          ) : (
            <Button size="sm" onClick={onAuth}>Sign in</Button>
          )}
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu"><Menu /></Button>
        </div>
      </div>
    </header>
  );
}

function NurseExperience({ onSelectGig }: { onSelectGig: (gig: DemoGig) => void }) {
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
        <div className="mx-auto max-w-[1440px] px-4 pb-12 pt-20 sm:px-6 lg:px-8 lg:pb-16">
          <div>
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

      <PartnerCarousel />

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

      <MobileNurseNav />
    </>
  );
}

function HospitalExperience() {
  const [offers, setOffers] = useState(demoOffers);
  const selected = offers.filter((offer) => offer.selected);
  const packageCost = selected.reduce((sum, offer) => sum + offer.price, 0);
  const packageRetail = selected.reduce((sum, offer) => sum + offer.retail, 0);

  function toggle(id: string) {
    setOffers((current) => current.map((offer) => offer.id === id ? { ...offer, selected: !offer.selected } : offer));
  }

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="eyebrow">Hospital workspace</p>
        <h2 className="mt-1 text-3xl font-black sm:text-4xl">Build a gig nurses actually want.</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Centro Médico del Caribe · San Juan. Pick from private partner offers to assemble the island package that ships with your gig. Nurses see the package — never the pricing.</p>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {offers.map((offer) => (
            <button key={offer.id} type="button" onClick={() => toggle(offer.id)} aria-pressed={offer.selected} className={cn("flex flex-col border p-5 text-left transition-colors", offer.selected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50")}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-muted-foreground">{offer.category}</span>
                <span className={cn("flex size-6 items-center justify-center rounded-full border", offer.selected ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent")}><Check className="size-3.5" /></span>
              </div>
              <h3 className="mt-3 text-lg font-extrabold leading-tight">{offer.title}</h3>
              <p className="mt-1 text-xs font-bold text-primary">{offer.partner} · {offer.location}</p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{offer.description}</p>
              <p className="mt-4 border-t border-border pt-3 text-sm"><strong className="text-lg">${offer.price.toLocaleString()}</strong> <span className="text-xs text-muted-foreground">partner price · retail ${offer.retail.toLocaleString()}</span></p>
            </button>
          ))}
        </div>
        <aside className="h-fit border-2 border-primary bg-primary/5 lg:sticky lg:top-24">
          <div className="border-b border-primary/20 bg-primary px-5 py-4 text-primary-foreground">
            <h3 className="text-lg font-black">Your gig package</h3>
            <p className="text-xs text-primary-foreground/75">Cardiac ICU · 13 weeks · San Juan</p>
          </div>
          <ul className="space-y-2 p-5">
            {selected.length === 0 && <li className="text-sm text-muted-foreground">Select offers to build the package.</li>}
            {selected.map((offer) => <li key={offer.id} className="flex items-center gap-2 text-sm font-medium"><CheckCircle2 className="size-4 text-primary" /> {offer.title}</li>)}
          </ul>
          <div className="grid grid-cols-2 border-t border-primary/20 text-center">
            <div className="border-r border-primary/20 p-4"><strong className="block text-xl">${packageCost.toLocaleString()}</strong><span className="text-[11px] uppercase text-muted-foreground">your cost</span></div>
            <div className="p-4"><strong className="block text-xl text-primary">${packageRetail.toLocaleString()}</strong><span className="text-[11px] uppercase text-muted-foreground">nurse sees value</span></div>
          </div>
          <div className="p-5 pt-0"><Button className="w-full" onClick={() => toast.success("Gig published with its island package.")}>Publish this gig <ArrowRight /></Button></div>
        </aside>
      </div>
    </section>
  );
}

function TourismExperience() {
  const [offers, setOffers] = useState(demoOffers);
  const [formOpen, setFormOpen] = useState(false);

  function markLive(id: string) {
    setOffers((current) => current.map((offer) => offer.id === id ? { ...offer, selected: true } : offer));
    toast.success("Offer is now visible to hospitals.");
  }

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <p className="eyebrow">Travel & tourism workspace</p>
          <h2 className="mt-1 text-3xl font-black sm:text-4xl">Put your experience in front of hospitals.</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Your offers stay private to hospitals until one selects them into a nurse-facing gig package. Compete on what makes your corner of the island unforgettable.</p>
        </div>
        <Button size="lg" onClick={() => setFormOpen(true)}>Create an offer <ArrowRight /></Button>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {offers.map((offer) => <TourismOfferCard key={offer.id} offer={offer} onPublish={() => markLive(offer.id)} />)}
      </div>
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-2xl font-black">New partner offer</DialogTitle><DialogDescription>Hospitals see this privately. Nurses only see it once it's in a gig package.</DialogDescription></DialogHeader>
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); setFormOpen(false); toast.success("Offer submitted for hospital review."); }}>
            <Field label="Experience title"><Input required placeholder="e.g. Sunset sail for two" /></Field>
            <Field label="Location"><Input required placeholder="e.g. Fajardo" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Retail value ($)"><Input required type="number" min={0} placeholder="740" /></Field>
              <Field label="Partner price ($)"><Input required type="number" min={0} placeholder="180" /></Field>
            </div>
            <Button type="submit" className="w-full">Submit offer</Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function TourismOfferCard({ offer, onPublish }: { offer: DemoOffer; onPublish: () => void }) {
  return (
    <article className="flex flex-col border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase text-muted-foreground">{offer.category}</span>
        <span className={cn("px-2 py-0.5 text-[10px] font-black uppercase", offer.selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>{offer.selected ? "Live" : "Draft"}</span>
      </div>
      <h3 className="mt-3 text-lg font-extrabold leading-tight">{offer.title}</h3>
      <p className="mt-1 text-xs font-bold text-primary">{offer.partner} · {offer.location}</p>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{offer.description}</p>
      <p className="mt-4 border-t border-border pt-3 text-sm"><strong className="text-lg">${offer.price.toLocaleString()}</strong> <span className="text-xs text-muted-foreground">to hospitals · retail ${offer.retail.toLocaleString()}</span></p>
      {!offer.selected && <Button variant="outline" size="sm" className="mt-3" onClick={onPublish}>Publish to hospitals</Button>}
    </article>
  );
}

function PartnerCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollBy(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * Math.min(track.clientWidth * 0.85, 560), behavior: "smooth" });
  }

  return (
    <section id="partners" className="overflow-hidden border-y border-border bg-surface-dark py-12 text-surface-dark-foreground">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow text-primary">The island partners</p>
            <h2 className="mt-1 text-3xl font-black sm:text-4xl">Real Puerto Rico, built into every gig.</h2>
            <p className="mt-3 text-sm leading-relaxed text-surface-dark-foreground/75">Hotels, sails, spas, and adventures from the island's best travel & tourism names — bundled into your package instead of a bigger paycheck.</p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <Button variant="outline" size="icon" aria-label="Scroll partners back" className="border-surface-dark-foreground/30 bg-transparent text-surface-dark-foreground hover:bg-surface-dark-foreground/10 hover:text-surface-dark-foreground" onClick={() => scrollBy(-1)}><ChevronLeft /></Button>
            <Button variant="outline" size="icon" aria-label="Scroll partners forward" className="border-surface-dark-foreground/30 bg-transparent text-surface-dark-foreground hover:bg-surface-dark-foreground/10 hover:text-surface-dark-foreground" onClick={() => scrollBy(1)}><ChevronRight /></Button>
          </div>
        </div>
      </div>
      <div ref={trackRef} className="mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden">
        {demoPartners.map((partner) => <PartnerCard key={partner.name} partner={partner} />)}
      </div>
    </section>
  );
}

function PartnerCard({ partner }: { partner: DemoPartner }) {
  return (
    <article className="group relative flex h-96 w-72 shrink-0 snap-start flex-col justify-end overflow-hidden border border-surface-dark-foreground/15 sm:w-80">
      <img src={partner.image} alt={partner.name} loading="lazy" width={1024} height={768} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-surface-dark/35 to-transparent" />
      <div className="absolute left-4 top-4 flex items-center gap-2">
        <span className="bg-primary px-2 py-1 text-[10px] font-black uppercase text-primary-foreground">{partner.category}</span>
        <span className="flex items-center gap-1 bg-surface-dark/60 px-2 py-1 text-[10px] font-bold uppercase text-surface-dark-foreground backdrop-blur"><MapPin className="size-3" /> {partner.location}</span>
      </div>
      <div className="relative p-5">
        <h3 className="text-2xl font-black leading-tight text-surface-dark-foreground">{partner.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-surface-dark-foreground/80">{partner.blurb}</p>
        <p className="mt-3 flex items-start gap-2 border-t border-surface-dark-foreground/25 pt-3 text-sm font-bold text-primary"><Sparkles className="mt-0.5 size-4 shrink-0" /> {partner.perk}</p>
      </div>
    </article>
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


function HeroStat({ value, label }: { value: string; label: string }) {
  return <div className="border border-surface-dark-foreground/20 bg-surface-dark/50 px-3 py-3 backdrop-blur"><strong className="block text-lg font-black text-primary sm:text-xl">{value}</strong><span className="mt-0.5 block text-[11px] leading-tight text-surface-dark-foreground/70">{label}</span></div>;
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