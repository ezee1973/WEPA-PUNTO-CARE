import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";

import { PassportDocument } from "@/components/passport-card";
import { Button } from "@/components/ui/button";
import { decodePassport } from "@/lib/passport-share";

export const Route = createFileRoute("/passport")({
  validateSearch: (s: Record<string, unknown>) => ({
    d: typeof s["d"] === "string" ? (s["d"] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "Island Passport — WEPA.care" },
      {
        name: "description",
        content:
          "A travel nurse's WEPA Island Passport: Puerto Rico preparation progress, pathway and clinical Spanish readiness.",
      },
      { property: "og:title", content: "WEPA Island Passport — Puerto Rico Ready Nurse" },
      {
        property: "og:description",
        content:
          "Scan or open a nurse's WEPA Island Passport to see their Puerto Rico preparation record.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PublicPassport,
});

function PublicPassport() {
  const { t: tr } = useLanguage();
  const { d } = Route.useSearch();
  const p = d ? decodePassport(d) : null;
  return (
    <main className="min-h-dvh bg-ocean px-4 py-10 text-ocean-foreground">
      <div className="mx-auto max-w-lg space-y-5">
        <div className="flex justify-end">
          <LanguageToggle dark />
        </div>
        {tr(
          p ? (
            <>
              <PassportDocument p={p} />
              <div className="rounded-2xl bg-ivory p-4 text-sm text-ivory-foreground">
                <p className="font-semibold">{tr("Certifications")}</p>
                <p>{p.certs.join(", ") || "—"}</p>
                <p className="mt-2 font-semibold">{tr("Availability")}</p>
                <p>{tr(p.availability)}</p>
                {p.regions.length > 0 && (
                  <>
                    <p className="mt-2 font-semibold">{tr("Wants to work in")}</p>
                    <p>{tr(p.regions.join(", "))}</p>
                  </>
                )}
                <p className="mt-3 text-xs opacity-70">
                  {tr(
                    "Candidate-reported. WEPA provides preparation and process guidance. Only the appropriate Puerto Rico licensing authority can determine eligibility or authorize practice.",
                  )}
                </p>
              </div>
            </>
          ) : (
            <p className="text-center">{tr("This passport link is incomplete or expired.")}</p>
          ),
        )}
        <Button asChild className="w-full bg-coral text-coral-foreground hover:bg-coral/90">
          <Link to="/">{tr("Discover WEPA.care")}</Link>
        </Button>
      </div>
    </main>
  );
}
