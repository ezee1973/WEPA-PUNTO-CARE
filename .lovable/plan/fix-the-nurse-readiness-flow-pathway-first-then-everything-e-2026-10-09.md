# Fix the nurse readiness flow — Pathway first, then everything else

## Problem

The Pathway Check (the 8-question eligibility screening) is invisible: nothing in the app ever sends the nurse to it. "Ready for nurse review" jumps straight to the checklist, the overview's next action skips it, and a nurse can prepare their whole packet without ever answering the questions that decide which Puerto Rico authorization route applies to them.

## Better flow: a guided sequence, not a pile of tabs

Turn the passport into a clear step-by-step journey where each step unlocks the next:

```text
1. Pathway Check   → answer 8 questions, get your route (Reg. 9746 / manual review / more info)
2. Checklist       → gather the 10 documents for that route
3. Spanish         → clinical Spanish self-check
4. Interests       → where you want to go, what you want to do
5. Passport        → review your Candidate Passport, join the gig pool
```

### Changes

1. **Guided progression with a "Continue" button.** Each tab ends with a primary "Continue to [next step]" button that advances to the next tab. Tabs remain tappable for jumping around, but the default motion is forward, one step at a time.

2. **Pathway is step one and required.** The overview's "next best action" points to the Pathway Check until it's answered. "Prepare my packet" (Wepa Guide) and the packet-prep actions are unavailable until the pathway questions are complete — the checklist's document guidance depends on which route applies. A note explains why: "Your document list depends on your authorization route."

3. **Pathway completion is visible.** After the last question, the result card (Potential Regulation 9746 pathway / Manual board review recommended / Additional information required) shows with the disclaimer, plus a "Continue to your checklist" button. The tab bar shows a small check on completed steps.

4. **Overview reflects the sequence.** The overview's "next best action" follows the order: finish pathway → complete checklist items → Spanish check → interests → join the gig pool. The three track cards stay, but the primary button always continues the current step.

5. **Existing saves stay valid.** Nurses who already answered pathway questions keep their answers; nothing resets.

## Technical details

- All changes in `src/components/readiness-passport.tsx` and `src/lib/readiness.ts`.
- `nextBestAction` in readiness.ts gains pathway-first ordering: if `pathwayResult` is still "Additional information required" because required questions are unanswered, the next action is "Answer the pathway questions" targeting the Pathway tab.
- Add a `pathwayComplete` helper (all 8 questions answered + category filled) used to gate `preparePacket` / guide "packet" task and to drive the step checks.
- A small `ContinueButton` component rendered at the bottom of each tab section advances `tab` state; completed tabs get a check icon in the tab bar.
- No backend, schema, or route changes. Local persistence format unchanged (new fields not needed).
