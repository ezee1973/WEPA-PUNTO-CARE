import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowRight,
  Bell,
  Building2,
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
import nurseIconAsset from "@/assets/wepa-nurse.png.asset.json";
import hospitalIconAsset from "@/assets/wepa-hospital.png.asset.json";
import tourismIconAsset from "@/assets/wepa-tourism-partner.png.asset.json";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { demoGigs, demoOffers, demoPartners, type DemoGig, type DemoOffer, type DemoPartner } from "@/lib/wepa-data";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { CandidatePassport } from "@/components/readiness-passport";
import { HospitalExperience } from "@/components/hospital-experience";
import { STAGES, nextBestAction, preparationProgress, useReadiness } from "@/lib/readiness";

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

const ROLE_ICONS: Record<MarketRole, string> = {
  nurse: nurseIconAsset.url,
  hospital: hospitalIconAsset.url,
  tourism: tourismIconAsset.url,
};

const JOURNEY_DOORS: { id: MarketRole; audience: string; title: string; copy: string }[] = [
  {
    id: "nurse",
    audience: "Nurses",
    title: "Find your island opportunity",
    copy: "Explore nursing gigs, prepare to apply, and discover life in Puerto Rico.",
  },
  {
    id: "hospital",
    audience: "Hospitals",
    title: "Build a stronger nursing team",
    copy: "Create opportunities that attract travel nurses to your hospital.",
  },
  {
    id: "tourism",
    audience: "Tourism partners",
    title: "Welcome nurses to your business",
    copy: "Offer stays, experiences, and perks that make island assignments more rewarding.",
  },
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
        "fixed inset-0 z-[80] overflow-hidden bg-ocean transition-opacity duration-700 ease-in-out",
        fading && "pointer-events-none opacity-0",
      )}
      role="dialog"
      aria-label="Welcome to WEPA.care — choose your journey"
    >
      {/* Restrained coast: a soft masked sea band low on the screen, never a backdrop */}
      <img
        src={coastImage}
        alt=""
        aria-hidden
        className={cn(
          "absolute inset-x-0 bottom-0 h-[48%] w-full object-cover object-center [mask-image:linear-gradient(to_top,black_4%,transparent_88%)] transition-opacity duration-700",
          started ? "opacity-0" : "opacity-45",
        )}
      />
      <div className="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-ocean via-ocean/60 to-transparent" />
      <div className="absolute -top-40 left-1/2 h-[26rem] w-[46rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <video
        ref={videoRef}
        src={jingleUrl}
        playsInline
        preload="auto"
        onEnded={finish}
        className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-500", started ? "opacity-100" : "opacity-0")}
      />
      {!started && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-7 overflow-y-auto px-5 py-8 sm:gap-9 sm:py-12">
          <div className="flex w-full max-w-3xl flex-col items-center gap-3 text-center sm:gap-4">
            <img
              src={logoUrl}
              alt="WEPA.care"
              className="h-11 w-auto object-contain [filter:brightness(0)_invert(1)_drop-shadow(0_10px_24px_rgba(9,45,55,0.55))] sm:h-16"
            />
            <h1 className="max-w-2xl text-balance text-[1.85rem] font-black leading-[1.06] tracking-tight text-ocean-foreground sm:text-5xl">
              Come for the Island.
              <span className="block text-primary">Care for its People.</span>
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-ocean-foreground/90 sm:text-base">
              The travel nursing marketplace connecting Puerto Rico’s hospitals, nurses, and tourism partners — bringing care, island stays, and local experiences together.
            </p>
          </div>

          <div className="w-full max-w-4xl">
            <p className="mb-3 text-center text-[0.66rem] font-extrabold uppercase tracking-[0.22em] text-ocean-foreground/75">
              Find your place
            </p>
            <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
              {JOURNEY_DOORS.map((door) => (
                <button
                  key={door.id}
                  type="button"
                  onClick={() => enter(door.id)}
                  className="group relative flex items-center gap-4 rounded-2xl bg-ivory p-4 text-left shadow-[0_20px_45px_-24px_rgba(9,45,55,0.9)] ring-1 ring-ocean/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_-24px_rgba(255,117,99,0.6)] hover:ring-coral/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral sm:flex-col sm:items-start sm:gap-4 sm:p-5"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary/55 ring-1 ring-primary/15 sm:h-[4.25rem] sm:w-[4.25rem]">
                    <img
                      src={ROLE_ICONS[door.id]}
                      alt=""
                      aria-hidden
                      className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-110 sm:h-[3.25rem] sm:w-[3.25rem]"
                    />
                  </span>
                  <span className="min-w-0 sm:min-h-[6.75rem] sm:flex-1">
                    <span className="block text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-accent-deep">{door.audience}</span>
                    <span className="mt-1 block text-base font-black leading-tight text-ivory-foreground sm:text-lg">{door.title}</span>
                    <span className="mt-1 block text-xs leading-snug text-ivory-foreground/65 sm:text-sm">{door.copy}</span>
                  </span>
                  <span className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-coral/15 text-coral ring-1 ring-coral/35 transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-coral group-hover:text-ivory sm:mt-1 sm:self-end sm:ml-0">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-center text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ocean-foreground/85">
              No account needed to look around
            </p>
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
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors sm:px-4 sm:text-sm",
                role === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <img src={ROLE_ICONS[tab.id]} alt="" aria-hidden className="h-5 w-5 object-contain sm:h-6 sm:w-6" />
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
  const { state } = useReadiness();
  const progress = preparationProgress(state);
  const nextAction = nextBestAction(state);
  const filtered = specialty === "All specialties" ? demoGigs : demoGigs.filter((gig) => gig.specialty.includes(specialty));

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
              <Button asChild size="lg" variant="outline" className="border-surface-dark-foreground/30 bg-surface-dark/30 text-surface-dark-foreground hover:bg-surface-dark-foreground/10 hover:text-surface-dark-foreground"><Link to="/ready">Get Puerto Rico ready</Link></Button>
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
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <img src={nurseIconAsset.url} alt="" aria-hidden className="size-12 shrink-0 object-contain" />
            <div className="min-w-0">
              <p className="text-sm font-bold sm:text-base">Puerto Rico Readiness Passport · {progress}% ready</p>
              <Progress value={progress} className="mt-2 h-1.5 max-w-md" />
              <p className="mt-2 truncate text-xs text-muted-foreground sm:text-sm">Next: {nextAction}</p>
            </div>
          </div>
          <Button asChild size="lg" className="shrink-0"><Link to="/ready">Open your passport <ArrowRight /></Link></Button>
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
  return <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-card/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden"><Button variant="ghost" className="h-auto flex-col gap-1 text-[10px] text-primary" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><HeartPulse /> Home</Button><Button variant="ghost" className="h-auto flex-col gap-1 text-[10px]" onClick={() => document.getElementById("gigs")?.scrollIntoView({ behavior: "smooth" })}><Search /> Gigs</Button><Button asChild variant="ghost" className="h-auto flex-col gap-1 text-[10px]"><Link to="/ready"><ClipboardCheck /> Ready</Link></Button><Button asChild variant="ghost" className="h-auto flex-col gap-1 text-[10px]"><Link to="/ready"><FileCheck2 /> Passport</Link></Button></nav>;
}

function HospitalCandidate() {
  const { state, update } = useReadiness();
  if (!state.applied) {
    return <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">No Candidate Passports in the gig pool yet. When Elena finishes her Readiness Passport and joins the pool, she appears here as a match.</div>;
  }
  const idx = STAGES.indexOf(state.stage);
  const next = STAGES[idx + 1];
  const blocked = next === "Cleared to start" && state.officialAuthorization !== "Issued";
  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
      <CandidatePassport state={state} />
      <div className="rounded-3xl border border-border bg-card p-4">
        <p className="font-display text-lg font-bold">Application stage</p>
        <ol className="mt-3 space-y-1.5 text-sm">
          {STAGES.map((s, i) => <li key={s} className={cn("flex items-center gap-2", i <= idx ? "font-semibold" : "text-muted-foreground")}><span className={cn("size-2.5 rounded-full", i < idx ? "bg-primary" : i === idx ? "bg-coral" : "bg-border")} />{s}</li>)}
        </ol>
        {next && <Button className="mt-4 w-full" disabled={blocked} onClick={() => { update((s) => ({ ...s, stage: next })); toast.success(`Elena advanced to ${next}.`); }}>Advance to {next}</Button>}
        {blocked && <p className="mt-2 text-xs text-muted-foreground">Official authorization pending — “Cleared to start” unlocks only once Puerto Rico issues authorization.</p>}
        {next && idx < 2 && <p className="mt-2 text-xs text-muted-foreground">You can move to Clinical review while Puerto Rico authorization is pending.</p>}
      </div>
    </div>
  );
}