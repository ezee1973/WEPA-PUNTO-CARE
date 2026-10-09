import { createFileRoute } from "@tanstack/react-router";

import { ReadinessPassport } from "@/components/readiness-passport";

export const Route = createFileRoute("/ready")({
  validateSearch: (search: Record<string, unknown>): { section?: "community" } =>
    search["section"] === "community" ? { section: "community" } : {},
  head: () => ({
    meta: [
      { title: "Puerto Rico Readiness Passport — WEPA.care" },
      { name: "description", content: "Prepare, draft and track every step for a Puerto Rico nursing assignment with Wepa Guide, your AI preparation assistant." },
      { property: "og:title", content: "Get Puerto Rico Ready — WEPA.care" },
      { property: "og:description", content: "License pathway check, AI-drafted documents, clinical Spanish readiness and a Candidate Passport hospitals can review." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReadyPage,
});

function ReadyPage() {
  const { section } = Route.useSearch();
  return <ReadinessPassport initialTab={section} />;
}
