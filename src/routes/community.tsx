import { createFileRoute } from "@tanstack/react-router";

import { NurseCommunity } from "@/components/nurse-community";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Nurse Community & Island Stories | WEPA.care" },
      { name: "description", content: "Connect with fellow Puerto Rico travel nurses, form travel teams, and explore nurse experience stories." },
      { property: "og:title", content: "Nurse Community & Island Stories | WEPA.care" },
      { property: "og:description", content: "Connect with fellow Puerto Rico travel nurses, form travel teams, and explore nurse experience stories." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NurseCommunity,
});