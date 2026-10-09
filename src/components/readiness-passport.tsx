import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Bot, CheckCircle2, Circle, Download, FileText, Languages, Loader2, Paperclip, Pencil, RefreshCw, Send, ShieldCheck, Upload } from "lucide-react";
import nurseIconAsset from "@/assets/wepa-nurse.png.asset.json";
import logoAsset from "@/assets/wepa-care-logo.asset.json";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { INTEREST_OPTIONS, interestsComplete, nextBestAction, pathwayComplete, pathwayResult, preparationProgress, streamGuide, useReadiness, type ChecklistItem, type ItemStatus, type NurseProfile, type Pathway, type ReadinessState } from "@/lib/readiness";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

const DISCLAIMER = "WEPA provides preparation and process guidance. Only the appropriate Puerto Rico licensing authority can determine eligibility or authorize practice.";
const TABS = [
  { id: "overview", label: "Overview" },
  { id: "pathway", label: "Pathway" },
  { id: "checklist", label: "Checklist" },
  { id: "spanish", label: "Spanish" },
  { id: "interests", label: "Interests" },
  { id: "hospital", label: "Credentials" },
  { id: "passport", label: "Passport" },
] as const;
type Tab = (typeof TABS)[number]["id"];

const statusTone: Record<ItemStatus, string> = {
  Missing: "bg-coral/15 text-coral",
  "Action needed": "bg-coral/15 text-coral",
  "Ready for review": "bg-primary/15 text-accent-strong",
  "Nurse confirmed": "bg-secondary text-secondary-foreground",
  "Submitted — self-reported": "bg-surface-dark text-surface-dark-foreground",
  "Official review": "bg-muted text-foreground",
  Accepted: "bg-surface-dark text-surface-dark-foreground",
  Expired: "bg-destructive/15 text-destructive",
  "Manual review": "bg-muted text-foreground",
};

function guideContext(s: ReadinessState) {
  return { profile: s.profile, goal: "Get ready for all WEPA Puerto Rico gigs, then match by interests", interests: s.interests, pathway: s.pathway, checklist: s.checklist.map(({ title, status, source, expires }) => ({ title, status, source, expires })) };
}

export function ReadinessPassport() {
  const { state, update, reset } = useReadiness();
  const [tab, setTab] = useState<Tab>("overview");
  const [guide, setGuide] = useState({ text: "", busy: false, error: "" });
  const [editProfile, setEditProfile] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const progress = preparationProgress(state);
  const remaining = state.checklist.filter((c) => !["Nurse confirmed", "Submitted — self-reported", "Accepted"].includes(c.status));
  const tracks = [
    { label: "Puerto Rico authorization", value: Math.round((state.checklist.length - remaining.length) / state.checklist.length * 100), note: `Official authorization ${state.officialAuthorization.toLowerCase()}` },
    { label: "Hospital credentialing", value: Math.round(state.credentialing.filter((c) => c.done).length / state.credentialing.length * 100), note: "Common across PR partner hospitals" },
    { label: "Gig matching interests", value: interestsComplete(state.interests) ? 100 : 0, note: interestsComplete(state.interests) ? `${state.interests.regions.length} regions · ${state.interests.experiences.length} experiences` : "Tell us what island life you want" },
    { label: "Clinical Spanish readiness", value: state.spanish ? 100 : 0, note: state.spanish ?? "Scenario not started" },
  ];
  const nextAction = nextBestAction(state);
  const pathwayDone = pathwayComplete(state.pathway);
  const stepDone: Partial<Record<Tab, boolean>> = {
    pathway: pathwayDone,
    checklist: state.packetConfirmed,
    spanish: !!state.spanish,
    interests: interestsComplete(state.interests),
    hospital: state.credentialing.every((c) => c.done),
    passport: !!state.applied,
  };
  const actionTab: Tab = !pathwayDone ? "pathway"
    : !state.packetConfirmed || state.checklist.find((c) => c.id === "declaration")?.status !== "Submitted — self-reported" ? "checklist"
    : !state.spanish ? "spanish"
    : !interestsComplete(state.interests) ? "interests" : "passport";

  async function ask(task: string, detail = "", onDone?: (t: string) => void) {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setGuide({ text: "", busy: true, error: "" });
    try {
      const text = await streamGuide(task, guideContext(state), (t) => setGuide((g) => ({ ...g, text: t })), detail, ctrl.signal);
      onDone?.(text);
      setGuide((g) => ({ ...g, busy: false }));
    } catch (e) {
      if (ctrl.signal.aborted) return setGuide((g) => ({ ...g, busy: false }));
      setGuide((g) => ({ ...g, busy: false, error: e instanceof Error ? e.message : "Something went wrong." }));
    }
  }

  function preparePacket() {
    if (!pathwayComplete(state.pathway)) {
      toast.info("First answer the pathway questions — your document list depends on your authorization route.");
      setTab("pathway");
      return;
    }
    update((s) => ({
      ...s,
      packetPrepared: true,
      checklist: s.checklist.map((c) => {
        if (["standing", "discipline"].includes(c.id)) return { ...c, source: c.id === "standing" ? "Nursys verification — candidate-reported" : "Florida Board certification — candidate-reported", next: "Confirm" };
        if (c.id === "liability") return { ...c, status: "Ready for review", source: "Employer coverage — provided by your matched hospital", next: "Confirm" };
        if (c.id === "background") return { ...c, status: "Ready for review", source: "Authorization pre-filled from profile", next: "Confirm and sign" };
        if (c.id === "fee") return { ...c, status: "Ready for review", source: "$100 — pay at submission", next: "Confirm" };
        if (c.id === "reviewed") return { ...c, status: "Ready for review", source: "Packet prepared by Wepa Guide", next: "Review screen" };
        if (c.id === "declaration") return { ...c, status: "Action needed", next: "Draft with Wepa Guide, then notarize" };
        return c;
      }),
    }));
    setTab("checklist");
    ask("packet");
  }

  function confirmPacket() {
    update((s) => ({
      ...s,
      packetConfirmed: true,
      checklist: s.checklist.map((c) => c.status === "Ready for review" ? { ...c, status: "Nurse confirmed", next: "None" } : c),
    }));
    toast.success("Confirmed. Preparation progress is now 92%.");
  }

  function setItem(id: string, patch: Partial<ChecklistItem>) {
    update((s) => ({ ...s, checklist: s.checklist.map((c) => c.id === id ? { ...c, ...patch } : c) }));
  }

  function apply() {
    update((s) => ({ ...s, applied: new Date().toISOString(), stage: "Readiness review" }));
    toast.success("You're in the gig pool. Matching Puerto Rico hospitals can now see your Passport.");
    setTab("passport");
  }

  return (
    <div className="min-h-dvh bg-background pb-32 lg:pb-12">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Button asChild variant="ghost" size="icon" aria-label="Back to WEPA.care"><Link to="/"><ArrowLeft /></Link></Button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-bold leading-tight">Puerto Rico Readiness Passport</p>
            <p className="truncate text-xs text-muted-foreground">{state.profile.name} · {state.profile.specialty}</p>
          </div>
          <span className="rounded-full bg-surface-dark px-3 py-1 text-sm font-bold text-surface-dark-foreground">{progress}%</span>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={cn("flex shrink-0 items-center gap-1 rounded-full px-4 py-1.5 text-sm font-semibold transition", tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
              {t.label}{stepDone[t.id] && <CheckCircle2 className="size-3.5" aria-label="Done" />}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-4">
          {tab === "overview" && (
            <>
              <section className="overflow-hidden rounded-3xl bg-surface-dark p-6 text-surface-dark-foreground">
                <p className="text-sm opacity-75">Preparation progress</p>
                <p className="font-display text-6xl font-black">{progress}%</p>
                <Progress value={progress} className="mt-3 h-2" />
                <p className="mt-4 text-sm opacity-75">Current phase</p>
                <p className="font-semibold">{state.applied ? "Matching with gigs" : !pathwayDone ? "Pathway check" : state.packetConfirmed ? "Final documents & Spanish" : "Packet preparation"}</p>
                <button onClick={() => setTab(actionTab)} className="mt-4 block w-full rounded-2xl bg-background/10 p-4 text-left transition hover:bg-background/20">
                  <p className="text-xs uppercase tracking-wide opacity-70">Next best action</p>
                  <p className="mt-1 font-semibold">{nextAction} →</p>
                </button>
                {!pathwayDone && <Button onClick={() => setTab("pathway")} className="mt-4 w-full bg-coral text-coral-foreground hover:bg-coral/90" size="lg">Start with the pathway questions</Button>}
                {pathwayDone && !state.packetPrepared && <Button onClick={preparePacket} className="mt-4 w-full bg-coral text-coral-foreground hover:bg-coral/90" size="lg"><Bot /> Prepare my packet</Button>}
                {pathwayDone && state.packetPrepared && !state.packetConfirmed && <Button onClick={() => setTab("checklist")} className="mt-4 w-full bg-coral text-coral-foreground hover:bg-coral/90" size="lg">Ready for nurse review</Button>}
              </section>
              <section className="rounded-3xl border border-border bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your goal</p>
                <p className="mt-1 font-display text-xl font-bold">Get ready once. Match with every gig.</p>
                <p className="mt-1 text-sm text-muted-foreground">Finish your Puerto Rico readiness and interests, join the WEPA gig pool, and we match you with hospital gigs and island packages that fit how you want to live.</p>
              </section>
              <section className="grid gap-3 sm:grid-cols-2">
                {tracks.map((t, i) => (
                  <div key={t.label} className="rounded-2xl border border-border bg-card p-4">
                    <p className="text-xs font-bold text-muted-foreground">{"ABCD"[i]}. {t.label}</p>
                    <p className="mt-2 font-display text-3xl font-black">{t.value}%</p>
                    <Progress value={t.value} className="mt-2 h-1.5" />
                    <p className="mt-2 text-xs text-muted-foreground">{t.note}</p>
                  </div>
                ))}
              </section>
              <button onClick={reset} className="text-xs text-muted-foreground underline">Reset demo</button>
            </>
          )}

          {tab === "pathway" && <PathwayCheck pathway={state.pathway} onChange={(p) => update((s) => ({ ...s, pathway: p }))} onContinue={() => setTab("checklist")} />}

          {tab === "checklist" && (
            <>
              {state.packetPrepared && !state.packetConfirmed && (
                <section className="rounded-3xl border-2 border-primary bg-card p-5">
                  <p className="font-display text-xl font-bold">Ready for nurse review</p>
                  <p className="mt-1 text-sm text-muted-foreground">Wepa Guide prepared these answers from your profile. Nothing is submitted until you confirm.</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => setEditProfile(true)}><Pencil /> Edit profile</Button>
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    {[["Name", state.profile.name], ["License", state.profile.license], ["Issued", state.profile.licenseIssued], ["Expires", state.profile.licenseExpires], ["Category", state.pathway.category], ["Certifications", state.profile.certs.join(", ")]].map(([k, v]) => (
                      <div key={k} className="rounded-xl bg-muted p-3"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-semibold">{v}</dd></div>
                    ))}
                  </dl>
                  <p className="mt-3 rounded-xl bg-coral/10 p-3 text-sm"><strong>Still missing:</strong> notarized sworn declaration — draft it below, then sign before a notary.</p>
                  <Button onClick={confirmPacket} size="lg" className="mt-4 w-full"><CheckCircle2 /> I confirm this information is accurate</Button>
                </section>
              )}
              {state.checklist.map((item) => (
                <ChecklistCard key={item.id} item={item} state={state}
                  onExplain={() => ask("explain", item.title)}
                  onDraft={() => ask("draft", "", (t) => update((s) => ({ ...s, declarationDraft: t })))}
                  onDraftChange={(t) => update((s) => ({ ...s, declarationDraft: t }))}
                  onSet={(p) => setItem(item.id, p)} />
              ))}
              <p className="text-xs text-muted-foreground">{DISCLAIMER}</p>
              <ContinueButton label="Continue to the Spanish check" onClick={() => setTab("spanish")} />
            </>
          )}

          {tab === "spanish" && (
            <>
              <SpanishScenario result={state.spanish} onResult={(r) => update((s) => ({ ...s, spanish: r }))} />
              <ContinueButton label="Continue to your interests" onClick={() => setTab("interests")} />
            </>
          )}

          {tab === "interests" && (
            <>
              <InterestsPicker interests={state.interests} onChange={(i) => update((s) => ({ ...s, interests: i }))} />
              <ContinueButton label="Continue to hospital credentials" onClick={() => setTab("hospital")} />
            </>
          )}

          {tab === "hospital" && (
            <section className="rounded-3xl border border-border bg-card p-5">
              <p className="font-display text-xl font-bold">Common hospital credentials</p>
              <p className="mt-1 text-sm text-muted-foreground">What most Puerto Rico partner hospitals ask for. Each hospital may add its own items once you match — these are not Puerto Rico licensing requirements.</p>
              <ul className="mt-4 space-y-2">
                {state.credentialing.map((c) => (
                  <li key={c.id}>
                    <button onClick={() => update((s) => ({ ...s, credentialing: s.credentialing.map((x) => x.id === c.id ? { ...x, done: !x.done } : x) }))} className="flex w-full items-center gap-3 rounded-xl bg-muted p-3 text-left text-sm font-medium">
                      {c.done ? <CheckCircle2 className="size-5 text-accent-strong" /> : <Circle className="size-5 text-muted-foreground" />}{c.title}
                      <span className="ml-auto text-xs text-muted-foreground">{c.done ? "Candidate-reported" : "To do"}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <ContinueButton label="Review your Candidate Passport" onClick={() => setTab("passport")} />
            </section>
          )}

          {tab === "passport" && (
            <section className="space-y-4">
              <CandidatePassport state={state} />
              {!state.applied ? (
                <Button size="lg" className="w-full bg-coral text-coral-foreground hover:bg-coral/90" onClick={apply}><Send /> Join the gig pool & start matching</Button>
              ) : <p className="rounded-xl bg-muted p-3 text-sm">In the WEPA gig pool · Matching by your interests · Stage: <strong>{state.stage}</strong></p>}
            </section>
          )}
        </div>

        <GuidePanel guide={guide} onAsk={ask} onPrepare={state.packetPrepared || !pathwayDone ? undefined : preparePacket} onStop={() => abortRef.current?.abort()} />
      </main>

      <ProfileDialog open={editProfile} onOpenChange={setEditProfile} profile={state.profile} onSave={(p) => { update((s) => ({ ...s, profile: p })); setEditProfile(false); toast.success("Profile updated everywhere — passport, checklist and Wepa Guide."); }} />
    </div>
  );
}

function ProfileDialog({ open, onOpenChange, profile, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; profile: NurseProfile; onSave: (p: NurseProfile) => void }) {
  const [draft, setDraft] = useState(profile);
  useEffect(() => { if (open) setDraft(profile); }, [open, profile]);
  const set = (k: keyof NurseProfile, v: string) => setDraft((d) => ({ ...d, [k]: k === "years" ? Math.max(0, Number(v) || 0) : k === "certs" ? v.split(",").map((c) => c.trim()).filter(Boolean) : v }));
  const fields: [keyof NurseProfile, string, string?][] = [
    ["name", "Full name"], ["city", "Home city & state"], ["specialty", "Specialty"], ["years", "Years of experience", "number"],
    ["license", "Home-state license"], ["licenseIssued", "License issued", "date"], ["licenseExpires", "License expires", "date"],
    ["certs", "Certifications (comma-separated)"], ["availability", "Availability"], ["spanish", "Spanish level"], ["travelingWith", "Traveling with"], ["email", "Email", "email"],
  ];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
        <DialogTitle>Edit your profile</DialogTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {fields.map(([k, label, type]) => (
            <label key={k} className={cn("text-xs font-semibold", (k === "license" || k === "certs" || k === "availability") && "sm:col-span-2")}>
              {label}
              <Input type={type ?? "text"} value={k === "certs" ? draft.certs.join(", ") : String(draft[k])} onChange={(e) => set(k, e.target.value)} className="mt-1" />
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onSave(draft)}>Save profile</Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ContinueButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return <Button size="lg" className="w-full bg-coral text-coral-foreground hover:bg-coral/90" onClick={onClick} disabled={disabled}>{label}</Button>;
}

function PathwayCheck({ pathway, onChange, onContinue }: { pathway: Pathway; onChange: (p: Pathway) => void; onContinue: () => void }) {
  const qs: [keyof Pathway, string][] = [
    ["active", "Do you hold an active license from a U.S. state or jurisdiction?"],
    ["oneYear", "Have you held it for at least one year?"],
    ["continuous", "Have you practiced continuously for the last three years?"],
    ["inactive", "Have you been inactive for more than one year?"],
    ["goodStanding", "Is the license in good standing?"],
    ["pending", "Do you have any pending disciplinary investigations?"],
    ["revoked", "Has a license ever been revoked or surrendered?"],
  ];
  const complete = pathwayComplete(pathway);
  const result = pathwayResult(pathway);
  return (
    <section className="space-y-3">
      <div className="rounded-3xl bg-surface-dark p-5 text-surface-dark-foreground">
        <p className="text-sm opacity-75">Step 1 · Your authorization route</p>
        <p className="font-display text-2xl font-bold">{complete ? result : "Answer the questions below to see your route"}</p>
        <p className="mt-2 text-xs opacity-75">{DISCLAIMER}</p>
      </div>
      {qs.map(([k, q]) => (
        <div key={k} className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-medium">{q}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[true, false].map((v) => (
              <button key={String(v)} onClick={() => onChange({ ...pathway, [k]: v })} className={cn("rounded-xl border py-2 text-sm font-semibold", pathway[k] === v ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{v ? "Yes" : "No"}</button>
            ))}
          </div>
        </div>
      ))}
      <label className="block rounded-2xl border border-border bg-card p-4 text-sm font-medium">What license category and specialty do you hold?
        <input value={pathway.category} onChange={(e) => onChange({ ...pathway, category: e.target.value })} className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2" placeholder="e.g. RN — Emergency" />
      </label>
      <ContinueButton label={complete ? "Continue to your checklist" : "Answer all questions to continue"} onClick={onContinue} disabled={!complete} />
    </section>
  );
}

async function readUpload(f: File): Promise<{ fileData?: string; fileType: string }> {
  const asDataUrl = (b: Blob) => new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(b); });
  if (f.type.startsWith("image/") && f.type !== "image/svg+xml") {
    const url = URL.createObjectURL(f);
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
    const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
    c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(url);
    return { fileData: c.toDataURL("image/jpeg", 0.8), fileType: "image/jpeg" };
  }
  if (f.size > 2_000_000) return { fileType: f.type };
  return { fileData: await asDataUrl(f), fileType: f.type };
}

function ChecklistCard({ item, state, onExplain, onDraft, onDraftChange, onSet }: {
  item: ChecklistItem; state: ReadinessState; onExplain: () => void; onDraft: () => void; onDraftChange: (t: string) => void; onSet: (p: Partial<ChecklistItem>) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ source: item.source, expires: item.expires ?? "", next: item.next });
  const isDecl = item.id === "declaration";
  const isImage = item.fileType?.startsWith("image/");
  function download() {
    const blob = new Blob([state.declarationDraft], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "declaracion-jurada-borrador.txt";
    a.click();
  }
  function saveEdit() {
    onSet({ source: draft.source.trim() || item.source, expires: draft.expires, next: draft.next.trim() || "None" });
    setEditing(false);
    toast.success("Saved.");
  }
  return (
    <article className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        {item.file ? (
          <button type="button" onClick={() => setPreview(true)} aria-label={`View ${item.file}`} className="group relative size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-secondary">
            {isImage && item.fileData ? <img src={item.fileData} alt="" className="size-full object-cover transition-transform group-hover:scale-110" /> : <FileText className="m-auto size-7 text-accent-strong" />}
          </button>
        ) : <FileText className="mt-0.5 size-5 shrink-0 text-accent-strong" />}
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{item.title}</p>
          <p className="text-xs text-muted-foreground">Source: {item.source}{item.expires ? ` · Expires ${item.expires}` : ""}</p>
          {item.next !== "None" && <p className="mt-1 text-xs"><strong>Next:</strong> {item.next}</p>}
          {item.file && <p className="mt-1 flex items-center gap-1 truncate text-xs"><Paperclip className="size-3 shrink-0" /> {item.file}</p>}
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold", statusTone[item.status])}>{item.status}</span>
      </div>
      {editing && (
        <div className="mt-3 grid gap-2 rounded-xl bg-secondary/50 p-3 sm:grid-cols-3">
          <label className="text-xs font-semibold">Source<Input value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })} className="mt-1" /></label>
          <label className="text-xs font-semibold">Expires<Input type="date" value={draft.expires} onChange={(e) => setDraft({ ...draft, expires: e.target.value })} className="mt-1" /></label>
          <label className="text-xs font-semibold">Next step<Input value={draft.next} onChange={(e) => setDraft({ ...draft, next: e.target.value })} className="mt-1" /></label>
          <div className="flex gap-2 sm:col-span-3">
            <Button size="sm" onClick={saveEdit}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      )}
      <details className="mt-2 text-sm text-muted-foreground"><summary className="cursor-pointer text-xs font-semibold">What is this?</summary><p className="mt-1">{item.help}</p></details>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={onExplain}><Bot /> Explain</Button>
        {!editing && <Button size="sm" variant="outline" onClick={() => { setDraft({ source: item.source, expires: item.expires ?? "", next: item.next }); setEditing(true); }}><Pencil /> Edit</Button>}
        {isDecl && <Button size="sm" onClick={onDraft}><FileText /> {state.declarationDraft ? "Redraft" : "Draft with Wepa Guide"}</Button>}
        {(!isDecl || state.declarationDraft || item.file) && (
          <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
            {item.file ? <><RefreshCw /> Replace</> : <><Upload /> {isDecl ? "Attach notarized copy" : "Upload"}</>}
          </Button>
        )}
        <input ref={fileRef} type="file" className="hidden" accept=".pdf,image/*" onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          try {
            const data = await readUpload(f);
            const base = { file: f.name, ...data };
            onSet(isDecl ? { ...base, status: "Submitted — self-reported", source: "Notarized copy — candidate-reported", next: "None" } : { ...base, status: "Ready for review", next: "Confirm the new document" });
            toast.success(`${f.name} ${item.file ? "replaced" : "uploaded"} — kept on this device.`);
          } catch { toast.error("Couldn't read that file. Try a JPG, PNG or PDF."); }
        }} />
        {item.status === "Ready for review" && item.file && <Button size="sm" onClick={() => onSet({ status: "Nurse confirmed", next: "None" })}><CheckCircle2 /> Confirm</Button>}
      </div>
      {isDecl && state.declarationDraft && (
        <div className="mt-3 space-y-2">
          <Textarea value={state.declarationDraft} onChange={(e) => onDraftChange(e.target.value)} rows={10} className="font-mono text-xs" />
          <Button size="sm" variant="ghost" onClick={download}><Download /> Download draft to print for the notary</Button>
        </div>
      )}
      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>{item.title}</DialogTitle>
          {item.fileData ? (isImage
            ? <img src={item.fileData} alt={item.title} className="max-h-[70vh] w-full rounded-xl object-contain" />
            : <iframe src={item.fileData} title={item.title} className="h-[70vh] w-full rounded-xl border border-border" />)
            : <p className="text-sm text-muted-foreground">{item.file} is too large to preview here, but it is attached.</p>}
          <div className="flex gap-2">
            <Button onClick={() => { setPreview(false); fileRef.current?.click(); }}><RefreshCw /> Replace</Button>
            <Button variant="ghost" onClick={() => setPreview(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </article>
  );
}

const SCENARIO = [
  { q: "El paciente dice: “Me duele mucho el pecho, como una presión.” What is the patient describing?", options: ["Strong chest pain, like pressure", "Mild stomach ache", "A headache since yesterday"], correct: 0, why: "“Me duele mucho el pecho” = “My chest hurts a lot”; “como una presión” = “like pressure” — a classic cardiac complaint." },
  { q: "To confirm a medication allergy, which question do you ask?", options: ["¿Tiene alergia a algún medicamento?", "¿Dónde vive usted?", "¿Tiene hambre?"], correct: 0, why: "“¿Tiene alergia a algún medicamento?” = “Are you allergic to any medication?” The others ask where they live and if they're hungry." },
  { q: "The patient's family begins describing a complex history quickly in Spanish before consent for a procedure. What do you do?", options: ["Continue with my conversational Spanish", "Escalate to a bilingual clinician or certified interpreter", "Ask them to speak English"], correct: 1, why: "Informed consent and complex histories need a certified interpreter or bilingual clinician — conversational Spanish isn't enough for safety or legal consent." },
];

function SpanishScenario({ result, onResult }: { result?: ReadinessState["spanish"]; onResult: (r: NonNullable<ReadinessState["spanish"]>) => void }) {
  const [answers, setAnswers] = useState<number[]>([]);
  const [reviewed, setReviewed] = useState(false);
  const done = SCENARIO.every((_, i) => answers[i] !== undefined);
  const score = answers.filter((a, i) => a === SCENARIO[i]?.correct).length;
  function finish() {
    setReviewed(true);
    onResult(answers[2] !== 1 ? "Hospital review recommended" : score === 3 ? "English-supported setting ready" : "Developing clinical Spanish");
  }
  function retake() { setAnswers([]); setReviewed(false); }
  return (
    <section className="space-y-3">
      <div className="rounded-3xl border border-border bg-card p-5">
        <p className="flex items-center gap-2 font-display text-xl font-bold"><Languages className="size-5 text-accent-strong" /> Clinical Spanish scenario</p>
        <p className="mt-1 text-xs text-muted-foreground">WEPA readiness indicator—not a language certification or licensing decision.</p>
        {reviewed ? (
          <div className="mt-3 rounded-xl bg-secondary p-4 text-secondary-foreground">
            <p className="font-display text-3xl font-bold">{score} / {SCENARIO.length} correct</p>
            <p className="mt-1 font-semibold">{result}</p>
            <p className="mt-1 text-sm opacity-80">Review each answer below.</p>
          </div>
        ) : result ? (
          <p className="mt-3 rounded-xl bg-secondary p-3 text-sm text-secondary-foreground"><span className="font-semibold">Last result:</span> {result} — answer again to see your score and review.</p>
        ) : null}
      </div>
      {SCENARIO.map((s, i) => {
        const right = answers[i] === s.correct;
        return (
          <div key={i} className={cn("rounded-2xl border bg-card p-4", reviewed ? (right ? "border-primary" : "border-destructive") : "border-border")}>
            <p className="text-sm font-medium">{i + 1}. {s.q}</p>
            <div className="mt-3 grid gap-2">
              {s.options.map((o, j) => {
                const picked = answers[i] === j;
                const cls = reviewed
                  ? j === s.correct ? "border-primary bg-primary/15 font-semibold" : picked ? "border-destructive bg-destructive/10 line-through" : "border-border opacity-60"
                  : picked ? "border-primary bg-primary text-primary-foreground" : "border-border";
                return (
                  <button key={o} disabled={reviewed} onClick={() => setAnswers((a) => { const n = [...a]; n[i] = j; return n; })} className={cn("flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm", cls)}>
                    <span>{o}</span>
                    {reviewed && j === s.correct && <span className="shrink-0 text-xs font-bold">✓ Correct</span>}
                    {reviewed && picked && j !== s.correct && <span className="shrink-0 text-xs font-bold text-destructive">✗ Your answer</span>}
                  </button>
                );
              })}
            </div>
            {reviewed && <p className="mt-3 text-sm text-muted-foreground"><span className={cn("font-semibold", right ? "text-foreground" : "text-destructive")}>{right ? "Right." : "Not quite."}</span> {s.why}</p>}
          </div>
        );
      })}
      {reviewed
        ? <Button size="lg" variant="outline" className="w-full" onClick={retake}>Retake the scenario</Button>
        : <Button size="lg" className="w-full" disabled={!done} onClick={finish}>See my score</Button>}
    </section>
  );
}

export function CandidatePassport({ state, compact }: { state: ReadinessState; compact?: boolean }) {
  const outstanding = state.checklist.filter((c) => !["Nurse confirmed", "Submitted — self-reported", "Accepted"].includes(c.status)).map((c) => c.title);
  const credDone = state.credentialing.filter((c) => c.done).length;
  const rows: [string, string][] = [
    ["Specialty & experience", `${state.profile.specialty} · ${state.profile.years} years`],
    ["License pathway", `${pathwayResult(state.pathway)} · Official authorization ${state.officialAuthorization.toLowerCase()}`],
    ["PR application preparation", `${preparationProgress(state)}% preparation progress`],
    ["Gig interests", interestsComplete(state.interests) ? `${state.interests.regions.join(", ")} · ${state.interests.experiences.join(", ")} · ${state.interests.length}, ${state.interests.housing}` : "Not set yet"],
    ["Hospital credentials", `${credDone}/${state.credentialing.length} candidate-reported`],
    ["Spanish readiness", state.spanish ?? "Not completed"],
    ["Availability", state.profile.availability],
    ["Outstanding items", outstanding.length ? outstanding.join("; ") : "None"],
    ["Consent to share", state.applied ? new Date(state.applied).toLocaleString() : "Not yet shared"],
  ];
  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="flex items-center gap-3 bg-surface-dark p-4 text-surface-dark-foreground">
        <img src={nurseIconAsset.url} alt="" aria-hidden className="size-11 rounded-full object-contain" />
        <div className="min-w-0"><p className="font-display text-lg font-bold">{state.profile.name}</p><p className="text-xs opacity-75">Candidate Passport · {state.profile.city}</p></div>
        <ShieldCheck className="ml-auto size-6 text-primary" />
      </div>
      <dl className={cn("grid gap-px bg-border", !compact && "sm:grid-cols-2")}>
        {rows.map(([k, v]) => <div key={k} className="bg-card p-3"><dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{k}</dt><dd className="text-sm font-medium">{v}</dd></div>)}
      </dl>
      <p className="p-3 text-[11px] text-muted-foreground">All information is candidate-reported. {DISCLAIMER}</p>
    </section>
  );
}

function GuidePanel({ guide, onAsk, onPrepare, onStop }: { guide: { text: string; busy: boolean; error: string }; onAsk: (task: string, detail?: string) => void; onPrepare?: (() => void) | undefined; onStop: () => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const chips: [string, string][] = [["checklist", "Request checklist"], ["dates", "Check my dates"], ["reminders", "Reminders"]];
  const body = (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-2">
        <GuideAvatar className="size-9" />
        <div><p className="font-display font-bold">Wepa Guide</p><p className="text-[11px] text-muted-foreground">AI preparation help — never approves eligibility</p></div>
      </div>
      {onPrepare && <Button onClick={onPrepare} className="bg-coral text-coral-foreground hover:bg-coral/90">Prepare my packet</Button>}
      <div className="flex flex-wrap gap-2">{chips.map(([t, l]) => <Button key={t} size="sm" variant="outline" onClick={() => onAsk(t)} disabled={guide.busy}>{l}</Button>)}</div>
      <div className="min-h-32 flex-1 overflow-y-auto rounded-2xl bg-muted p-3 text-sm">
        {guide.error ? <p className="text-destructive">{guide.error}</p> : guide.text ? <div className="space-y-2 [&_h3]:mt-2 [&_h3]:font-bold [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"><ReactMarkdown>{guide.text}</ReactMarkdown></div> : (guide.busy ? <span className="flex items-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Reviewing your information…</span> : <span className="text-muted-foreground">Ask me what a document is, or let me prepare your packet.</span>)}
      </div>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (q.trim()) { onAsk("ask", q); setQ(""); } }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask about Puerto Rico prep…" className="min-w-0 flex-1 rounded-full border border-input bg-background px-4 text-sm" />
        {guide.busy ? <Button type="button" variant="outline" onClick={onStop}>Stop</Button> : <Button type="submit" size="icon" aria-label="Ask Wepa Guide"><Send /></Button>}
      </form>
    </div>
  );
  return (
    <>
      <aside className="hidden h-[calc(100dvh-8rem)] rounded-3xl border border-border bg-card p-4 lg:sticky lg:top-28 lg:block">{body}</aside>
      <div className="lg:hidden">
        {!open && (
          <button onClick={() => setOpen(true)} className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex items-center gap-3 rounded-full bg-surface-dark p-2 pr-5 text-left text-surface-dark-foreground shadow-lg">
            {guide.busy ? <span className="grid size-10 place-items-center rounded-full bg-secondary"><Loader2 className="size-5 animate-spin text-foreground" /></span> : <GuideAvatar className="size-10" />}
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{guide.busy ? "Wepa Guide is working…" : guide.text ? "Wepa Guide replied — tap to read" : "Ask Wepa Guide"}</span>
          </button>
        )}
        {open && (
          <div className="fixed inset-x-0 bottom-0 z-50 h-[75dvh] rounded-t-3xl border-t border-border bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl">
            <button onClick={() => setOpen(false)} className="mx-auto mb-3 block h-1.5 w-12 rounded-full bg-border" aria-label="Close Wepa Guide" />
            {body}
          </div>
        )}
      </div>
    </>
  );
}

function GuideAvatar({ className }: { className?: string }) {
  return <span className={cn("grid shrink-0 place-items-center overflow-hidden rounded-full bg-secondary ring-2 ring-coral", className)}><img src={logoAsset.url} alt="" aria-hidden className="w-[86%] object-contain" /></span>;
}

function InterestsPicker({ interests, onChange }: { interests: ReadinessState["interests"]; onChange: (i: ReadinessState["interests"]) => void }) {
  const toggle = (key: "regions" | "experiences", v: string) => onChange({ ...interests, [key]: interests[key].includes(v) ? interests[key].filter((x) => x !== v) : [...interests[key], v] });
  const chip = (on: boolean) => cn("rounded-full border px-4 py-2 text-sm font-medium transition", on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted");
  const groups: { title: string; hint: string; body: ReactNode }[] = [
    { title: "Where on the island?", hint: "Pick any", body: INTEREST_OPTIONS.regions.map((r) => <button key={r} className={chip(interests.regions.includes(r))} onClick={() => toggle("regions", r)}>{r}</button>) },
    { title: "What do you want to experience?", hint: "Pick any", body: INTEREST_OPTIONS.experiences.map((r) => <button key={r} className={chip(interests.experiences.includes(r))} onClick={() => toggle("experiences", r)}>{r}</button>) },
    { title: "How long?", hint: "Pick one", body: INTEREST_OPTIONS.lengths.map((r) => <button key={r} className={chip(interests.length === r)} onClick={() => onChange({ ...interests, length: r })}>{r}</button>) },
    { title: "Where do you want to live?", hint: "Pick one", body: INTEREST_OPTIONS.housing.map((r) => <button key={r} className={chip(interests.housing === r)} onClick={() => onChange({ ...interests, housing: r })}>{r}</button>) },
  ];
  return (
    <section className="space-y-3">
      <div className="rounded-3xl bg-surface-dark p-5 text-surface-dark-foreground">
        <p className="font-display text-xl font-bold">Your island, your way</p>
        <p className="mt-1 text-sm opacity-80">Once you're ready, WEPA matches you to every gig whose location and island package fit what you pick here.</p>
        {interestsComplete(interests) && <p className="mt-3 flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="size-4 text-primary" /> Interests saved — ready to match</p>}
      </div>
      {groups.map((g) => (
        <div key={g.title} className="rounded-2xl border border-border bg-card p-4">
          <p className="font-semibold">{g.title} <span className="text-xs font-normal text-muted-foreground">· {g.hint}</span></p>
          <div className="mt-3 flex flex-wrap gap-2">{g.body}</div>
        </div>
      ))}
    </section>
  );
}
