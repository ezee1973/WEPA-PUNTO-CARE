# WEPA.care Hackathon MVP Plan

## Product goal
Build a working three-sided marketplace that makes Puerto Rico the most exciting destination for U.S. travel nurses:

```text
Tourism partners compete with private offers
                    ↓
Puerto Rico hospitals assemble stronger gig packages
                    ↓
U.S. nurses become pre-qualified, discover gigs, and apply
```

The judge experience will make all three journeys understandable within minutes, while giving the nurse journey the strongest mobile treatment.

## The three marketplace experiences

### 1. U.S. nurse experience
- Mobile-first onboarding and profile with specialty, licenses, experience, availability, and Puerto Rico interests.
- A guided pre-qualification workspace with required forms, document checklist, submission status, missing items, and next actions.
- Puerto Rico travel-gig marketplace with compensation, schedule, hospital, location, package highlights, and qualification fit.
- Gig detail and application flow, plus an application/process tracker.
- Nurse-facing tourism benefits appear only after hospitals include them in a gig package.

### 2. Puerto Rico hospital experience
- Create and manage travel-nurse gigs with role, specialty, dates, shifts, compensation, requirements, and location.
- Review private tourism offers ranging from free to deeply discounted; nurses cannot browse this supply-side marketplace directly.
- Compare competing offers and add selected lodging, transportation, food, wellness, and experience benefits to a nurse package.
- Review applicants and their pre-qualification progress, then move candidates through clear statuses.

### 3. Travel and tourism partner experience
- Publish private offers available only to participating hospitals.
- Set category, description, location, terms, capacity, retail value, hospital price or discount, and availability.
- Manage active offers and see when a hospital selects one for a travel-nurse package.
- Present offers competitively so stronger ecosystem contributions stand out.

## Judge-ready demo story
1. A tourism partner posts an attractive Puerto Rico offer.
2. A hospital creates a travel-nurse gig, compares private partner offers, and builds a compelling package.
3. A nurse completes pre-qualification steps on mobile, discovers the enriched gig, checks fit, and applies.
4. The hospital sees the qualified applicant and advances the application.

A role switcher will let judges experience this complete loop without separate credentials slowing the demo. Real role-based accounts will still support the working marketplace.

## AI and workflow value
- Add an AI-assisted pre-qualification guide focused on process navigation: summarize what is complete, identify missing information, explain the next step, and help nurses prepare form responses.
- Keep legal/licensure decisions deterministic and clearly framed as process guidance—not automated approval or professional advice.
- Use structured status rules for the actual qualification percentage and eligibility gates so the demo remains reliable.

## Visual direction
- Use the supplied WEPA.care logo and brand jingle as product assets.
- Build around deep navy `#092D37`, warm ivory `#F5F2E9`, Caribbean teal `#16C9AD`, coral `#FF7563`, and white for contrast.
- Create a distinctive Puerto Rico travel-health identity: energetic, warm, credible, and not a generic hospital dashboard.
- Use bold contemporary sans-serif typography, editorial destination imagery, clear color-coded progress, and restrained motion.
- Prioritize thumb-friendly nurse screens, bottom navigation, compact gig comparison, and forms that work cleanly on phones.
- Give hospital and tourism workspaces denser desktop layouts while preserving mobile usability.

## Working MVP scope
- Lovable Cloud authentication, database, and document storage.
- Three account roles plus a judge/demo role switcher.
- Persistent nurse profiles, qualification requirements, form responses, document records, hospitals, gigs, tourism offers, package selections, applications, and status history.
- Seeded Puerto Rico hospitals, realistic gigs, tourism offers, and a demo nurse so the first screen is never empty.
- Role-aware access: partner offers and pricing are visible to hospitals and their owners, not nurses.
- Search/filtering for gigs and partner offers, competitive offer comparison, package assembly, application submission, and process tracking.
- Clear loading, empty, success, validation, and permission states.

## Core screens
- Public role entry and concise marketplace overview.
- Nurse: Home, Gigs, Gig detail, Pre-qualification, Applications, Profile.
- Hospital: Overview, Gigs, Gig editor, Partner marketplace, Package builder, Applicants.
- Tourism: Overview, Offers, Offer editor, Selection activity.
- Judge-friendly guided demo controls integrated unobtrusively.

## Technical approach
- Keep TanStack Start file-based routes, with distinct routes and metadata for each major experience.
- Use semantic design tokens for the supplied brand system and reusable controls for forms, statuses, offer comparison, and mobile navigation.
- Apply database row-level access so each organization controls its records and private tourism offers never leak into nurse queries.
- Store uploaded credential documents privately and expose only authorized access.
- Call the AI assistant only from protected server code; never send sensitive credentials or documents to the model unnecessarily.
- Add focused tests for marketplace permissions, package visibility, qualification progress, and the complete seeded demo path.

## Delivery order for the 48-hour window
1. Foundation: brand system, navigation, roles, schema, security, and seeded demo data.
2. Marketplace loop: tourism offer creation → hospital package builder → nurse gig discovery/application.
3. Pre-qualification: forms, checklist, uploads, progress, process guidance, and hospital review.
4. Demo polish: role switcher, responsive refinement, jingle moments, empty/error states, and concise judge narrative.
5. Validation: full three-role walkthrough on phone and desktop, privacy checks, build/tests, and presentation rehearsal.

## Acceptance criteria
- A judge can complete all three connected journeys without explanation or broken links.
- Tourism offers remain private from nurses until selected and presented as part of a hospital gig package.
- Nurse pre-qualification progress persists and clearly shows completed, missing, submitted, and reviewed steps.
- Hospitals can create gigs, build packages, and advance applicants.
- Tourism partners can publish and manage competitive offers.
- The nurse journey is polished at phone width with no clipped controls, overlapping text, or desktop-only interactions.
- The app uses the supplied identity consistently and communicates Puerto Rico opportunity, healthcare credibility, and Caribbean energy at first glance.
