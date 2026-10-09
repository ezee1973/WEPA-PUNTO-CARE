# Make the Passport the center of the nurse journey

## What will change
- Fold Community into the Puerto Rico Readiness Passport as a Passport section rather than a separate nurse destination.
- Change community headers and calls-to-action to emphasize completing the nurse profile, readiness steps, and Passport.
- Redirect the existing `/community` link into the Passport’s Community section so old links still work without creating a competing journey.
- Update nurse-home story and mobile navigation actions to lead into the Passport flow.
- Preserve groups, connections, teams, reviews, testimonials, synthetic labels, and bilingual presentation.

## Technical details
- Add a validated Passport section search value to `/ready` and initialize the Passport interface from it.
- Render the existing typed local community experience inside the Passport shell with an embedded presentation mode.
- Keep canonical community state and readiness state separate but coordinated through calls-to-action; no backend or data-model changes.
- Verify desktop/mobile navigation, profile editing, language switching, and existing tests.
