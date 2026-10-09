import { useLanguage } from "@/lib/i18n";
import { useMemo, useState } from "react";
import {
  CalendarClock,
  Check,
  ChevronRight,
  IdCard,
  Kanban,
  List,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Send,
  Star,
  StickyNote,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { PassportDocument } from "@/components/passport-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ATS_STAGES,
  POOL,
  RECRUITERS,
  matchScore,
  packageTotals,
  useHospital,
  type AtsStage,
  type Candidate,
  type LocationId,
  type PoolNurse,
} from "@/lib/hospital-data";
import { passportId, type SharedPassport } from "@/lib/passport-share";
import { cn } from "@/lib/utils";

const money = (n: number) => `$${n.toLocaleString()}`;
const ALL_STAGES: AtsStage[] = [...ATS_STAGES, "Declined"];
const rel = (iso?: string) => {
  if (!iso) return "—";
  const d = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  return d <= 0 ? "today" : d === 1 ? "yesterday" : `${d}d ago`;
};

export function toPassport(n: PoolNurse): SharedPassport {
  return {
    id: passportId(n.name, n.id),
    name: n.name,
    specialty: n.specialty,
    years: n.years,
    city: n.home,
    progress: n.readiness,
    pathway:
      n.status === "Passport ready"
        ? "Potential Regulation 9746 pathway"
        : "Manual board review recommended",
    spanish: n.spanish,
    certs: n.certs ?? [],
    availability: `${n.length}-week assignment, from ${n.available ?? "TBD"}`,
    regions: n.regions,
    issued: "2026-10-01",
    pool: true,
  };
}

/** Large passport viewer with an explicit close button. */
export function PassportViewer({
  nurse,
  onClose,
}: {
  nurse: PoolNurse | null;
  onClose: () => void;
}) {
  const { t: tr } = useLanguage();
  return (
    <Dialog open={!!nurse} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[94dvh] overflow-y-auto border-0 bg-ocean p-4 sm:max-w-2xl sm:p-6 [&>button]:hidden">
        <DialogTitle className="sr-only">
          {tr(nurse?.name)}
          {tr(" — Island Passport")}
        </DialogTitle>
        {nurse && (
          <>
            <PassportDocument p={toPassport(nurse)} />
            <div className="rounded-2xl bg-ivory p-4 text-sm text-ivory-foreground">
              <p>
                <strong>{tr("Certifications:")}</strong> {tr((nurse.certs ?? []).join(", "))}
              </p>
              <p>
                <strong>{tr("Traveling with:")}</strong> {tr(nurse.family)} ·{" "}
                <strong>{tr("Wants:")}</strong> {tr(nurse.experiences.join(", "))}
              </p>
              <p className="mt-2 text-xs opacity-70">
                {tr(
                  "Candidate-reported. Only Puerto Rico’s licensing authority can determine eligibility or authorize practice.",
                )}
              </p>
            </div>
            <div>
              <DialogClose asChild>
                <Button
                  size="lg"
                  className="w-full bg-coral text-coral-foreground hover:bg-coral/90"
                >
                  <X />
                  {tr(" Close passport")}
                </Button>
              </DialogClose>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function PassportThumb({ nurse, onOpen }: { nurse: PoolNurse; onOpen: () => void }) {
  const { t: tr } = useLanguage();
  if (nurse.status !== "Passport ready")
    return <span className="text-[11px] text-muted-foreground">{tr("Passport in progress")}</span>;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex items-center gap-2 rounded-lg bg-surface-dark px-2 py-1.5 text-left text-surface-dark-foreground hover:ring-2 hover:ring-primary"
    >
      <IdCard className="size-4 text-primary" />
      <span className="text-[11px] font-bold uppercase tracking-wider">{tr("View passport")}</span>
      <span className="font-mono text-[10px] opacity-60">
        {tr(passportId(nurse.name, nurse.id))}
      </span>
    </button>
  );
}

/* ---------------- ATS / CRM pipeline ---------------- */

export function Pipeline({ facilityLocation }: { facilityLocation: LocationId }) {
  const { t: tr } = useLanguage();
  const { state, update } = useHospital();
  const [view, setView] = useState<"board" | "list">("board");
  const [q, setQ] = useState("");
  const [gigF, setGigF] = useState("all");
  const [ownerF, setOwnerF] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [passport, setPassport] = useState<PoolNurse | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const rows = useMemo(
    () =>
      state.candidates
        .map((c) => ({
          c,
          n: POOL.find((x) => x.id === c.nurseId)!,
          g: state.gigs.find((x) => x.id === c.gigId),
        }))
        .filter(
          ({ c, n }) =>
            n &&
            (gigF === "all" || c.gigId === gigF) &&
            (ownerF === "all" || (c.owner ?? "You") === ownerF) &&
            `${n.name} ${n.specialty} ${(c.tags ?? []).join(" ")}`
              .toLowerCase()
              .includes(q.toLowerCase()),
        ),
    [state, q, gigF, ownerF],
  );

  const today = new Date().toISOString().slice(0, 10);
  const openTasks = state.candidates.flatMap((c) =>
    (c.tasks ?? []).filter((t) => !t.done).map((t) => ({ t, c })),
  );
  const overdue = openTasks.filter(({ t }) => t.due < today).length;
  const active = state.candidates.filter(
    (c) => c.stage !== "Declined" && c.stage !== "Accepted",
  ).length;
  const accepted = state.candidates.filter((c) => c.stage === "Accepted").length;
  const offers = state.candidates.filter(
    (c) => c.stage === "Offer sent" || c.stage === "Accepted",
  ).length;

  function move(ids: string[], stage: AtsStage) {
    const at = new Date().toISOString();
    update((s) => ({
      ...s,
      candidates: s.candidates.map((c) =>
        ids.includes(c.nurseId) && c.stage !== stage
          ? {
              ...c,
              stage,
              updatedAt: at,
              activity: [...(c.activity ?? []), { text: `Moved to ${stage}`, at }],
            }
          : c,
      ),
    }));
  }

  const sel = "h-9 rounded-md border border-input bg-card px-2 text-sm";
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {[
          ["Active candidates", active],
          ["Offers out / accepted", `${offers} / ${accepted}`],
          ["Open tasks", openTasks.length],
          ["Overdue follow-ups", overdue],
        ].map(([k, v]) => (
          <div
            key={String(k)}
            className={cn(
              "border border-border bg-card p-3",
              k === "Overdue follow-ups" && overdue > 0 && "border-coral",
            )}
          >
            <p className="text-[11px] font-bold uppercase text-muted-foreground">{tr(k)}</p>
            <p className="text-2xl font-black">{tr(v)}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-44 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tr("Search candidates, tags")}
            className="h-9 pl-9"
          />
        </div>
        <select className={sel} value={gigF} onChange={(e) => setGigF(e.target.value)}>
          <option value="all">{tr("All gigs")}</option>
          {state.gigs.map((g) => (
            <option key={g.id} value={g.id}>
              {tr(g.title)}
            </option>
          ))}
        </select>
        <select className={sel} value={ownerF} onChange={(e) => setOwnerF(e.target.value)}>
          <option value="all">{tr("All owners")}</option>
          {RECRUITERS.map((r) => (
            <option key={r} value={r}>
              {tr(r)}
            </option>
          ))}
        </select>
        <div className="flex border border-border">
          <button
            type="button"
            onClick={() => setView("board")}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 text-sm",
              view === "board" && "bg-primary text-primary-foreground",
            )}
          >
            <Kanban className="size-4" />
            {tr(" Board")}
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 text-sm",
              view === "list" && "bg-primary text-primary-foreground",
            )}
          >
            <List className="size-4" />
            {tr(" List")}
          </button>
        </div>
      </div>

      {tr(
        view === "board" ? (
          <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
            {ALL_STAGES.map((stage) => {
              const col = rows.filter((r) => r.c.stage === stage);
              const value = col.reduce((a, r) => a + r.c.weeklyPay * (r.g?.weeks ?? 0), 0);
              return (
                <div
                  key={stage}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragId) {
                      move([dragId], stage);
                      setDragId(null);
                    }
                  }}
                  className={cn(
                    "w-64 shrink-0 snap-start p-2",
                    stage === "Declined" ? "bg-coral/10" : "bg-muted/60",
                  )}
                >
                  <div className="mb-2 px-1">
                    <p className="flex justify-between text-xs font-black uppercase">
                      {tr(stage)}
                      <span>{tr(col.length)}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {tr(money(value))}
                      {tr(" contract value")}
                    </p>
                  </div>
                  <div className="min-h-16 space-y-2">
                    {col.map(({ c, n, g }) => (
                      <CandidateCard
                        key={c.nurseId}
                        c={c}
                        n={n}
                        gigTitle={g?.title}
                        loc={facilityLocation}
                        onOpen={() => setOpenId(c.nurseId)}
                        onDrag={() => setDragId(c.nurseId)}
                      />
                    ))}
                    {col.length === 0 && (
                      <p className="border border-dashed border-border p-3 text-center text-[11px] text-muted-foreground">
                        {tr("Drop candidates here")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto border border-border bg-card">
            {selected.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted p-2 text-sm">
                <strong>
                  {tr(selected.length)}
                  {tr(" selected")}
                </strong>
                {tr(" · Move to ")}
                {ALL_STAGES.map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      move(selected, s);
                      setSelected([]);
                      toast.success(tr(`Moved to ${s}.`));
                    }}
                  >
                    {tr(s)}
                  </Button>
                ))}
              </div>
            )}
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-muted/60 text-left text-[11px] uppercase text-muted-foreground">
                <tr>
                  <th className="p-2">
                    <input
                      type="checkbox"
                      checked={selected.length === rows.length && rows.length > 0}
                      onChange={(e) =>
                        setSelected(e.target.checked ? rows.map((r) => r.c.nurseId) : [])
                      }
                    />
                  </th>
                  <th className="p-2">{tr("Candidate")}</th>
                  <th className="p-2">{tr("Stage")}</th>
                  <th className="p-2">{tr("Gig")}</th>
                  <th className="p-2">{tr("Match")}</th>
                  <th className="p-2">{tr("Pay/wk")}</th>
                  <th className="p-2">{tr("Owner")}</th>
                  <th className="p-2">{tr("Next task")}</th>
                  <th className="p-2">{tr("Updated")}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map(({ c, n, g }) => {
                  const next = (c.tasks ?? [])
                    .filter((t) => !t.done)
                    .sort((a, b) => a.due.localeCompare(b.due))[0];
                  return (
                    <tr key={c.nurseId} className="border-t border-border hover:bg-muted/40">
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={selected.includes(c.nurseId)}
                          onChange={(e) =>
                            setSelected((s) =>
                              e.target.checked
                                ? [...s, c.nurseId]
                                : s.filter((x) => x !== c.nurseId),
                            )
                          }
                        />
                      </td>
                      <td className="p-2">
                        <button
                          type="button"
                          className="text-left font-bold hover:underline"
                          onClick={() => setOpenId(c.nurseId)}
                        >
                          {tr(n.name)}
                        </button>
                        <p className="text-xs text-muted-foreground">{tr(n.specialty)}</p>
                      </td>
                      <td className="p-2">
                        <select
                          className="rounded border border-input bg-card px-1 py-0.5 text-xs"
                          value={c.stage}
                          onChange={(e) => move([c.nurseId], e.target.value as AtsStage)}
                        >
                          {ALL_STAGES.map((s) => (
                            <option key={s} value={s}>
                              {tr(s)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2 text-xs">{g?.title ?? "—"}</td>
                      <td className="p-2 font-bold">{tr(matchScore(n, facilityLocation))}%</td>
                      <td className="p-2">{tr(money(c.weeklyPay))}</td>
                      <td className="p-2 text-xs">{c.owner ?? "You"}</td>
                      <td
                        className={cn(
                          "p-2 text-xs",
                          next && next.due < today && "font-bold text-coral",
                        )}
                      >
                        {tr(next ? `${next.text} · ${next.due}` : "—")}
                      </td>
                      <td className="p-2 text-xs text-muted-foreground">{tr(rel(c.updatedAt))}</td>
                      <td className="p-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setOpenId(c.nurseId)}
                          aria-label={tr("Open")}
                        >
                          <ChevronRight />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ),
      )}

      <CandidateRecord
        nurseId={openId}
        onClose={() => setOpenId(null)}
        onPassport={setPassport}
        facilityLocation={facilityLocation}
      />
      <PassportViewer nurse={passport} onClose={() => setPassport(null)} />
    </div>
  );
}

function Stars({
  value,
  onChange,
  size = "size-3.5",
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: string;
}) {
  const { t: tr } = useLanguage();
  return (
    <span className="flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!onChange}
          onClick={(e) => {
            e.stopPropagation();
            onChange?.(i);
          }}
          aria-label={tr(`${i} stars`)}
        >
          <Star
            className={cn(size, i <= value ? "fill-coral text-coral" : "text-muted-foreground/40")}
          />
        </button>
      ))}
    </span>
  );
}

function CandidateCard({
  c,
  n,
  gigTitle,
  loc,
  onOpen,
  onDrag,
}: {
  c: Candidate;
  n: PoolNurse;
  gigTitle?: string | undefined;
  loc: LocationId;
  onOpen: () => void;
  onDrag: () => void;
}) {
  const { t: tr } = useLanguage();
  const today = new Date().toISOString().slice(0, 10);
  const overdue = (c.tasks ?? []).some((t) => !t.done && t.due < today);
  return (
    <button
      type="button"
      draggable
      onDragStart={onDrag}
      onClick={onOpen}
      className="w-full cursor-grab border border-border bg-card p-3 text-left hover:border-primary active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <strong className="text-sm leading-tight">{tr(n.name)}</strong>
        <span className="bg-primary px-1.5 text-[10px] font-black text-primary-foreground">
          {tr(matchScore(n, loc))}%
        </span>
      </div>
      <span className="block text-xs text-muted-foreground">
        {tr(n.specialty)} · {tr(n.years)}
        {tr("y")}
      </span>
      <span className="mt-1 block truncate text-xs">
        {gigTitle ?? "—"} · {tr(money(c.weeklyPay))}
        {tr("/wk")}
      </span>
      <div className="mt-2 flex items-center justify-between">
        <Stars value={c.rating ?? 0} />
        <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {c.messages.length > 0 && (
            <span className="flex items-center gap-0.5">
              <MessageSquare className="size-3" />
              {tr(c.messages.length)}
            </span>
          )}
          {overdue && (
            <span className="flex items-center gap-0.5 font-bold text-coral">
              <CalendarClock className="size-3" />
              {tr("due")}
            </span>
          )}
          {tr(rel(c.updatedAt))}
        </span>
      </div>
      {(c.tags ?? []).length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {c.tags!.map((t) => (
            <span key={t} className="bg-muted px-1.5 text-[10px]">
              {tr(t)}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

type RecTab = "messages" | "offer" | "notes" | "activity";

function CandidateRecord({
  nurseId,
  onClose,
  onPassport,
  facilityLocation,
}: {
  nurseId: string | null;
  onClose: () => void;
  onPassport: (n: PoolNurse) => void;
  facilityLocation: LocationId;
}) {
  const { t: tr } = useLanguage();
  const { state, update } = useHospital();
  const c = state.candidates.find((x) => x.nurseId === nurseId) ?? null;
  const n = c ? (POOL.find((x) => x.id === c.nurseId) ?? null) : null;
  const g = c ? state.gigs.find((x) => x.id === c.gigId) : undefined;
  const [tab, setTab] = useState<RecTab>("messages");
  const [msg, setMsg] = useState("");
  const [note, setNote] = useState("");
  const [task, setTask] = useState({
    text: "",
    due: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  });
  const [pay, setPay] = useState<number | null>(null);
  const [tag, setTag] = useState("");

  function patch(fn: (c: Candidate) => Candidate, log?: string) {
    if (!c) return;
    const at = new Date().toISOString();
    update((s) => ({
      ...s,
      candidates: s.candidates.map((x) =>
        x.nurseId === c.nurseId
          ? {
              ...fn(x),
              updatedAt: at,
              activity: log ? [...(x.activity ?? []), { text: log, at }] : (x.activity ?? []),
            }
          : x,
      ),
    }));
  }
  function say(text: string, from: "hospital" | "nurse" = "hospital", stage?: AtsStage) {
    patch(
      (x) => ({
        ...x,
        stage: stage ?? x.stage,
        messages: [...x.messages, { from, text, at: new Date().toISOString() }],
      }),
      stage && stage !== c?.stage
        ? `Moved to ${stage}`
        : from === "hospital"
          ? "Message sent"
          : "Reply received",
    );
  }
  function send() {
    if (!msg.trim() || !c) return;
    say(msg.trim(), "hospital", c.stage === "Shortlisted" ? "Contacted" : undefined);
    setMsg("");
    const id = c.nurseId;
    setTimeout(
      () =>
        update((s) => ({
          ...s,
          candidates: s.candidates.map((x) =>
            x.nurseId === id
              ? {
                  ...x,
                  messages: [
                    ...x.messages,
                    {
                      from: "nurse",
                      text: "Thanks! That sounds great — can you tell me more about the housing?",
                      at: new Date().toISOString(),
                    },
                  ],
                }
              : x,
          ),
        })),
      1200,
    );
  }

  const curPay = pay ?? c?.weeklyPay ?? 0;
  const pkg = g ? packageTotals(g.perks).retail : 0;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <Dialog
      open={!!c}
      onOpenChange={(o) => {
        if (!o) {
          onClose();
          setPay(null);
          setTab("messages");
        }
      }}
    >
      <DialogContent className="max-h-[94dvh] overflow-y-auto p-0 sm:max-w-4xl">
        {c && n && (
          <div className="grid md:grid-cols-[17rem_1fr]">
            <aside className="space-y-3 border-b border-border bg-muted/40 p-5 md:border-b-0 md:border-r">
              <DialogTitle className="text-xl font-black">{tr(n.name)}</DialogTitle>
              <p className="text-xs text-muted-foreground">
                {tr(n.specialty)} · {tr(n.years)}
                {tr(" yrs · ")}
                {tr(n.home)}
              </p>
              <PassportThumb nurse={n} onOpen={() => onPassport(n)} />
              <div className="space-y-1 text-xs">
                <p className="flex items-center gap-1.5">
                  <Mail className="size-3.5" /> {tr(n.email)}
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="size-3.5" /> {tr(n.phone)}
                </p>
              </div>
              <label className="block text-[11px] font-bold uppercase text-muted-foreground">
                {tr("Stage ")}
                <select
                  className="mt-1 block w-full rounded border border-input bg-card px-2 py-1.5 text-sm normal-case text-foreground"
                  value={c.stage}
                  onChange={(e) =>
                    patch(
                      (x) => ({ ...x, stage: e.target.value as AtsStage }),
                      `Moved to ${e.target.value}`,
                    )
                  }
                >
                  {ALL_STAGES.map((s) => (
                    <option key={s} value={s}>
                      {tr(s)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-[11px] font-bold uppercase text-muted-foreground">
                {tr("Owner ")}
                <select
                  className="mt-1 block w-full rounded border border-input bg-card px-2 py-1.5 text-sm normal-case text-foreground"
                  value={c.owner ?? "You"}
                  onChange={(e) =>
                    patch((x) => ({ ...x, owner: e.target.value }), `Assigned to ${e.target.value}`)
                  }
                >
                  {RECRUITERS.map((r) => (
                    <option key={r} value={r}>
                      {tr(r)}
                    </option>
                  ))}
                </select>
              </label>
              <div>
                <p className="text-[11px] font-bold uppercase text-muted-foreground">
                  {tr("Rating")}
                </p>
                <Stars
                  size="size-5"
                  value={c.rating ?? 0}
                  onChange={(v) => patch((x) => ({ ...x, rating: v }), `Rated ${v}/5`)}
                />
              </div>
              <dl className="grid grid-cols-2 gap-1 text-xs">
                <dt className="text-muted-foreground">{tr("Match")}</dt>
                <dd className="font-bold">{tr(matchScore(n, facilityLocation))}%</dd>
                <dt className="text-muted-foreground">{tr("Readiness")}</dt>
                <dd>{tr(n.readiness)}%</dd>
                <dt className="text-muted-foreground">{tr("Spanish")}</dt>
                <dd>{tr(n.spanish)}</dd>
                <dt className="text-muted-foreground">{tr("Available")}</dt>
                <dd>{tr(n.available)}</dd>
                <dt className="text-muted-foreground">{tr("Source")}</dt>
                <dd>{c.source ?? "WEPA pool match"}</dd>
                <dt className="text-muted-foreground">{tr("Gig")}</dt>
                <dd>{g?.title ?? "—"}</dd>
              </dl>
              <div>
                <p className="text-[11px] font-bold uppercase text-muted-foreground">
                  {tr("Tags")}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {(c.tags ?? []).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() =>
                        patch((x) => ({ ...x, tags: (x.tags ?? []).filter((y) => y !== t) }))
                      }
                      className="flex items-center gap-0.5 bg-card px-1.5 py-0.5 text-[11px]"
                    >
                      {tr(t)}
                      <X className="size-3" />
                    </button>
                  ))}
                </div>
                <form
                  className="mt-1 flex gap-1"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (tag.trim()) {
                      patch((x) => ({ ...x, tags: [...(x.tags ?? []), tag.trim()] }));
                      setTag("");
                    }
                  }}
                >
                  <Input
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder={tr("Add tag")}
                    className="h-7 text-xs"
                  />
                  <Button size="sm" type="submit" variant="outline" className="h-7">
                    <Plus />
                  </Button>
                </form>
              </div>
            </aside>

            <section className="flex min-h-[28rem] flex-col p-5">
              <div className="mb-3 flex gap-1 border-b border-border">
                {(
                  [
                    ["messages", "Messages"],
                    ["offer", "Negotiate & offer"],
                    ["notes", "Notes & tasks"],
                    ["activity", "Activity"],
                  ] as const
                ).map(([id, l]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={cn(
                      "-mb-px border-b-2 px-3 py-2 text-sm font-semibold",
                      tab === id ? "border-primary" : "border-transparent text-muted-foreground",
                    )}
                  >
                    {tr(l)}
                  </button>
                ))}
              </div>

              {tab === "messages" && (
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex flex-wrap gap-1">
                    {[
                      "Hi! Your passport caught our eye — open to a quick call?",
                      "Here's the island package for this gig.",
                      "Can you share your availability for an interview?",
                    ].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setMsg(t)}
                        className="border border-border px-2 py-1 text-[11px] hover:border-primary"
                      >
                        {tr(t)}
                      </button>
                    ))}
                  </div>
                  <div className="max-h-72 flex-1 space-y-2 overflow-y-auto bg-muted/50 p-3">
                    {c.messages.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        {tr("No messages yet — say hello.")}
                      </p>
                    )}
                    {c.messages.map((m, i) => (
                      <div
                        key={i}
                        className={cn(
                          "max-w-[80%] p-2 text-sm",
                          m.from === "hospital"
                            ? "ml-auto bg-primary text-primary-foreground"
                            : "bg-card",
                        )}
                      >
                        {tr(m.text)}
                        <span className="mt-0.5 block text-[10px] opacity-60">{tr(rel(m.at))}</span>
                      </div>
                    ))}
                  </div>
                  <form
                    className="flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      send();
                    }}
                  >
                    <Input
                      value={msg}
                      onChange={(e) => setMsg(e.target.value)}
                      placeholder={tr(`Message ${n.name.split(" ")[0]}`)}
                    />
                    <Button type="submit">
                      <Send />
                    </Button>
                  </form>
                </div>
              )}

              {tab === "offer" && (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="text-sm">
                      {tr("Weekly pay")}
                      <Input
                        type="number"
                        value={curPay}
                        onChange={(e) => setPay(Number(e.target.value))}
                        className="mt-1"
                      />
                    </label>
                    <div className="border border-border p-3 text-sm">
                      <p className="text-xs text-muted-foreground">{tr("Island package")}</p>
                      <p className="font-black">{tr(money(pkg))}</p>
                    </div>
                    <div className="border border-border p-3 text-sm">
                      <p className="text-xs text-muted-foreground">{tr("Total contract value")}</p>
                      <p className="font-black">{tr(money(curPay * (g?.weeks ?? 0) + pkg))}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        patch((x) => ({ ...x, weeklyPay: curPay }));
                        say(
                          `Counter proposal: ${money(curPay)}/wk + full island package.`,
                          "hospital",
                          "Negotiating",
                        );
                        toast.success(tr("Counter sent."));
                      }}
                    >
                      {tr("Send counter")}
                    </Button>
                    <Button
                      onClick={() => {
                        patch((x) => ({ ...x, weeklyPay: curPay }));
                        say(
                          `Formal offer: ${money(curPay)}/wk, ${g?.weeks} weeks, starting ${g?.start}, with the full island package.`,
                          "hospital",
                          "Offer sent",
                        );
                        toast.success(tr("Offer sent."));
                      }}
                    >
                      {tr("Send formal offer")}
                    </Button>
                    {c.stage === "Offer sent" && (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            say("Offer accepted! 🎉", "nurse", "Accepted");
                            toast.success(tr(`${n.name} accepted.`));
                          }}
                        >
                          <Check />
                          {tr(" Simulate accept")}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() =>
                            say("Thank you, but I'll pass this time.", "nurse", "Declined")
                          }
                        >
                          {tr("Simulate decline")}
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="border border-border">
                    <p className="border-b border-border bg-muted/50 px-3 py-2 text-xs font-bold uppercase">
                      {tr("Offer history")}
                    </p>
                    {c.messages
                      .filter((m) => /offer|counter|\$/i.test(m.text))
                      .map((m, i) => (
                        <p
                          key={i}
                          className="border-b border-border px-3 py-2 text-sm last:border-0"
                        >
                          <strong>
                            {tr(m.from === "hospital" ? "You" : n.name.split(" ")[0])}:
                          </strong>{" "}
                          {tr(m.text)}{" "}
                          <span className="text-xs text-muted-foreground">· {tr(rel(m.at))}</span>
                        </p>
                      ))}
                    {!c.messages.some((m) => /offer|counter|\$/i.test(m.text)) && (
                      <p className="px-3 py-2 text-sm text-muted-foreground">
                        {tr("No offers yet.")}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {tr(
                      "Start remains conditional on official Puerto Rico authorization and your credentialing.",
                    )}
                  </p>
                </div>
              )}

              {tab === "notes" && (
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <p className="mb-2 flex items-center gap-1 text-sm font-black">
                      <CalendarClock className="size-4" />
                      {tr(" Tasks & follow-ups")}
                    </p>
                    <form
                      className="flex flex-wrap gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!task.text.trim()) return;
                        patch(
                          (x) => ({
                            ...x,
                            tasks: [
                              ...(x.tasks ?? []),
                              {
                                id: crypto.randomUUID(),
                                text: task.text.trim(),
                                due: task.due,
                                done: false,
                              },
                            ],
                          }),
                          `Task added: ${task.text.trim()}`,
                        );
                        setTask({ ...task, text: "" });
                      }}
                    >
                      <Input
                        value={task.text}
                        onChange={(e) => setTask({ ...task, text: e.target.value })}
                        placeholder={tr("e.g. Schedule interview")}
                        className="min-w-0 flex-1"
                      />
                      <Input
                        type="date"
                        value={task.due}
                        onChange={(e) => setTask({ ...task, due: e.target.value })}
                        className="w-36"
                      />
                      <Button type="submit" size="icon">
                        <Plus />
                      </Button>
                    </form>
                    <ul className="mt-2 space-y-1">
                      {(c.tasks ?? []).map((t) => (
                        <li
                          key={t.id}
                          className="flex items-center gap-2 border border-border p-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={t.done}
                            onChange={() =>
                              patch(
                                (x) => ({
                                  ...x,
                                  tasks: (x.tasks ?? []).map((y) =>
                                    y.id === t.id ? { ...y, done: !y.done } : y,
                                  ),
                                }),
                                t.done ? undefined : `Task done: ${t.text}`,
                              )
                            }
                          />
                          <span className={cn("flex-1", t.done && "line-through opacity-50")}>
                            {tr(t.text)}
                          </span>
                          <span
                            className={cn(
                              "text-xs",
                              !t.done && t.due < today
                                ? "font-bold text-coral"
                                : "text-muted-foreground",
                            )}
                          >
                            {tr(t.due)}
                          </span>
                        </li>
                      ))}
                      {!(c.tasks ?? []).length && (
                        <li className="text-sm text-muted-foreground">{tr("No tasks yet.")}</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-2 flex items-center gap-1 text-sm font-black">
                      <StickyNote className="size-4" />
                      {tr(" Private notes")}
                    </p>
                    <Textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={tr("Only your team sees this")}
                      rows={3}
                    />
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        if (!note.trim()) return;
                        patch(
                          (x) => ({
                            ...x,
                            notes: [
                              { text: note.trim(), at: new Date().toISOString() },
                              ...(x.notes ?? []),
                            ],
                          }),
                          "Note added",
                        );
                        setNote("");
                      }}
                    >
                      {tr("Save note")}
                    </Button>
                    <ul className="mt-3 space-y-2">
                      {(c.notes ?? []).map((m, i) => (
                        <li key={i} className="bg-muted/60 p-2 text-sm">
                          {tr(m.text)}
                          <span className="block text-[10px] text-muted-foreground">
                            {tr(rel(m.at))}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {tab === "activity" && (
                <ol className="space-y-3 border-l-2 border-border pl-4">
                  {[
                    ...(c.activity ?? []),
                    ...c.messages.map((m) => ({
                      text: `${m.from === "hospital" ? "You" : n.name.split(" ")[0]}: ${m.text}`,
                      at: m.at,
                    })),
                  ]
                    .sort((a, b) => b.at.localeCompare(a.at))
                    .map((a, i) => (
                      <li key={i} className="relative text-sm">
                        <span className="absolute -left-[1.4rem] top-1.5 size-2.5 rounded-full bg-primary" />
                        {tr(a.text)}
                        <span className="block text-[11px] text-muted-foreground">
                          {tr(new Date(a.at).toLocaleString())}
                        </span>
                      </li>
                    ))}
                </ol>
              )}
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
