import { createFileRoute } from "@tanstack/react-router";

import { WepaMarketplace } from "@/components/wepa-marketplace";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WEPA.care — Puerto Rico Travel Nurse Marketplace" },
      { name: "description", content: "Puerto Rico hospitals, U.S. travel nurses, and island partners creating remarkable healthcare opportunities together." },
      { property: "og:title", content: "WEPA.care — Care deeply. Live loudly." },
      { property: "og:description", content: "Discover Puerto Rico travel-nurse gigs with island experiences built in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <WepaMarketplace />;
}
