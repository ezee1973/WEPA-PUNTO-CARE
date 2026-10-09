import { createFileRoute } from "@tanstack/react-router";

import { ReadinessPassport } from "@/components/readiness-passport";

export const Route = createFileRoute("/ready")({
  validateSearch: (search: Record<string, unknown>): { section?: "community" } =>
    search["section"] === "community" ? { section: "community" } : {},
  head: () => ({
    meta: [
      { title: "Puerto Rico Readiness Passport — WEPA.care" },
      { name: "description", content: "Get ready once and match with every Puerto Rico nursing gig: pathway check, documents, clinical Spanish, take-home pay and travel booking, guided by Wepa Guide." },
      { property: "og:title", content: "Get Puerto Rico Ready — WEPA.care" },
      { property: "og:description", content: "Pathway check, AI-drafted documents, clinical Spanish, island interests and a shareable Island Passport. Free for nurses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReadyPage,
});

function ReadyPage() {
  const { section } = Route.useSearch();
  return section ? <ReadinessPassport initialTab={section} /> : <ReadinessPassport />;
}
