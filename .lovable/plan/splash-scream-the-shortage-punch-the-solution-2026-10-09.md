# Splash: scream the shortage, punch the solution

Restructure the splash narrative into two beats: the data screams "shortage," then one line punches the answer — travel nurses from the mainland.

## Copy structure (top to bottom)

1. Headline: "Puerto Rico needs nurses." (unchanged)
2. Short explainer paragraph (unchanged)
3. **The shortage, in data** — the four stats, reframed as the crisis:
   - 92% experience burnout
   - 63% seek additional income
   - 50% San Juan median RN pay vs U.S.
   - 42% plan to remain in healthcare
   Followed by a short coral result line, trimmed to: "The result: unsafe nurse-to-patient ratios and eroding patient care."
4. **The punch** — one bold ivory line, larger than body copy:
   "The fastest fix: travel nurses from the mainland. WEPA gets them ready and matched."
   (The existing "[logo] closes the gap" sentence is folded into this punch line so we don't say the same thing twice.)
5. "Come for the Island. Care for its People." tagline (unchanged)
6. "Find your place" journey doors (unchanged)

## Design

- Keep the current clean stat strip style (big coral/teal numbers, small ivory labels, thin divider, no boxes).
- Tighten vertical spacing on phones so the stats + punch don't push the journey doors too far down; stats stay 2×2 on mobile, one row on desktop.
- The punch line gets visual weight (larger, ivory, possibly with the small WEPA logo inline as it is today) so it reads as the answer, not another paragraph.
- Matching Spanish strings for the trimmed result line and the punch line in es.json.
- Keep west-coast image, logo, language toggle, jingle, and all other copy exactly as-is.

## Technical

- Edit `src/components/wepa-marketplace.tsx` (stat strip + punch line markup) and `src/lib/i18n/es.json` (new/updated Spanish keys).
- Validate: `bunx tsgo --noEmit`, `bunx vitest run`, Playwright screenshots on desktop + mobile, English + Spanish.
