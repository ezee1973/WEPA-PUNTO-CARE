# WEPA.care

Puerto Rico needs nurses. Travel nurses are licensed professionals who take temporary hospital
assignments, and Puerto Rico competes for them against higher-paying mainland contracts, which makes
critical vacancies harder to fill. The fastest fix is travel nurses from the mainland — WEPA gets them
ready and matched.

WEPA is a three-sided marketplace: Puerto Rico hospitals post local-pay assignments, U.S. travel
nurses get ready once and match with every gig, and island tourism partners add the stays and
experiences that make a Puerto Rico assignment worth booking.

## The problem, in four numbers

| | |
| --- | --- |
| **92%** | of nurses experience burnout |
| **63%** | seek additional income |
| **50%** | San Juan median RN pay vs the U.S. |
| **42%** | plan to remain in healthcare |

The result: unsafe nurse-to-patient ratios and eroding patient care.

## The three sides

- **Nurses** — build a Puerto Rico Readiness Passport: a pathway check, a document checklist,
  clinical Spanish scoring, credentials and island interests. Get ready once, then match with every gig.
- **Hospitals** — build an assignment that sells the hospital and its region, shortlist nurses for that
  specific assignment, publish, and work the hiring pipeline.
- **Tourism partners** — post offers as an affiliate-style directory, buy featured placement, and let
  hospitals pull those offers into nurse-facing gig packages.

## Run it

```sh
bun install
bun run dev        # http://localhost:8080
```

Checks:

```sh
bunx tsgo --noEmit   # type-check
bunx vitest run      # tests
bun run lint         # eslint
```

Stack: TanStack Start (React 19, Vite), Tailwind CSS v4, shadcn/ui, Lovable Cloud for the backend.

## Judge walkthrough

1. Open the landing page — the shortage data and the travel-nurse answer land first; choose a side.
2. **Hospital:** sign in with a demo hospital account, open the gig builder, add island perks, publish
   the assignment. It appears on the hospital dashboard and in nurse gig search.
3. **Nurse:** open the assignment in gig search, apply. The application lands in that hospital's
   pipeline marked "Applied to gig".
4. **Hospital:** open the nurse pool, choose the assignment in the "For:" menu, shortlist a nurse —
   they enter the pipeline for the assignment you selected.
5. **Nurse:** open the Readiness Passport to see preparation progress, documents, clinical Spanish,
   community and a shareable passport.
6. **Tourism partner:** sign in as one of the real island operators, edit or pause an offer, and see
   it update in the shared directory and the hospital perk menu.

## Demo data

Every person, review, testimonial, offer, assignment and billing figure in this build is synthetic
sample data prepared for demonstration. Nurse preparation state lives on the device, so you can reset
and replay the journey. Billing is simulated — no payments are processed. Rates are illustrative:
an 8% fee on processed nurse pay, hospital membership at \$60 per bed per year (or \$1,800 per
location per year for clinics and sites without beds), tourism featured placement at \$49–\$399 per
month, and no cost to nurses.

## Languages

English and Spanish throughout every journey. Switching language changes presentation only — stored
values and marketplace state are unchanged.
