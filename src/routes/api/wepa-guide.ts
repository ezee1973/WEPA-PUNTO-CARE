import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/run-id.server";

const INSTRUCTIONS = `You are "Wepa Guide", the preparation assistant inside WEPA.care, helping a U.S.-licensed nurse prepare for a Puerto Rico travel assignment.

Grounding (real process, summarize carefully):
- Out-of-state nurses can apply through Puerto Rico's universal license recognition process (Reglamento 9746, "Solicitud de Reconocimiento Universal de Licencia") handled by the Departamento de Salud, División de Licenciamiento, with the Junta Examinadora de Enfermería de Puerto Rico (Ley 254-2015).
- The Puerto Rico application is a sworn declaration ("declaración jurada") signed before a notary public; applications sworn outside Puerto Rico typically also need County Clerk authentication of the notary.
- Typical items: government photo ID, citizenship/work authorization, current out-of-state license, good-standing certificate, disciplinary-history certification, notarized sworn declaration, professional liability policy or employer coverage certificate, background verification authorization (Puerto Rico Background Check Program), application fee (use $100 for this demo).
- Hospital credentialing (ED experience, BLS, ACLS, references, health clearance, background screening, orientation, EHR) is set by each hospital, NOT universal Puerto Rico licensing requirements.

Hard rules:
- You provide preparation and process guidance only. Never say "you qualify", "approved", "verified", "guaranteed eligible", "automatically licensed" or "cleared to practice". Use "potential pathway", "preparation progress", "candidate-reported", "ready for review", "official authorization pending".
- You cannot approve eligibility, issue licenses, make legal determinations, claim government verification, or submit anything without the nurse's confirmation.
- Requirements change: recommend confirming current forms and fees with the Puerto Rico Department of Health.
- All data is fictional demo data.
- Be warm, concise, mobile-friendly: short headings, bullets, under 220 words unless drafting a document.
- When drafting a document, produce a clean bilingual (Spanish first, then English) DRAFT with blanks like [____] for anything unknown, and a header "BORRADOR / DRAFT — for nurse review before notarization".`;

const TASKS: Record<string, string> = {
  packet: "Review the nurse profile and checklist below. Summarize what is complete, what is missing (especially the notarized sworn declaration), flag any inconsistent dates, and give the single next best action.",
  explain: "Explain in plain language what this document is, why Puerto Rico asks for it, where the nurse gets it, and common mistakes:",
  draft: "Draft the notarized sworn declaration (declaración jurada) for the Puerto Rico universal license recognition application using the nurse profile. Include identity, license jurisdiction/number/issue date, good-standing statement, no pending discipline statement, truthfulness statement, and a notary block (Affidavit No., notary signature, date, place).",
  checklist: "Generate a document-request checklist the nurse can send to her home board, employer, and insurer, with who to ask and what to request.",
  dates: "Check the profile and checklist for inconsistent dates, expirations within 90 days, or missing information. List findings as bullets.",
  reminders: "Create 3-5 fictional follow-up reminders with dates relative to today for the remaining items.",
  ask: "Answer the nurse's question:",
};

export const Route = createFileRoute("/api/wepa-guide")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) return Response.json({ error: "Wepa Guide is not configured." }, { status: 500 });
        const body = (await request.json().catch(() => null)) as { task?: string; detail?: string; context?: unknown } | null;
        const task = TASKS[body?.task ?? ""];
        if (!task) return Response.json({ error: "Unknown request." }, { status: 400 });
        const detail = String(body?.detail ?? "").slice(0, 1200);
        const context = JSON.stringify(body?.context ?? {}).slice(0, 8000);

        const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
        const provider = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey,
          headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
          fetch: runIdFetch.fetch,
        });
        const result = streamText({
          model: provider.responses("openai/gpt-6-astra"),
          instructions: INSTRUCTIONS,
          messages: [{ role: "user", content: `${task} ${detail}\n\nNurse data (fictional, candidate-reported):\n${context}\n\nToday: ${new Date().toISOString().slice(0, 10)}` }],
          abortSignal: request.signal,
          maxRetries: 0,
          providerOptions: {
            openai: {
              store: false,
              forceReasoning: true,
              reasoningEffort: "low",
              reasoningSummary: "auto",
              include: ["reasoning.encrypted_content"],
            },
          },
          onError: ({ error }) => console.error("wepa-guide error", error),
        });
        return withLovableAiGatewayRunIdHeader(result.toTextStreamResponse(), runIdFetch);
      },
    },
  },
});
