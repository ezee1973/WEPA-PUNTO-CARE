import { createFileRoute } from "@tanstack/react-router";

import { WepaMarketplace } from "@/components/wepa-marketplace";

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): { home?: "nurse" | "hospital" | "tourism" } => {
    const h = s["home"];
    return h === "nurse" || h === "hospital" || h === "tourism" ? { home: h } : {};
  },
  head: () => ({
    meta: [
      { title: "WEPA.care — Come for the Island. Care for its People." },
      { name: "description", content: "Puerto Rico hospitals pay honest local wages — and island partners cover travel, lodging, and entertainment. Come for the island and make a little money while you're here." },
      { property: "og:title", content: "Come for the Island. Care for its People." },
      { property: "og:description", content: "Free travel, lodging, and fun instead of high pay — Puerto Rico travel nursing, remixed by WEPA.care." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { home } = Route.useSearch();
  return <WepaMarketplace home={home} />;
}
