# Nurse Community, Reviews, and Testimonials

## Goal
Create a welcoming nurse community experience where travelers can meet peers, form teams, review completed assignments, and turn approved reviews into credible testimonials. Keep all demo people, conversations, ratings, and stories explicitly synthetic.

## Experience

### 1. Nurse community
- Add a nurse-facing Community destination alongside gigs and readiness.
- Populate an image-led community from the existing synthetic nurse pool, giving featured nurses diverse, believable portrait photos.
- Provide an open community feed with posts, reactions, replies, profiles, and direct connection requests.
- Add searchable groups around Puerto Rico regions, specialties, interests, assignment dates, family travel, and first-time or shy solo travelers.
- Let nurses join groups, connect with another nurse, and start a small travel team around a gig or destination.
- Include a low-pressure “Open to a travel buddy” preference and suggested matches based on timing, location, interests, and travel style.
- Persist demo interactions locally so joins, connections, posts, and team choices survive refreshes.

### 2. Full experience reviews
- Add a guided post-assignment review covering hospital/team support, onboarding, workload, housing, location, tourism perks, sense of community, and overall experience.
- Support ratings, written highlights, practical advice, photos represented by demo thumbnails, and whether the reviewer would return or recommend the experience.
- Let the nurse save a draft, preview it, publish it, and edit or remove their own synthetic review.
- Clearly separate candidate-reported opinions from official hospital or partner claims.

### 3. Testimonial creation
- After a review is complete, offer an assisted testimonial builder that condenses the nurse’s own answers into short, medium, and social-ready versions.
- Require nurse approval before a testimonial is marked shareable; never fabricate approval or change the meaning of the review.
- Provide a preview with the nurse’s portrait, specialty, hometown, assignment location, and selected quote.
- Add copy/download actions suitable for social posts, profiles, resumes, and marketplace promotion.

### 4. Testimonial selling surface
- Add one rotating, portrait-led testimonial on the nurse home page beneath the opening section, with restrained controls and a “See more nurse stories” action.
- Build a full stories view with synthetic testimonials, profile photos, hospital/location context, ratings, filters, and expanded story dialogs with a clear close action.
- Seed enough varied stories to cover metro, rural, coastal, family, solo, first-time, and service experiences without overwhelming the primary gig journey.

### 5. Language, safety, and polish
- Add English and Spanish presentation copy for every new screen while keeping stored categories and state values canonical.
- Label synthetic/demo content honestly where needed, avoid claims that reviews are independently verified, and keep passport/licensing language unchanged.
- Preserve the existing WEPA visual system, use profile photography prominently, and verify touch behavior and readability on the current phone-sized view plus desktop.

## Technical approach
- Extend the existing deterministic synthetic nurse domain with portrait references, community posts, groups, teams, reviews, and approved testimonials.
- Keep this MVP local and fictional, following the project’s current demo persistence pattern; no real messaging service, uploads, moderation backend, or identity verification.
- Use generated portrait assets stored with the app, reusable typed data, focused community/review components, and the shared language provider.
- Add tests for review-to-testimonial creation, local persistence, canonical values across languages, and core navigation; verify the rotating story and community flows in-browser.
