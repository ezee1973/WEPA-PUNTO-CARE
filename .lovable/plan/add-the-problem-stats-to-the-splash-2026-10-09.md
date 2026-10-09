# Add the problem stats to the splash

## Goal
Bring the punchy workforce data from the reference screenshot onto the welcome splash so judges immediately feel the stakes — without making the splash busy or changing any existing copy.

## What changes

**One compact stat strip**, placed between the problem statement and the "Find your place" journey doors (in `src/components/wepa-marketplace.tsx`):

- Four stats in a single row on desktop, a tidy 2×2 grid on phones:
  - **92%** — experience burnout
  - **63%** — seek additional income
  - **42%** — plan to remain in healthcare
  - **50%** — San Juan median RN pay vs U.S.
- Styling stays quiet and editorial: large numbers in coral/teal (alternating, matching the reference), small ivory labels, no boxes or card backgrounds — just type over the ocean wash, separated by a thin divider line above.
- One closing line beneath the stats, with "The result:" in coral:
  - "The result: Capacity loss drives unsafe nurse:patient ratios, increased mortality from wait times, compromised preventive care, and an overall erosion of patient care."

## Kept exactly as-is
- Headline, explainer paragraph, WEPA-logo "closes the gap" sentence, tagline, journey doors, logo, language toggle, jingle, imagery.
- No new sections, no extra cards, no clutter — the stats read as part of the problem statement.

## Spanish
- Matching translations for all stat labels and the result line added to `src/lib/i18n/es.json`; numbers stay identical in both languages.

## Validation
- Check desktop and phone viewports in English and Spanish: stats legible, doors still fully visible without scrolling on typical screens, nothing overlaps.
- `bunx tsgo --noEmit` and `bunx vitest run` pass.
