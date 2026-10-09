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
      { name: "description", content: "The travel nursing marketplace connecting Puerto Rico’s hospitals, nurses, and tourism partners—bringing care, island stays, and local experiences together." },
      { property: "og:title", content: "Come for the Island. Care for its People." },
      { property: "og:description", content: "The travel nursing marketplace connecting Puerto Rico’s hospitals, nurses, and tourism partners—bringing care, island stays, and local experiences together." },
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
