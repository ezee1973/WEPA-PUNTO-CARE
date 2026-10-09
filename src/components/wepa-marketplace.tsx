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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { demoGigs, demoPartners, qualificationSteps, type DemoGig, type DemoPartner } from "@/lib/wepa-data";
import { cn } from "@/lib/utils";

const logoUrl = logoAsset.url;
const jingleUrl = jingleAsset.url;

export function WepaMarketplace() {
  const [selectedGig, setSelectedGig] = useState<DemoGig | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  // Every land opens with the anthem takeover; it plays, fades, and you're in.
  const [anthemPlaying, setAnthemPlaying] = useState(true);
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);

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
      {anthemPlaying && <AnthemTakeover onDone={() => setAnthemPlaying(false)} />}
      <Header
        signedInEmail={signedInEmail}
        onAuth={() => setAuthOpen(true)}
        onSignOut={() => void signOut()}
      />
      <NurseExperience onSelectGig={setSelectedGig} />
      <GigDialog gig={selectedGig} onClose={() => setSelectedGig(null)} signedIn={Boolean(signedInEmail)} onAuth={() => setAuthOpen(true)} />
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </main>
  );
}

function AnthemTakeover({ onDone }: { onDone: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fading, setFading] = useState(false);
  const doneRef = useRef(false);

  function finish() {
    if (doneRef.current) return;
    doneRef.current = true;
    setFading(true);
    window.setTimeout(onDone, 650);
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Try with sound first; if the browser blocks it, fall back to muted.
    video.muted = false;
    void video.play().catch(() => {
      video.muted = true;
      void video.play().catch(() => {});
    });

    // Close the takeover 3 seconds before the clip would otherwise end.
    let closeTimer = 0;
    const schedule = () => {
      const remaining = Math.max(1200, (video.duration || 6) * 1000 - 3000);
      closeTimer = window.setTimeout(finish, remaining);
    };
    if (video.readyState >= 1) schedule();
    else video.addEventListener("loadedmetadata", schedule, { once: true });

    // Safety net: never trap the visitor if "ended" never fires.
    const safety = window.setTimeout(finish, 6000);
    return () => {
      video.removeEventListener("loadedmetadata", schedule);
      window.clearTimeout(closeTimer);
      window.clearTimeout(safety);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[80] flex items-center justify-center bg-surface-dark transition-opacity duration-500",
        fading && "pointer-events-none opacity-0",
      )}
      role="dialog"
      aria-label="WEPA.care anthem"
    >
      <video
        ref={videoRef}
        src={jingleUrl}
        autoPlay
        playsInline
        onEnded={finish}
        className="h-full w-full object-contain"
      />
    </div>
  );
}

function Header({
  signedInEmail,
  onAuth,
  onSignOut,
}: {
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
        <div className="ml-auto flex items-center gap-1">
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
    <article className="flex w-72 shrink-0 snap-start flex-col border border-surface-dark-foreground/15 bg-surface-dark-foreground/5 p-5 backdrop-blur sm:w-80">
      <div className="flex items-center justify-between">
        <span className="bg-primary px-2 py-1 text-[10px] font-black uppercase text-primary-foreground">{partner.category}</span>
        <span className="flex items-center gap-1 text-xs font-semibold text-surface-dark-foreground/60"><MapPin className="size-3.5" /> {partner.location}</span>
      </div>
      <h3 className="mt-4 text-xl font-extrabold leading-tight">{partner.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-surface-dark-foreground/75">{partner.blurb}</p>
      <p className="mt-4 flex items-start gap-2 border-t border-surface-dark-foreground/15 pt-3 text-sm font-bold text-primary"><Sparkles className="mt-0.5 size-4 shrink-0" /> {partner.perk}</p>
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