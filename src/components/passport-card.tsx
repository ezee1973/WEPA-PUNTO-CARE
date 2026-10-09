import { useLanguage } from "@/lib/i18n";
import { useRef, useState } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Award, Copy, Download, ExternalLink, Share2, ShieldCheck, Wallet } from "lucide-react";
import { toast } from "sonner";

import logoAsset from "@/assets/wepa-care-logo.asset.json";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { shareUrl, type SharedPassport } from "@/lib/passport-share";
import { cn } from "@/lib/utils";

const NAVY = "#092D37",
  IVORY = "#F5F2E9",
  TEAL = "#16C9AD",
  CORAL = "#FF7563";

function initials(n: string) {
  return n
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({
  photo,
  name,
  className,
}: {
  photo?: string | undefined;
  name: string;
  className?: string;
}) {
  const { t } = useLanguage();
  return photo ? (
    <img src={photo} alt={t(name)} className={cn("rounded-full object-cover", className)} />
  ) : (
    <span
      className={cn(
        "grid place-items-center rounded-full bg-primary font-display font-bold text-primary-foreground",
        className,
      )}
    >
      {t(initials(name))}
    </span>
  );
}

/** The passport "document": navy cover band, photo page, machine-readable zone, QR. */
export function PassportDocument({
  p,
  photo,
  showQr = true,
}: {
  p: SharedPassport;
  photo?: string | undefined;
  showQr?: boolean;
}) {
  const { t } = useLanguage();
  const url = shareUrl(p);
  const mrz1 = `P<PRI${p.name.toUpperCase().replace(/[^A-Z]/g, "<")}`.padEnd(44, "<").slice(0, 44);
  const mrz2 = `${p.id.replace("-", "")}<${p.progress}RN${p.years}Y<<WEPA<CARE`
    .padEnd(44, "<")
    .slice(0, 44);
  return (
    <article className="relative overflow-hidden rounded-[1.75rem] bg-surface-dark text-surface-dark-foreground shadow-2xl">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `repeating-radial-gradient(circle at 85% 15%, ${TEAL} 0 1px, transparent 1px 14px)`,
        }}
      />
      <div className="relative flex items-center justify-between px-5 pt-5">
        <img
          src={logoAsset.url}
          alt={t("WEPA.care")}
          className="h-6 [filter:brightness(0)_invert(1)]"
        />
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
          {t("Island Passport")}
        </span>
      </div>
      <div className="relative mx-3 mb-3 mt-4 rounded-2xl bg-ivory p-4 text-ivory-foreground">
        <div className="flex gap-4">
          <div className="shrink-0">
            <Avatar
              photo={photo}
              name={p.name}
              className="size-24 rounded-xl text-3xl sm:size-28"
            />
            <p className="mt-2 text-center font-mono text-[10px] font-bold tracking-wider">
              {t(p.id)}
            </p>
          </div>
          <div className="min-w-0 flex-1 space-y-2 text-[11px]">
            <Field k={t("Name / Nombre")} v={t(p.name)} big />
            <Field k={t("Specialty")} v={t(`${p.specialty} · ${p.years} yrs`)} />
            <Field k={t("Home")} v={t(p.city)} />
            <div className="flex gap-4">
              <Field k={t("Issued")} v={t(p.issued)} />
              <Field k={t("Prep")} v={t(`${p.progress}%`)} />
            </div>
          </div>
          {t(
            showQr && (
              <div className="hidden shrink-0 flex-col items-center sm:flex">
                <div className="rounded-lg bg-white p-1.5">
                  <QRCodeSVG value={url} size={92} fgColor={NAVY} />
                </div>
                <p className="mt-1 text-[9px] font-semibold uppercase tracking-wider">
                  {t("Scan to verify")}
                </p>
              </div>
            ),
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Stamp tone="teal">{t(p.pathway)}</Stamp>
          <Stamp tone="coral">{t(`Spanish: ${p.spanish}`)}</Stamp>
          {t(p.pool && <Stamp tone="navy">{t("In the WEPA gig pool")}</Stamp>)}
        </div>
        {t(
          showQr && (
            <div className="mt-3 flex items-center gap-3 sm:hidden">
              <div className="rounded-lg bg-white p-1.5">
                <QRCodeSVG value={url} size={84} fgColor={NAVY} />
              </div>
              <p className="text-[11px] font-semibold">
                {t("Scan to open this passport in any browser.")}
              </p>
            </div>
          ),
        )}
        <div className="mt-3 overflow-hidden rounded-md bg-ivory-foreground/5 px-2 py-1.5 font-mono text-[9px] leading-tight tracking-[0.12em] text-ivory-foreground/70 sm:text-[10px]">
          <p className="truncate">{t(mrz1)}</p>
          <p className="truncate">{t(mrz2)}</p>
        </div>
      </div>
      <p className="relative px-5 pb-4 text-[10px] opacity-70">
        {t("Candidate-reported preparation record — not a license or authorization to practice.")}
      </p>
    </article>
  );
}

function Field({ k, v, big }: { k: string; v: string; big?: boolean }) {
  const { t } = useLanguage();
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-wider text-accent-deep">{t(k)}</p>
      <p className={cn("truncate font-semibold", big && "font-display text-base")}>{t(v)}</p>
    </div>
  );
}
function Stamp({ tone, children }: { tone: "teal" | "coral" | "navy"; children: string }) {
  const { t } = useLanguage();
  return (
    <span
      className={cn(
        "rounded-full border-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        tone === "teal" && "border-primary text-accent-deep",
        tone === "coral" && "border-coral text-coral",
        tone === "navy" && "border-ivory-foreground text-ivory-foreground",
      )}
    >
      {t(children)}
    </span>
  );
}

/** Share bar: copy link, open in browser, native share, wallet pass image, badge. */
export function PassportShare({ p, photo }: { p: SharedPassport; photo?: string | undefined }) {
  const { t } = useLanguage();
  const url = shareUrl(p);
  const [walletOpen, setWalletOpen] = useState(false);
  const [badgeOpen, setBadgeOpen] = useState(false);
  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${p.name} — WEPA Island Passport`, url });
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success(t("Passport link copied."));
    }
  }
  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Button variant="outline" onClick={share}>
          <Share2 />
          {t(" Share")}
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            await navigator.clipboard.writeText(url);
            toast.success(t("Passport link copied."));
          }}
        >
          <Copy />
          {t(" Copy link")}
        </Button>
        <Button variant="outline" asChild>
          <a href={url} target="_blank" rel="noreferrer">
            <ExternalLink />
            {t(" Open in browser")}
          </a>
        </Button>
        <Button
          className="bg-surface-dark text-surface-dark-foreground hover:bg-surface-dark/90"
          onClick={() => setWalletOpen(true)}
        >
          <Wallet />
          {t(" Add to Wallet")}
        </Button>
      </div>
      <Button
        size="lg"
        className="w-full bg-coral text-coral-foreground hover:bg-coral/90"
        onClick={() => setBadgeOpen(true)}
      >
        <Award />
        {t(" Get my WEPA badge")}
      </Button>

      <Dialog open={walletOpen} onOpenChange={setWalletOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogTitle>{t("Your wallet pass")}</DialogTitle>
          <WalletPass p={p} photo={photo} />
          <p className="text-xs text-muted-foreground">
            {t(
              "Save this pass to your phone's photos or home screen and show the QR at interviews. One-tap Apple Wallet is coming soon.",
            )}
          </p>
        </DialogContent>
      </Dialog>
      <BadgeDialog open={badgeOpen} onOpenChange={setBadgeOpen} p={p} photo={photo} />
    </>
  );
}

function WalletPass({ p, photo }: { p: SharedPassport; photo?: string | undefined }) {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  async function download() {
    const qr = ref.current?.querySelector("canvas");
    const c = document.createElement("canvas");
    c.width = 750;
    c.height = 1050;
    const x = c.getContext("2d")!;
    x.fillStyle = NAVY;
    roundRect(x, 0, 0, 750, 1050, 48);
    x.fill();
    x.fillStyle = TEAL;
    x.font = "bold 28px sans-serif";
    x.fillText("WEPA.CARE · ISLAND PASSPORT", 50, 80);
    await drawAvatar(x, photo, p.name, 50, 130, 160);
    x.fillStyle = IVORY;
    x.font = "bold 48px sans-serif";
    x.fillText(p.name, 240, 200);
    x.font = "28px sans-serif";
    x.globalAlpha = 0.8;
    x.fillText(`${p.specialty} · ${p.years} yrs`, 240, 250);
    x.fillText(p.city, 240, 290);
    x.globalAlpha = 1;
    x.fillStyle = CORAL;
    x.font = "bold 30px sans-serif";
    x.fillText(`${p.progress}% Puerto Rico ready`, 50, 380);
    x.fillStyle = IVORY;
    x.font = "26px sans-serif";
    x.fillText(p.pathway, 50, 425);
    x.fillStyle = "#fff";
    roundRect(x, 175, 480, 400, 400, 24);
    x.fill();
    if (qr) x.drawImage(qr, 200, 505, 350, 350);
    x.fillStyle = IVORY;
    x.font = "bold 26px monospace";
    x.textAlign = "center";
    x.fillText(p.id, 375, 940);
    x.font = "20px sans-serif";
    x.globalAlpha = 0.6;
    x.fillText("Candidate-reported · not a license", 375, 990);
    downloadCanvas(c, `wepa-pass-${p.id}.png`);
  }
  return (
    <div ref={ref} className="space-y-3">
      <div className="rounded-3xl bg-surface-dark p-5 text-surface-dark-foreground">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          {t("WEPA.care · Island Passport")}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <Avatar photo={photo} name={p.name} className="size-14 text-lg" />
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-bold">{t(p.name)}</p>
            <p className="truncate text-xs opacity-75">{t(p.specialty)}</p>
          </div>
        </div>
        <p className="mt-3 text-sm font-bold text-coral">
          {t(p.progress)}
          {t("% Puerto Rico ready")}
        </p>
        <div className="mx-auto mt-4 w-fit rounded-xl bg-white p-3">
          <QRCodeCanvas value={shareUrl(p)} size={180} fgColor={NAVY} marginSize={0} />
        </div>
        <p className="mt-2 text-center font-mono text-xs tracking-wider">{t(p.id)}</p>
      </div>
      <Button className="w-full" onClick={download}>
        <Download />
        {t(" Save pass to phone")}
      </Button>
    </div>
  );
}

type BadgeStyle = "seal" | "banner";
function BadgeDialog({
  open,
  onOpenChange,
  p,
  photo,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  p: SharedPassport;
  photo?: string | undefined;
}) {
  const { t } = useLanguage();
  const [style, setStyle] = useState<BadgeStyle>("seal");
  const url = shareUrl(p);
  async function download() {
    const c = style === "seal" ? await drawSeal(p) : await drawBanner(p, photo);
    downloadCanvas(c, `wepa-badge-${style}-${p.id}.png`);
  }
  const caption = `I'm getting Puerto Rico ready with WEPA.care 🌴 ${p.specialty}, ${p.progress}% prepared for island nursing gigs. Verify my Island Passport: ${url}`;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogTitle>{t("Your WEPA Island Nurse badge")}</DialogTitle>
        <div className="grid grid-cols-2 gap-2">
          {t(
            (["seal", "banner"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={cn(
                  "rounded-xl border-2 px-3 py-2 text-sm font-semibold",
                  style === s ? "border-primary bg-primary/10" : "border-border",
                )}
              >
                {t(s === "seal" ? "Seal · profiles & résumés" : "Banner · LinkedIn & socials")}
              </button>
            )),
          )}
        </div>
        {t(style === "seal" ? <SealPreview p={p} /> : <BannerPreview p={p} photo={photo} />)}
        <Button onClick={download}>
          <Download />
          {t(" Download badge")}
        </Button>
        <div className="rounded-xl bg-muted p-3 text-xs">
          <p className="font-semibold">{t("Suggested post")}</p>
          <p className="mt-1 text-muted-foreground">{t(caption)}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await navigator.clipboard.writeText(caption);
                toast.success(t("Caption copied."));
              }}
            >
              <Copy />
              {t(" Copy caption")}
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink />
                {t(" Share on LinkedIn")}
              </a>
            </Button>
          </div>
          <p className="mt-2 text-muted-foreground">
            {t(
              "Résumé tip: add the seal next to your certifications and list “WEPA Island Passport ",
            )}
            {t(p.id)}”.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SealPreview({ p }: { p: SharedPassport }) {
  const { t } = useLanguage();
  return (
    <div className="mx-auto grid size-56 place-items-center rounded-full border-[6px] border-coral bg-surface-dark p-3 text-center text-surface-dark-foreground shadow-xl">
      <div className="grid size-full place-items-center rounded-full border-2 border-dashed border-primary">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
            {t("WEPA.care")}
          </p>
          <p className="font-display text-2xl font-bold leading-tight">
            {t("Island")}
            <br />
            {t("Nurse")}
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-coral">
            {t("Puerto Rico Ready")}
          </p>
          <p className="mt-1 font-mono text-[10px] opacity-70">{t(p.id)}</p>
        </div>
      </div>
    </div>
  );
}
function BannerPreview({ p, photo }: { p: SharedPassport; photo?: string | undefined }) {
  const { t } = useLanguage();
  return (
    <div
      className="flex aspect-[1200/627] items-center gap-3 overflow-hidden rounded-xl bg-surface-dark p-4 text-surface-dark-foreground"
      style={{ backgroundImage: `linear-gradient(120deg, ${NAVY} 55%, ${TEAL}55)` }}
    >
      <Avatar
        photo={photo}
        name={p.name}
        className="size-16 shrink-0 border-4 border-coral text-xl"
      />
      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">
          {t("WEPA Island Nurse · Puerto Rico Ready")}
        </p>
        <p className="truncate font-display text-lg font-bold">{t(p.name)}</p>
        <p className="truncate text-xs opacity-80">
          {t(p.specialty)} · {t(p.years)}
          {t(" yrs")}
        </p>
        <p className="mt-1 text-[10px] font-semibold text-coral">
          {t("Come for the Island. Care for its People.")}
        </p>
      </div>
    </div>
  );
}

// ---------- canvas helpers ----------
function roundRect(
  x: CanvasRenderingContext2D,
  l: number,
  t: number,
  w: number,
  h: number,
  r: number,
) {
  x.beginPath();
  x.moveTo(l + r, t);
  x.arcTo(l + w, t, l + w, t + h, r);
  x.arcTo(l + w, t + h, l, t + h, r);
  x.arcTo(l, t + h, l, t, r);
  x.arcTo(l, t, l + w, t, r);
  x.closePath();
}
function loadImg(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}
async function drawAvatar(
  x: CanvasRenderingContext2D,
  photo: string | undefined,
  name: string,
  l: number,
  t: number,
  s: number,
) {
  x.save();
  x.beginPath();
  x.arc(l + s / 2, t + s / 2, s / 2, 0, Math.PI * 2);
  x.clip();
  if (photo) {
    try {
      x.drawImage(await loadImg(photo), l, t, s, s);
    } catch {
      photo = undefined;
    }
  }
  if (!photo) {
    x.fillStyle = TEAL;
    x.fillRect(l, t, s, s);
    x.fillStyle = NAVY;
    x.font = `bold ${s * 0.38}px sans-serif`;
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillText(initials(name), l + s / 2, t + s / 2);
  }
  x.restore();
  x.textAlign = "left";
  x.textBaseline = "alphabetic";
}
async function drawSeal(p: SharedPassport) {
  const c = document.createElement("canvas");
  c.width = c.height = 800;
  const x = c.getContext("2d")!;
  x.fillStyle = CORAL;
  x.beginPath();
  x.arc(400, 400, 400, 0, Math.PI * 2);
  x.fill();
  x.fillStyle = NAVY;
  x.beginPath();
  x.arc(400, 400, 370, 0, Math.PI * 2);
  x.fill();
  x.strokeStyle = TEAL;
  x.lineWidth = 6;
  x.setLineDash([18, 12]);
  x.beginPath();
  x.arc(400, 400, 330, 0, Math.PI * 2);
  x.stroke();
  x.setLineDash([]);
  x.textAlign = "center";
  x.fillStyle = TEAL;
  x.font = "bold 40px sans-serif";
  x.fillText("W E P A . C A R E", 400, 250);
  x.fillStyle = IVORY;
  x.font = "bold 110px Georgia, serif";
  x.fillText("Island", 400, 380);
  x.fillText("Nurse", 400, 490);
  x.fillStyle = CORAL;
  x.font = "bold 38px sans-serif";
  x.fillText("PUERTO RICO READY", 400, 570);
  x.fillStyle = IVORY;
  x.globalAlpha = 0.7;
  x.font = "30px monospace";
  x.fillText(p.id, 400, 625);
  return c;
}
async function drawBanner(p: SharedPassport, photo?: string) {
  const c = document.createElement("canvas");
  c.width = 1200;
  c.height = 627;
  const x = c.getContext("2d")!;
  const g = x.createLinearGradient(0, 0, 1200, 627);
  g.addColorStop(0.55, NAVY);
  g.addColorStop(1, "#0f6f68");
  x.fillStyle = g;
  x.fillRect(0, 0, 1200, 627);
  x.fillStyle = CORAL;
  x.beginPath();
  x.arc(240, 313, 160, 0, Math.PI * 2);
  x.fill();
  await drawAvatar(x, photo, p.name, 92, 165, 296);
  x.fillStyle = TEAL;
  x.font = "bold 30px sans-serif";
  x.fillText("WEPA ISLAND NURSE · PUERTO RICO READY", 470, 210);
  x.fillStyle = IVORY;
  x.font = "bold 76px sans-serif";
  x.fillText(p.name, 470, 300);
  x.globalAlpha = 0.85;
  x.font = "36px sans-serif";
  x.fillText(`${p.specialty} · ${p.years} yrs`, 470, 360);
  x.globalAlpha = 1;
  x.fillStyle = CORAL;
  x.font = "bold 32px sans-serif";
  x.fillText("Come for the Island. Care for its People.", 470, 440);
  x.fillStyle = IVORY;
  x.globalAlpha = 0.6;
  x.font = "24px monospace";
  x.fillText(`wepa.care · ${p.id}`, 470, 500);
  return c;
}
function downloadCanvas(c: HTMLCanvasElement, name: string) {
  const a = document.createElement("a");
  a.href = c.toDataURL("image/png");
  a.download = name;
  a.click();
  toast.success("Saved — check your downloads.");
}

export { ShieldCheck };
