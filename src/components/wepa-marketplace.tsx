import { netPay } from "@/lib/business";
import { LanguageToggle } from "@/components/language-toggle";
import { TourismExperience } from "@/components/tourism-partner";
import { useLanguage } from "@/lib/i18n";
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
  MessageCircle,
  Search,
  Sparkles,
  Stethoscope,
  X,
} from "lucide-react";
import { toast } from "sonner";

import coastImage from "@/assets/puerto-rico-coast.jpg";
import westCoastImage from "@/assets/wepa-west-coast.jpg";
import jingleAsset from "@/assets/wepa-jingle.asset.json";
import logoAsset from "@/assets/wepa-care-logo.asset.json";
import nurseIconAsset from "@/assets/wepa-nurse.png.asset.json";
import hospitalIconAsset from "@/assets/wepa-hospital.png.asset.json";
import tourismIconAsset from "@/assets/wepa-tourism-partner.png.asset.json";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import {
  islandGigs,
  demoGigs,
  demoPartners,
  type DemoGig,
  type DemoPartner,
} from "@/lib/wepa-data";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { CandidatePassport } from "@/components/readiness-passport";
import { HospitalExperience } from "@/components/hospital-experience";
import { NurseStorySpotlight } from "@/components/nurse-community";
import { STAGES, useReadiness } from "@/lib/readiness";

const logoUrl = logoAsset.url;
const jingleUrl = jingleAsset.url;

type MarketRole = "nurse" | "hospital" | "tourism";

export function WepaMarketplace({ home }: { home?: MarketRole | undefined } = {}) {
  const { t: tr } = useLanguage();
  const [selectedGig, setSelectedGig] = useState<DemoGig | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  // Every land opens with the anthem takeover; it plays, fades, and you're in.
  const [anthemPlaying, setAnthemPlaying] = useState(!home);
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const [role, setRole] = useState<MarketRole>(home ?? "nurse");

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setSignedInEmail(data.user?.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) =>
      setSignedInEmail(session?.user.email ?? null),
    );
    return () => data.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success(tr("You’re signed out."));
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
      <GigDialog
        gig={selectedGig}
        onClose={() => setSelectedGig(null)}
      />
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </main>
  );
}

const ROLE_ICONS: Record<MarketRole, string> = {
  nurse: nurseIconAsset.url,
  hospital: hospitalIconAsset.url,
  tourism: tourismIconAsset.url,
};

const SPLASH_STATS: { value: string; label: string; tone: "coral" | "teal" }[] = [
  { value: "92%", label: "experience burnout", tone: "coral" },
  { value: "63%", label: "seek additional income", tone: "teal" },
  { value: "50%", label: "San Juan median RN pay v U.S.", tone: "coral" },
  { value: "42%", label: "plan to remain in healthcare", tone: "coral" },
];

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
  const { t: tr } = useLanguage();
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
      aria-label={tr("Welcome to WEPA.care — choose your journey")}
    >
      <img
        src={westCoastImage}
        alt={tr("")}
        aria-hidden
        width={1920}
        height={1280}
        className={cn(
          "wepa-splash-image absolute inset-0 h-full w-full object-cover object-[66%_center] transition-opacity duration-700 md:object-center",
          started ? "opacity-0" : "opacity-100",
        )}
      />
      <div className="absolute inset-0 bg-ocean/65 md:bg-transparent md:bg-hero-wash" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ocean via-ocean/70 to-transparent md:h-1/2" />
      <video
        ref={videoRef}
        src={jingleUrl}
        playsInline
        preload="auto"
        onEnded={finish}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
          started ? "opacity-100" : "opacity-0",
        )}
      />
      {!started && (
        <div className="absolute inset-0 overflow-y-auto">
          <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col px-5 pb-6 pt-4 sm:px-8 sm:pb-8 sm:pt-6 lg:px-12 lg:pb-10">
            <div className="wepa-splash-intro flex items-center justify-between gap-4">
              <img
                src={logoUrl}
                alt={tr("WEPA.care")}
                className="h-10 w-auto object-contain [filter:brightness(0)_invert(1)_drop-shadow(0_8px_20px_var(--color-ocean))] sm:h-14"
              />
              <LanguageToggle dark />
            </div>

            <div className="grid flex-1 items-center gap-6 pb-1 pt-6 sm:gap-8 sm:pt-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(21rem,0.8fr)] lg:gap-10 lg:pt-6 xl:gap-16">
              <div className="wepa-splash-intro min-w-0 max-w-3xl">
                <h1 className="max-w-xl text-balance text-[2.25rem] font-black leading-[1.02] text-ocean-foreground sm:text-6xl lg:text-[3.65rem] xl:text-7xl">
                  {tr("Puerto Rico needs nurses.")}
                </h1>
                <p className="mt-3 max-w-xl text-sm font-semibold leading-relaxed text-ocean-foreground/95 sm:mt-4 sm:text-base xl:text-lg">
                  {tr(
                    "Travel nurses are licensed professionals who take temporary hospital assignments. Puerto Rico competes with higher-paying mainland contracts, making critical vacancies harder to fill.",
                  )}
                </p>
                <p className="mt-2.5 text-sm font-black text-primary sm:mt-3 sm:text-base xl:text-lg">
                  {tr("Come for the Island. Care for its People.")}
                </p>

                <div className="mt-5 w-full border-t border-ocean-foreground/15 pt-4 sm:mt-6 sm:pt-5">
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4 sm:gap-x-5">
                    {SPLASH_STATS.map((stat) => (
                      <div key={stat.label} className="flex min-w-0 flex-col">
                        <dt className="order-2 mt-1.5 text-[0.7rem] font-semibold leading-snug text-ocean-foreground/85 sm:text-[0.7rem] xl:text-xs">
                          {tr(stat.label)}
                        </dt>
                        <dd
                          className={cn(
                            "order-1 text-3xl font-black leading-none sm:text-4xl xl:text-5xl",
                            stat.tone === "teal" ? "text-primary" : "text-coral",
                          )}
                        >
                          {stat.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-3 max-w-3xl text-xs leading-relaxed text-ocean-foreground/90 sm:text-sm">
                    <span className="font-black text-coral">{tr("The result:")}</span>{" "}
                    {tr("unsafe nurse-to-patient ratios and eroding patient care.")}
                  </p>
                  <p className="mt-3 max-w-2xl text-balance text-xl font-black leading-tight text-ocean-foreground sm:mt-4 sm:text-2xl xl:text-3xl">
                    {tr("The fastest fix: travel nurses from the mainland.")}
                    <br />
                    <img
                      src={logoUrl}
                      alt="WEPA! care"
                      className="mr-2 inline-block h-5 w-auto -translate-y-0.5 object-contain align-middle [filter:brightness(0)_invert(1)] sm:h-6 xl:h-7"
                    />
                    {tr("gets them ready and matched.")}
                  </p>
                </div>
              </div>

              <div className="relative min-w-0 self-center lg:pt-1">
                <div className="pointer-events-none absolute bottom-[10%] left-[2.25rem] top-[3.75rem] hidden w-px bg-gradient-to-b from-coral/20 via-primary/70 to-coral/20 lg:block" />
                <p className="mb-3 text-[0.66rem] font-extrabold uppercase text-ocean-foreground/75">
                  {tr(" Find your place ")}
                </p>
                <div className="grid gap-2.5 sm:gap-3">
                  {JOURNEY_DOORS.map((door) => (
                    <Button
                      key={door.id}
                      type="button"
                      variant="ghost"
                      onClick={() => enter(door.id)}
                      className="wepa-journey-door group relative h-auto min-h-[6.25rem] w-full justify-start gap-3 overflow-hidden rounded-lg border border-ivory/45 bg-ivory p-3 text-left text-ivory-foreground shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-coral/70 hover:bg-ivory hover:shadow-2xl focus-visible:ring-coral sm:min-h-[7rem] sm:gap-4 sm:p-4 lg:min-h-[8.25rem]"
                    >
                      <span className="absolute inset-y-0 left-0 w-1 bg-primary transition-colors duration-300 group-hover:bg-coral" />
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-secondary/70 ring-1 ring-primary/25 sm:h-[4.5rem] sm:w-[4.5rem]">
                        <img
                          src={ROLE_ICONS[door.id]}
                          alt={tr(door.audience)}
                          className="h-14 w-14 object-contain transition-transform duration-300 group-hover:scale-105 sm:h-16 sm:w-16"
                        />
                      </span>
                      <span className="min-w-0 flex-1 whitespace-normal pr-1 sm:pr-10">
                        <span className="block text-[0.62rem] font-extrabold uppercase text-accent-deep">
                          {tr(door.audience)}
                        </span>
                        <span className="mt-1 block text-base font-black leading-tight sm:text-lg">
                          {tr(door.title)}
                        </span>
                        <span className="mt-1 hidden text-xs font-normal leading-snug text-ivory-foreground/75 xs:block sm:text-sm">
                          {tr(door.copy)}
                        </span>
                      </span>
                      <span className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-coral/15 text-coral ring-1 ring-coral/35 transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-coral group-hover:text-ivory sm:absolute sm:right-4 sm:ml-0">
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
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
  const { t: tr } = useLanguage();
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-[1440px] flex-wrap items-center gap-2 px-4 py-2 sm:px-6 lg:px-8">
        <img src={logoUrl} alt={tr("WEPA.care")} className="h-11 w-auto object-contain" />
        <div className="hidden h-7 w-px bg-border sm:block" />
        <p className="hidden text-xs font-semibold uppercase text-muted-foreground lg:block">
          {tr("Come for the Island.")}
          <br />
          {tr("Care for its People.")}
        </p>
        <nav
          aria-label={tr("Marketplace sides")}
          className="order-3 mx-auto flex w-full justify-center sm:order-none sm:w-auto items-center gap-1 rounded-full border border-border bg-muted/60 p-1"
        >
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onRole(tab.id)}
              aria-pressed={role === tab.id}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors sm:px-4 sm:text-sm",
                role === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <img
                src={ROLE_ICONS[tab.id]}
                alt={tr("")}
                aria-hidden
                className="h-5 w-5 object-contain sm:h-6 sm:w-6"
              />
              {tr(tab.label)}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1 sm:ml-0">
          <LanguageToggle />
          <Button
            variant="ghost"
            size="icon"
            className="hidden xl:inline-flex"
            aria-label={tr("Notifications")}
          >
            <Bell />
          </Button>
          {tr(
            signedInEmail ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onSignOut}
                className="hidden sm:inline-flex"
              >
                {tr("Sign out")}
              </Button>
            ) : (
              <Button size="sm" onClick={onAuth}>
                {tr("Sign in")}
              </Button>
            ),
          )}
          <Button variant="ghost" size="icon" className="hidden" aria-label={tr("Open menu")}>
            <Menu />
          </Button>
        </div>
      </div>
    </header>
  );
}

function NurseExperience({ onSelectGig }: { onSelectGig: (gig: DemoGig) => void }) {
  const { t: tr } = useLanguage();
  const [specialty, setSpecialty] = useState("All specialties");
  const [region, setRegion] = useState("Anywhere");
  const [showService, setShowService] = useState(false);
  const paid = islandGigs.filter((g) => !g.service);
  const service = islandGigs.filter((g) => g.service);
  const regions = ["Anywhere", ...Array.from(new Set(paid.map((g) => g.region!)))];
  const specialties = ["All specialties", ...Array.from(new Set(paid.map((g) => g.specialty)))];
  const filtered = paid
    .filter(
      (g) =>
        (specialty === "All specialties" || g.specialty === specialty) &&
        (region === "Anywhere" || g.region === region),
    )
    .sort((a, b) => b.match - a.match);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-surface-dark text-surface-dark-foreground">
        <img
          src={coastImage}
          alt={tr("Puerto Rico coast and turquoise Caribbean water")}
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-hero-wash" />
        <div className="mx-auto max-w-[1440px] px-4 pb-12 pt-20 sm:px-6 lg:px-8 lg:pb-16">
          <div>
            <h1 className="max-w-2xl text-4xl font-black leading-[1.02] sm:text-6xl lg:text-7xl">
              {tr("Come for the Island.")}
              <br />
              <span className="text-primary">{tr("Care for its People.")}</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-surface-dark-foreground/85 sm:text-lg">
              {tr(
                "The travel nursing marketplace connecting Puerto Rico’s hospitals, nurses, and tourism partners—bringing care, island stays, and local experiences together.",
              )}
            </p>
            <div className="mt-6 grid max-w-lg grid-cols-3 gap-3">
              <HeroStat value="$1,850" label={tr("weekly, local hospital pay")} />
              <HeroStat value="+$1,400" label={tr("island living covered")} />
              <HeroStat value="100%" label={tr("turnkey arrival")} />
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() =>
                  document.getElementById("gigs")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                {tr("Explore live gigs ")}
                <ArrowRight />
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-surface-dark-foreground/30 bg-surface-dark/30 text-surface-dark-foreground hover:bg-surface-dark-foreground/10 hover:text-surface-dark-foreground"
              >
                <Link to="/ready">{tr("Get Puerto Rico ready")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="formula" className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow">{tr("The WEPA formula")}</p>
          <h2 className="mt-1 text-3xl font-black sm:text-4xl">
            {tr("Free travel, lodging, and fun — instead of high pay.")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {tr(
              "Mainland travel contracts pay big, then quietly take it back in rent, overtime, and burnout. Here you make a little money while you’re here — and the island picks up almost everything else.",
            )}
          </p>
        </div>
        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          <div className="border border-border bg-card">
            <div className="flex items-baseline justify-between border-b border-border bg-muted px-5 py-4">
              <h3 className="text-lg font-black">{tr("The mainland contract")}</h3>
              <span className="text-sm font-bold text-muted-foreground line-through decoration-coral decoration-2">
                {tr("$3,800/wk")}
              </span>
            </div>
            <ul className="space-y-3 p-5">
              <li className="flex items-start gap-3 text-sm">
                <X className="mt-0.5 size-4 shrink-0 text-coral" />
                {tr(" Gouged short-term rent swallows most of the paycheck")}
              </li>
              <li className="flex items-start gap-3 text-sm">
                <X className="mt-0.5 size-4 shrink-0 text-coral" />
                {tr(" Crisis overtime just to break even")}
              </li>
              <li className="flex items-start gap-3 text-sm">
                <X className="mt-0.5 size-4 shrink-0 text-coral" />
                {tr(" Winter shifts in a city you never see")}
              </li>
            </ul>
            <p className="border-t border-border px-5 py-3 text-xs font-bold uppercase text-muted-foreground">
              {tr("Bottom line: a paycheck that disappears")}
            </p>
          </div>
          <div className="border-2 border-primary bg-primary/5">
            <div className="flex items-baseline justify-between border-b border-primary/20 bg-primary px-5 py-4 text-primary-foreground">
              <h3 className="text-lg font-black">{tr("The WEPA island chapter")}</h3>
              <span className="text-sm font-bold">{tr("$1,850/wk + island")}</span>
            </div>
            <ul className="space-y-3 p-5">
              <li className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                {tr(" Honest local pay from Puerto Rico hospitals")}
              </li>
              <li className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                {tr(" Travel, lodging, and food covered by island partners")}
              </li>
              <li className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                {tr(" Bio-bay weekends, surf, and rainforest built into the gig")}
              </li>
            </ul>
            <p className="border-t border-primary/20 bg-primary/10 px-5 py-3 text-xs font-bold uppercase text-primary">
              {tr("Bottom line: you keep the island — and still bank savings")}
            </p>
          </div>
        </div>
      </section>

      <NurseStorySpotlight />

      <PartnerCarousel />


      <section id="gigs" className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">{tr("Live opportunities")}</p>
            <h2 className="mt-1 text-3xl font-black sm:text-4xl">
              {tr("Gigs with more life in them.")}
            </h2>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="relative sm:w-56">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={specialty}
                onChange={(event) => setSpecialty(event.target.value)}
                className="h-11 w-full appearance-none rounded-md border border-input bg-card pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
              >
                {specialties.map((s) => (
                  <option key={s} value={s}>
                    {tr(s)}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative sm:w-52">
              <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                className="h-11 w-full appearance-none rounded-md border border-input bg-card pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
              >
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {tr(r)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {tr(filtered.length)}
          {tr(" gigs at ")}
          {tr(new Set(filtered.map((g) => g.hospital)).size)}
          {tr(" Puerto Rico hospitals")}
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((gig, index) => (
            <GigCard
              key={gig.id}
              gig={gig}
              featured={index === 0}
              onOpen={() => onSelectGig(gig)}
            />
          ))}
        </div>
        <div className="mt-10 border-t border-border pt-6">
          <button
            type="button"
            onClick={() => setShowService((v) => !v)}
            className="text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {tr(showService ? "Hide" : "Also open:")} {tr(service.length)}
            {tr(" unpaid community service gigs in rural and underserved areas ")}
            {tr(showService ? "" : "→")}
          </button>
          {showService && (
            <>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                {tr(
                  "Short, unpaid stays where the reward is the work itself: bringing care and know-how to communities that need it. Faith-based and secular hosts. Lodging, meals and transport are covered.",
                )}
              </p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {service.map((gig) => (
                  <GigCard
                    key={gig.id}
                    gig={gig}
                    featured={false}
                    onOpen={() => onSelectGig(gig)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <MobileNurseNav />
    </>
  );
}

function PartnerCarousel() {
  const { t: tr } = useLanguage();
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollBy(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * Math.min(track.clientWidth * 0.85, 560),
      behavior: "smooth",
    });
  }

  return (
    <section
      id="partners"
      className="overflow-hidden border-y border-border bg-surface-dark py-12 text-surface-dark-foreground"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow text-primary">{tr("The island partners")}</p>
            <h2 className="mt-1 text-3xl font-black sm:text-4xl">
              {tr("Real Puerto Rico, built into every gig.")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-surface-dark-foreground/75">
              {tr(
                "Hotels, sails, spas, and adventures from the island's best travel & tourism names — bundled into your package instead of a bigger paycheck.",
              )}
            </p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <Button
              variant="outline"
              size="icon"
              aria-label={tr("Scroll partners back")}
              className="border-surface-dark-foreground/30 bg-transparent text-surface-dark-foreground hover:bg-surface-dark-foreground/10 hover:text-surface-dark-foreground"
              onClick={() => scrollBy(-1)}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label={tr("Scroll partners forward")}
              className="border-surface-dark-foreground/30 bg-transparent text-surface-dark-foreground hover:bg-surface-dark-foreground/10 hover:text-surface-dark-foreground"
              onClick={() => scrollBy(1)}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>
      <div
        ref={trackRef}
        className="mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {demoPartners.map((partner) => (
          <PartnerCard key={partner.name} partner={partner} />
        ))}
      </div>
    </section>
  );
}

function PartnerCard({ partner }: { partner: DemoPartner }) {
  const { t: tr } = useLanguage();
  return (
    <article className="group relative flex h-96 w-72 shrink-0 snap-start flex-col justify-end overflow-hidden border border-surface-dark-foreground/15 sm:w-80">
      <img
        src={partner.image}
        alt={tr(partner.name)}
        loading="lazy"
        width={1024}
        height={768}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-surface-dark/35 to-transparent" />
      <div className="absolute left-4 top-4 flex items-center gap-2">
        <span className="bg-primary px-2 py-1 text-[10px] font-black uppercase text-primary-foreground">
          {tr(partner.category)}
        </span>
        <span className="flex items-center gap-1 bg-surface-dark/60 px-2 py-1 text-[10px] font-bold uppercase text-surface-dark-foreground backdrop-blur">
          <MapPin className="size-3" /> {tr(partner.location)}
        </span>
      </div>
      <div className="relative p-5">
        <h3 className="text-2xl font-black leading-tight text-surface-dark-foreground">
          {tr(partner.name)}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-surface-dark-foreground/80">
          {tr(partner.blurb)}
        </p>
        <p className="mt-3 flex items-start gap-2 border-t border-surface-dark-foreground/25 pt-3 text-sm font-bold text-primary">
          <Sparkles className="mt-0.5 size-4 shrink-0" /> {tr(partner.perk)}
        </p>
      </div>
    </article>
  );
}

function GigCard({
  gig,
  featured,
  onOpen,
}: {
  gig: DemoGig;
  featured: boolean;
  onOpen: () => void;
}) {
  const { t: tr } = useLanguage();
  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden border bg-card transition-all hover:-translate-y-1 hover:shadow-xl",
        featured ? "border-primary" : "border-border",
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {gig.image && (
          <img
            src={gig.image}
            alt={tr(gig.hospital)}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-surface-dark/30 to-transparent" />
        <span
          className={cn(
            "absolute left-3 top-3 px-2 py-1 text-[11px] font-bold uppercase",
            gig.service
              ? "bg-card text-foreground"
              : featured
                ? "bg-primary text-primary-foreground"
                : "bg-card/90 text-foreground",
          )}
        >
          {tr(
            gig.service
              ? "Community service · unpaid"
              : featured
                ? `Top match · ${gig.match}%`
                : `${gig.match}% fit`,
          )}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-4 text-surface-dark-foreground">
          <p className="flex items-center gap-1 text-xs font-semibold opacity-90">
            <MapPin className="size-3.5" /> {tr(gig.city)} · {tr(gig.region)}
          </p>
          <p className="mt-0.5 text-lg font-black leading-tight">{tr(gig.hospital)}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-extrabold leading-tight">{tr(gig.title)}</h3>
        {gig.hospitalPitch && (
          <p className="mt-2 text-sm text-muted-foreground">{tr(gig.hospitalPitch)}</p>
        )}
        {gig.area && (
          <p className="mt-3 border-l-2 border-coral pl-3 text-sm font-medium">{tr(gig.area)}</p>
        )}
        {gig.areaHighlights && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {gig.areaHighlights.map((h) => (
              <span key={h} className="bg-muted px-2 py-0.5 text-[11px] font-semibold">
                {tr(h)}
              </span>
            ))}
          </div>
        )}
        <div className="my-4 grid grid-cols-3 border-y border-border py-3 text-center">
          <div>
            <strong className="block text-base">
              {tr(gig.service ? "Unpaid" : `$${netPay(gig.pay).toLocaleString()}`)}
            </strong>
            <span className="text-[10px] uppercase text-muted-foreground">
              {tr(gig.service ? "service" : "take-home / wk")}
            </span>
          </div>
          <div className="border-x border-border">
            <strong className="block text-base">{tr(gig.duration)}</strong>
            <span className="text-[10px] uppercase text-muted-foreground">{tr("weeks")}</span>
          </div>
          <div>
            <strong className="block text-base">{tr(gig.start)}</strong>
            <span className="text-[10px] uppercase text-muted-foreground">{tr("starts")}</span>
          </div>
        </div>
        <p className="text-[11px] font-bold uppercase text-muted-foreground">
          {tr(gig.service ? "Covered for you" : "Your island package")}
        </p>
        <ul className="mt-2 space-y-1.5">
          {gig.benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="size-4 text-primary" /> {tr(benefit)}
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-5">
          <Button className="w-full" variant={featured ? "default" : "outline"} onClick={onOpen}>
            {tr("See the full gig ")}
            <ArrowRight />
          </Button>
        </div>
        {gig.photoCredit && (
          <p className="mt-2 text-[10px] text-muted-foreground">
            {tr("Photo: ")}
            {tr(gig.photoCredit)}
          </p>
        )}
      </div>
    </article>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  const { t: tr } = useLanguage();
  return (
    <div className="border border-surface-dark-foreground/20 bg-surface-dark/50 px-3 py-3 backdrop-blur">
      <strong className="block text-lg font-black text-primary sm:text-xl">{tr(value)}</strong>
      <span className="mt-0.5 block text-[11px] leading-tight text-surface-dark-foreground/70">
        {tr(label)}
      </span>
    </div>
  );
}

function GigDialog({
  gig,
  onClose,
}: {
  gig: DemoGig | null;
  onClose: () => void;
}) {
  const { t: tr } = useLanguage();
  const [applied, setApplied] = useState(false);
  useEffect(() => setApplied(false), [gig?.id]);
  if (!gig) return null;
  return (
    <Dialog open={Boolean(gig)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        {gig.image && (
          <img
            src={gig.image}
            alt={tr(gig.hospital)}
            className="-mx-6 -mt-6 aspect-[16/7] w-[calc(100%+3rem)] max-w-none object-cover"
          />
        )}
        <DialogHeader>
          <p className="eyebrow">
            {tr(gig.service ? "Community service · unpaid" : `${gig.match}% match`)} ·{" "}
            {tr(gig.city)}
          </p>
          <DialogTitle className="text-3xl font-black">{tr(gig.title)}</DialogTitle>
          <DialogDescription>
            {tr(gig.hospital)} · {tr(gig.specialty)}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 border-y border-border py-4 text-center">
          <div>
            <strong className="text-xl">
              {tr(gig.service ? "Unpaid" : `$${netPay(gig.pay).toLocaleString()}`)}
            </strong>
            <span className="block text-xs text-muted-foreground">
              {tr(gig.service ? "service" : "take-home per week")}
            </span>
          </div>
          <div className="border-x border-border">
            <strong className="text-xl">{tr(gig.duration)}</strong>
            <span className="block text-xs text-muted-foreground">{tr("weeks")}</span>
          </div>
          <div>
            <strong className="text-xl">{tr(gig.start)}</strong>
            <span className="block text-xs text-muted-foreground">{tr("start")}</span>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{tr(gig.description)}</p>
        {gig.hospitalPitch && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="border border-border p-4">
              <p className="text-xs font-bold uppercase text-muted-foreground">
                {tr("The hospital")}
              </p>
              <p className="mt-1 text-sm">{tr(gig.hospitalPitch)}</p>
            </div>
            <div className="border border-border p-4">
              <p className="text-xs font-bold uppercase text-muted-foreground">
                {tr("Life in ")}
                {tr(gig.city)}
              </p>
              <p className="mt-1 text-sm">{tr(gig.area)}</p>
            </div>
          </div>
        )}
        {gig.serviceFocus && <p className="text-sm font-semibold">{tr(gig.serviceFocus)}</p>}
        <div className="bg-primary/8 p-5">
          <p className="text-xs font-bold uppercase text-primary">{tr("Built into this gig")}</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {gig.benefits.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="size-4 text-primary" /> {tr(item)}
              </li>
            ))}
          </ul>
        </div>
        {tr(
          applied ? (
            <div className="flex items-center gap-3 bg-primary p-4 text-primary-foreground">
              <CheckCircle2 />
              <div>
                <strong className="block">{tr("Application sent")}</strong>
                <span className="text-sm text-primary-foreground/75">
                  {tr("The hospital can now review your Puerto Rico readiness.")}
                </span>
              </div>
            </div>
          ) : (
            <Button
              size="lg"
              className="w-full"
              onClick={() => {
                // Demo nurse profile applies without a real account.
                setApplied(true);
                toast.success(tr("Application sent to the hospital."));
              }}
            >
              {tr("Apply to this gig ")}
              <ArrowRight />
            </Button>
          ),
        )}
      </DialogContent>
    </Dialog>
  );
}

function AuthDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t: tr } = useLanguage();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: email.split("@")[0] } },
          });
    setBusy(false);
    if (result.error) {
      toast.error(tr(result.error.message));
      return;
    }
    if (mode === "signup" && !result.data.session)
      toast.success(tr("Check your email to confirm your WEPA.care account."));
    else {
      toast.success(tr("Welcome to WEPA.care."));
      onOpenChange(false);
    }
  }

  async function google() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    setBusy(false);
    if (result.error) toast.error(tr(result.error.message));
    else if (!result.redirected) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">
            {tr(mode === "signin" ? "Welcome back." : "Start your Puerto Rico journey.")}
          </DialogTitle>
          <DialogDescription>
            {tr("One account. Your role and workspace follow you.")}
          </DialogDescription>
        </DialogHeader>
        <Button variant="outline" className="w-full" disabled={busy} onClick={() => void google()}>
          <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
            <path
              fill="currentColor"
              d="M21.35 11.1h-9.17v2.98h5.26c-.23 1.5-1.73 4.4-5.26 4.4A6.48 6.48 0 1 1 12.18 5c2.01 0 3.36.86 4.13 1.6l2.82-2.73A10.3 10.3 0 0 0 12.18 1.2a10.8 10.8 0 1 0 0 21.6c6.23 0 10.36-4.38 10.36-10.54 0-.7-.08-1.23-.17-1.76z"
            />
          </svg>
          {tr("Continue with Google")}
        </Button>
        <div className="flex items-center gap-3 text-xs uppercase text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          {tr(" or ")}
          <span className="h-px flex-1 bg-border" />
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Field label={tr("Email")}>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label={tr("Password")}>
            <Input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Button type="submit" className="w-full" disabled={busy}>
            {tr(busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create account")}
          </Button>
        </form>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {tr(
            mode === "signin"
              ? "New to WEPA.care? Create an account"
              : "Already have an account? Sign in",
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  const { t: tr } = useLanguage();
  return (
    <Label className="flex flex-col gap-1.5">
      <span>{tr(label)}</span>
      {tr(children)}
    </Label>
  );
}

function MobileNurseNav() {
  const { t: tr } = useLanguage();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-card/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
      <Button
        variant="ghost"
        className="h-auto flex-col gap-1 text-[10px] text-primary"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <HeartPulse />
        {tr(" Home")}
      </Button>
      <Button
        variant="ghost"
        className="h-auto flex-col gap-1 text-[10px]"
        onClick={() => document.getElementById("gigs")?.scrollIntoView({ behavior: "smooth" })}
      >
        <Search />
        {tr(" Gigs")}
      </Button>
      <Button asChild variant="ghost" className="h-auto flex-col gap-1 text-[10px]">
        <Link to="/ready" search={{ section: "community" }}>
          <MessageCircle />
          {tr(" Community")}
        </Link>
      </Button>
      <Button asChild variant="ghost" className="h-auto flex-col gap-1 text-[10px]">
        <Link to="/ready">
          <ClipboardCheck />
          {tr(" Ready")}
        </Link>
      </Button>
      <Button asChild variant="ghost" className="h-auto flex-col gap-1 text-[10px]">
        <Link to="/ready">
          <FileCheck2 />
          {tr(" Passport")}
        </Link>
      </Button>
    </nav>
  );
}

function HospitalCandidate() {
  const { t: tr } = useLanguage();
  const { state, update } = useReadiness();
  if (!state.applied) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
        {tr(
          "No Candidate Passports in the gig pool yet. When Elena finishes her Readiness Passport and joins the pool, she appears here as a match.",
        )}
      </div>
    );
  }
  const idx = STAGES.indexOf(state.stage);
  const next = STAGES[idx + 1];
  const blocked = next === "Cleared to start" && state.officialAuthorization !== "Issued";
  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
      <CandidatePassport state={state} />
      <div className="rounded-3xl border border-border bg-card p-4">
        <p className="font-display text-lg font-bold">{tr("Application stage")}</p>
        <ol className="mt-3 space-y-1.5 text-sm">
          {STAGES.map((s, i) => (
            <li
              key={s}
              className={cn(
                "flex items-center gap-2",
                i <= idx ? "font-semibold" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "size-2.5 rounded-full",
                  i < idx ? "bg-primary" : i === idx ? "bg-coral" : "bg-border",
                )}
              />
              {tr(s)}
            </li>
          ))}
        </ol>
        {next && (
          <Button
            className="mt-4 w-full"
            disabled={blocked}
            onClick={() => {
              update((s) => ({ ...s, stage: next }));
              toast.success(tr(`Elena advanced to ${next}.`));
            }}
          >
            {tr("Advance to ")}
            {tr(next)}
          </Button>
        )}
        {blocked && (
          <p className="mt-2 text-xs text-muted-foreground">
            {tr(
              "Official authorization pending — “Cleared to start” unlocks only once Puerto Rico issues authorization.",
            )}
          </p>
        )}
        {next && idx < 2 && (
          <p className="mt-2 text-xs text-muted-foreground">
            {tr("You can move to Clinical review while Puerto Rico authorization is pending.")}
          </p>
        )}
      </div>
    </div>
  );
}
