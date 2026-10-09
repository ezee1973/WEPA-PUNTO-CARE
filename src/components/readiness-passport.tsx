import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Bot, CheckCircle2, Circle, Download, FileText, Languages, Loader2, Paperclip, Send, ShieldCheck, Stethoscope, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { assignment, elena, pathwayResult, preparationProgress, streamGuide, useReadiness, type ChecklistItem, type ItemStatus, type Pathway, type ReadinessState } from "@/lib/readiness";
import { cn } from "@/lib/utils";

const DISCLAIMER = "WEPA provides preparation and process guidance. Only the appropriate Puerto Rico licensing authority can determine eligibility or authorize practice.";
const TABS = [
  { id: "overview", label: "Overview" },
  { id: "pathway", label: "Pathway" },
  { id: "checklist", label: "Checklist" },
  { id: "spanish", label: "Spanish" },
  { id: "hospital", label: "Hospital" },
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
  return { profile: elena, assignment, pathway: s.pathway, checklist: s.checklist.map(({ title, status, source, expires }) => ({ title, status, source, expires })) };
}

export function ReadinessPassport() {
  const { state, update, reset } = useReadiness();
  const [tab, setTab] = useState<Tab>("overview");
  const [guide, setGuide] = useState({ text: "", busy: false, error: "" });
  const abortRef = useRef<AbortController | null>(null);
  const progress = preparationProgress(state);
  const remaining = state.checklist.filter((c) => !["Nurse confirmed", "Submitted — self-reported", "Accepted"].includes(c.status));
  const tracks = [
    { label: "Puerto Rico authorization", value: Math.round((state.checklist.length - remaining.length) / state.checklist.length * 100), note: `Official authorization ${state.officialAuthorization.toLowerCase()}` },
    { label: "Hospital credentialing", value: Math.round(state.credentialing.filter((c) => c.done).length / state.credentialing.length * 100), note: "Set by Hospital del Mar" },
    { label: "Clinical Spanish readiness", value: state.spanish ? 100 : 0, note: state.spanish ?? "Scenario not started" },
  ];
  const nextAction = !state.packetConfirmed
    ? state.packetPrepared ? "Review and confirm your prepared packet" : "Tap “Prepare my packet” — Wepa Guide will review everything"
    : state.checklist.find((c) => c.id === "declaration")?.status !== "Submitted — self-reported" ? "Sign your sworn declaration before a notary" : !state.spanish ? "Complete the 3-question clinical Spanish scenario" : !state.applied ? "Apply to Hospital del Mar" : "Hospital is reviewing your Candidate Passport";

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
    update((s) => ({
      ...s,
      packetPrepared: true,
      checklist: s.checklist.map((c) => {
        if (["standing", "discipline"].includes(c.id)) return { ...c, source: c.id === "standing" ? "Nursys verification — candidate-reported" : "Florida Board certification — candidate-reported", next: "Confirm" };
        if (c.id === "liability") return { ...c, status: "Ready for review", source: "Hospital del Mar coverage certificate (requested)", next: "Confirm" };
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
    toast.success("Applied. Hospital del Mar can now see your Candidate Passport.");
    setTab("passport");
  }

  return (
    <div className="min-h-dvh bg-background pb-32 lg:pb-12">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Button asChild variant="ghost" size="icon" aria-label="Back to WEPA.care"><Link to="/"><ArrowLeft /></Link></Button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-bold leading-tight">Puerto Rico Readiness Passport</p>
            <p className="truncate text-xs text-muted-foreground">{elena.name} · {elena.specialty}</p>
          </div>
          <span className="rounded-full bg-surface-dark px-3 py-1 text-sm font-bold text-surface-dark-foreground">{progress}%</span>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={cn("shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition", tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>{t.label}</button>
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
                <p className="font-semibold">{state.applied ? "Hospital review" : state.packetConfirmed ? "Final documents & Spanish" : "Packet preparation"}</p>
                <div className="mt-4 rounded-2xl bg-background/10 p-4">
                  <p className="text-xs uppercase tracking-wide opacity-70">Next best action</p>
                  <p className="mt-1 font-semibold">{nextAction}</p>
                </div>
                {!state.packetPrepared && <Button onClick={preparePacket} className="mt-4 w-full bg-coral text-coral-foreground hover:bg-coral/90" size="lg"><Bot /> Prepare my packet</Button>}
                {state.packetPrepared && !state.packetConfirmed && <Button onClick={() => setTab("checklist")} className="mt-4 w-full bg-coral text-coral-foreground hover:bg-coral/90" size="lg">Ready for nurse review</Button>}
              </section>
              <section className="rounded-3xl border border-border bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preparing for</p>
                <p className="mt-1 font-display text-xl font-bold">{assignment.title}</p>
                <p className="text-sm text-muted-foreground">{assignment.hospital} · {assignment.location}</p>
                <p className="mt-2 text-sm">{assignment.pay} · {assignment.perks}</p>
              </section>
              <section className="grid gap-3 sm:grid-cols-3">
                {tracks.map((t, i) => (
                  <div key={t.label} className="rounded-2xl border border-border bg-card p-4">
                    <p className="text-xs font-bold text-muted-foreground">{"ABC"[i]}. {t.label}</p>
                    <p className="mt-2 font-display text-3xl font-black">{t.value}%</p>
                    <Progress value={t.value} className="mt-2 h-1.5" />
                    <p className="mt-2 text-xs text-muted-foreground">{t.note}</p>
                  </div>
                ))}
              </section>
              <button onClick={reset} className="text-xs text-muted-foreground underline">Reset demo</button>
            </>
          )}

          {tab === "pathway" && <PathwayCheck pathway={state.pathway} onChange={(p) => update((s) => ({ ...s, pathway: p }))} />}

          {tab === "checklist" && (
            <>
              {state.packetPrepared && !state.packetConfirmed && (
                <section className="rounded-3xl border-2 border-primary bg-card p-5">
                  <p className="font-display text-xl font-bold">Ready for nurse review</p>
                  <p className="mt-1 text-sm text-muted-foreground">Wepa Guide prepared these answers from your profile. Nothing is submitted until you confirm.</p>
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    {[["Name", elena.name], ["License", elena.license], ["Issued", elena.licenseIssued], ["Expires", elena.licenseExpires], ["Category", state.pathway.category], ["Certifications", elena.certs.join(", ")]].map(([k, v]) => (
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
            </>
          )}

          {tab === "spanish" && <SpanishScenario result={state.spanish} onResult={(r) => update((s) => ({ ...s, spanish: r }))} />}

          {tab === "hospital" && (
            <section className="rounded-3xl border border-border bg-card p-5">
              <p className="font-display text-xl font-bold">Hospital del Mar credentialing</p>
              <p className="mt-1 text-sm text-muted-foreground">These are set by the hospital for this gig — they are not universal Puerto Rico licensing requirements.</p>
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
            </section>
          )}

          {tab === "passport" && (
            <section className="space-y-4">
              <CandidatePassport state={state} />
              {!state.applied ? (
                <Button size="lg" className="w-full bg-coral text-coral-foreground hover:bg-coral/90" onClick={apply}><Send /> Apply to Hospital del Mar & share my Passport</Button>
              ) : <p className="rounded-xl bg-muted p-3 text-sm">Shared with Hospital del Mar · Stage: <strong>{state.stage}</strong></p>}
            </section>
          )}
        </div>

        <GuidePanel guide={guide} onAsk={ask} onPrepare={state.packetPrepared ? undefined : preparePacket} onStop={() => abortRef.current?.abort()} />
      </main>
    </div>
  );
}

function PathwayCheck({ pathway, onChange }: { pathway: Pathway; onChange: (p: Pathway) => void }) {
  const qs: [keyof Pathway, string][] = [
    ["active", "Do you hold an active license from a U.S. state or jurisdiction?"],
    ["oneYear", "Have you held it for at least one year?"],
    ["continuous", "Have you practiced continuously for the last three years?"],
    ["inactive", "Have you been inactive for more than one year?"],
    ["goodStanding", "Is the license in good standing?"],
    ["pending", "Do you have any pending disciplinary investigations?"],
    ["revoked", "Has a license ever been revoked or surrendered?"],
  ];
  const result = pathwayResult(pathway);
  return (
    <section className="space-y-3">
      <div className="rounded-3xl bg-surface-dark p-5 text-surface-dark-foreground">
        <p className="text-sm opacity-75">Result</p>
        <p className="font-display text-2xl font-bold">{result}</p>
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
        <input value={pathway.category} onChange={(e) => onChange({ ...pathway, category: e.target.value })} className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2" />
      </label>
    </section>
  );
}

function ChecklistCard({ item, state, onExplain, onDraft, onDraftChange, onSet }: {
  item: ChecklistItem; state: ReadinessState; onExplain: () => void; onDraft: () => void; onDraftChange: (t: string) => void; onSet: (p: Partial<ChecklistItem>) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const isDecl = item.id === "declaration";
  function download() {
    const blob = new Blob([state.declarationDraft], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "declaracion-jurada-borrador.txt";
    a.click();
  }
  return (
    <article className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <FileText className="mt-0.5 size-5 shrink-0 text-accent-strong" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{item.title}</p>
          <p className="text-xs text-muted-foreground">Source: {item.source}{item.expires ? ` · Expires ${item.expires}` : ""}</p>
          {item.next !== "None" && <p className="mt-1 text-xs"><strong>Next:</strong> {item.next}</p>}
          {item.file && <p className="mt-1 flex items-center gap-1 text-xs"><Paperclip className="size-3" /> {item.file} (stored on this device only)</p>}
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold", statusTone[item.status])}>{item.status}</span>
      </div>
      <details className="mt-2 text-sm text-muted-foreground"><summary className="cursor-pointer text-xs font-semibold">What is this?</summary><p className="mt-1">{item.help}</p></details>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={onExplain}><Bot /> Explain</Button>
        {isDecl && <Button size="sm" onClick={onDraft}><FileText /> {state.declarationDraft ? "Redraft" : "Draft with Wepa Guide"}</Button>}
        {!["Nurse confirmed", "Submitted — self-reported"].includes(item.status) && !isDecl && (
          <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}><Upload /> Attach</Button>
        )}
        {isDecl && state.declarationDraft && item.status !== "Submitted — self-reported" && (
          <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}><Upload /> Attach notarized copy</Button>
        )}
        <input ref={fileRef} type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          onSet(isDecl ? { file: f.name, status: "Submitted — self-reported", source: "Notarized copy — candidate-reported", next: "None" } : { file: f.name, status: "Ready for review", next: "Confirm" });
          toast.success(`${f.name} attached (demo — kept on this device).`);
        }} />
      </div>
      {isDecl && state.declarationDraft && (
        <div className="mt-3 space-y-2">
          <Textarea value={state.declarationDraft} onChange={(e) => onDraftChange(e.target.value)} rows={10} className="font-mono text-xs" />
          <Button size="sm" variant="ghost" onClick={download}><Download /> Download draft to print for the notary</Button>
        </div>
      )}
    </article>
  );
}

const SCENARIO = [
  { q: "El paciente dice: “Me duele mucho el pecho, como una presión.” What is the patient describing?", options: ["Strong chest pain, like pressure", "Mild stomach ache", "A headache since yesterday"], correct: 0 },
  { q: "To confirm a medication allergy, which question do you ask?", options: ["¿Tiene alergia a algún medicamento?", "¿Dónde vive usted?", "¿Tiene hambre?"], correct: 0 },
  { q: "The patient's family begins describing a complex history quickly in Spanish before consent for a procedure. What do you do?", options: ["Continue with my conversational Spanish", "Escalate to a bilingual clinician or certified interpreter", "Ask them to speak English"], correct: 1 },
];

function SpanishScenario({ result, onResult }: { result?: ReadinessState["spanish"]; onResult: (r: NonNullable<ReadinessState["spanish"]>) => void }) {
  const [answers, setAnswers] = useState<number[]>([]);
  const done = answers.length === SCENARIO.length;
  function finish() {
    const score = answers.filter((a, i) => a === SCENARIO[i].correct).length;
    onResult(!answers[2] || answers[2] !== 1 ? "Hospital review recommended" : score === 3 ? "English-supported setting ready" : "Developing clinical Spanish");
  }
  return (
    <section className="space-y-3">
      <div className="rounded-3xl border border-border bg-card p-5">
        <p className="flex items-center gap-2 font-display text-xl font-bold"><Languages className="size-5 text-accent-strong" /> Clinical Spanish scenario</p>
        <p className="mt-1 text-xs text-muted-foreground">WEPA readiness indicator—not a language certification or licensing decision.</p>
        {result && <p className="mt-3 rounded-xl bg-secondary p-3 font-semibold text-secondary-foreground">{result}</p>}
      </div>
      {SCENARIO.map((s, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-medium">{i + 1}. {s.q}</p>
          <div className="mt-3 grid gap-2">
            {s.options.map((o, j) => (
              <button key={o} onClick={() => setAnswers((a) => { const n = [...a]; n[i] = j; return n; })} className={cn("rounded-xl border px-3 py-2 text-left text-sm", answers[i] === j ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{o}</button>
            ))}
          </div>
        </div>
      ))}
      <Button size="lg" className="w-full" disabled={!done || answers.some((a) => a === undefined)} onClick={finish}>See my readiness indicator</Button>
    </section>
  );
}

export function CandidatePassport({ state, compact }: { state: ReadinessState; compact?: boolean }) {
  const outstanding = state.checklist.filter((c) => !["Nurse confirmed", "Submitted — self-reported", "Accepted"].includes(c.status)).map((c) => c.title);
  const credDone = state.credentialing.filter((c) => c.done).length;
  const rows: [string, string][] = [
    ["Specialty & experience", `${elena.specialty} · ${elena.years} years`],
    ["License pathway", `${pathwayResult(state.pathway)} · Official authorization ${state.officialAuthorization.toLowerCase()}`],
    ["PR application preparation", `${preparationProgress(state)}% preparation progress`],
    ["Hospital credentialing", `${credDone}/${state.credentialing.length} candidate-reported`],
    ["Spanish readiness", state.spanish ?? "Not completed"],
    ["Availability", elena.availability],
    ["Outstanding items", outstanding.length ? outstanding.join("; ") : "None"],
    ["Consent to share", state.applied ? new Date(state.applied).toLocaleString() : "Not yet shared"],
  ];
  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="flex items-center gap-3 bg-surface-dark p-4 text-surface-dark-foreground">
        <div className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground"><Stethoscope className="size-5" /></div>
        <div className="min-w-0"><p className="font-display text-lg font-bold">{elena.name}</p><p className="text-xs opacity-75">Candidate Passport · {elena.city}</p></div>
        <ShieldCheck className="ml-auto size-6 text-primary" />
      </div>
      <dl className={cn("grid gap-px bg-border", !compact && "sm:grid-cols-2")}>
        {rows.map(([k, v]) => <div key={k} className="bg-card p-3"><dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{k}</dt><dd className="text-sm font-medium">{v}</dd></div>)}
      </dl>
      <p className="p-3 text-[11px] text-muted-foreground">All information is candidate-reported. {DISCLAIMER}</p>
    </section>
  );
}

function GuidePanel({ guide, onAsk, onPrepare, onStop }: { guide: { text: string; busy: boolean; error: string }; onAsk: (task: string, detail?: string) => void; onPrepare?: () => void; onStop: () => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const chips: [string, string][] = [["checklist", "Request checklist"], ["dates", "Check my dates"], ["reminders", "Reminders"]];
  const body = (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="grid size-9 place-items-center rounded-full bg-coral text-coral-foreground"><Bot className="size-5" /></div>
        <div><p className="font-display font-bold">Wepa Guide</p><p className="text-[11px] text-muted-foreground">AI preparation help — never approves eligibility</p></div>
      </div>
      {onPrepare && <Button onClick={onPrepare} className="bg-coral text-coral-foreground hover:bg-coral/90">Prepare my packet</Button>}
      <div className="flex flex-wrap gap-2">{chips.map(([t, l]) => <Button key={t} size="sm" variant="outline" onClick={() => onAsk(t)} disabled={guide.busy}>{l}</Button>)}</div>
      <div className="min-h-32 flex-1 overflow-y-auto rounded-2xl bg-muted p-3 text-sm whitespace-pre-wrap">
        {guide.error ? <p className="text-destructive">{guide.error}</p> : guide.text || (guide.busy ? <span className="flex items-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Reviewing your information…</span> : <span className="text-muted-foreground">Ask me what a document is, or let me prepare your packet.</span>)}
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
            <span className="grid size-10 place-items-center rounded-full bg-coral text-coral-foreground">{guide.busy ? <Loader2 className="size-5 animate-spin" /> : <Bot className="size-5" />}</span>
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
