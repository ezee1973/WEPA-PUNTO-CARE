# Travel & Tourism Partner Journey

## Goal
Give tourism partners the same full journey that nurses and hospitals have. First, sell them on joining. Then let them browse a complete directory of offers, see what's trending, and create offers that sell both the experience and the perk. Hospitals and partners will use the same offer catalog. Today the hospital builder has about 28 perks with images, but the partner page has only 4 thin samples.

## What partners will see

```text
Partner home ──> Directory ──> Trending ──> My offers ──> Create/edit offer
     │                                          │
  pitch + stats                    performance (views, saves, selections)
```

1. **Partner home (sells joining)**
   - A large image section: "Your island, their perk." It explains the affiliate model: hospitals add your offer to a gig package, nurses arrive with bookings, and you get repeat, steady customers.
   - A "how it works" strip in 3 steps, sample figures (offers live, hospitals buying, nurses matched), and a no-password demo login, just like the hospital side.
   - Partner-specific photos and pitch.

2. **Offer directory (complete catalog)**
   - Every offer from the hospital builder, plus new ones: at least 60 offers from real Puerto Rico hotels, tours, spas, beach days, food, transport and wellness partners, spread around the island.
   - Image cards with partner name, town or region, offer type (standard, limited time, special), the deal headline, retail value vs. hospital price, savings, and any requirement such as hospital signage.
   - Search plus filters for category, region/town, offer type, price, and "free to hospital."
   - A large detail view: photo, the experience pitch, the perk pitch for nurses, what's included, capacity, and terms.

3. **Trending**
   - Rankings of the offers hospitals add most to gig packages and the ones nurses choose most in their island interests.
   - Rising categories and regions. Example insight: "Mountain coffee experiences are up in the central region."
   - Gaps that point to opportunities, such as regions with hospital gigs but few offers.
   - All numbers are synthetic and labeled that way.

4. **My offers (partner dashboard)**
   - The demo partner's offers with status (draft, live, selected into a package), views, saves, hospital selections, and how many nurses each one reached.
   - Edit, pause, duplicate, or end an offer.

5. **Create offer wizard (full, image-led)**
   - Steps: experience (title, category, photo upload or a sample photo, description) → perk (nurse-facing headline, what's included) → deal (offer type, end date for limited-time offers, retail price, hospital price or free, capacity) → requirements (signage, website logo, onboarding mention) → where it's available (municipalities) → preview showing the card exactly as hospitals will see it.
   - Offers you publish appear right away in the hospital gig builder's perk menu, so the two sides stay connected.

## Rules kept
- Offers stay private to hospitals until a hospital adds them to a nurse-facing gig package.
- English/Spanish across all new screens.
- Mobile-first, same brand system as the nurse and hospital sides.
- Real company names. All prices, deals, performance numbers and trends are synthetic and labeled.

## Technical details
- Create one shared, typed offer catalog (`src/lib/partner-offers.ts`). It merges the current `PERKS` and `OFFER_PATCH` entries with the new offers and adds image, region, pitch, perk copy, and synthetic engagement stats. The hospital builder and the partner side both read from it.
- Partner-created or edited offers are stored in one local store, the same pattern as readiness and community. The hospital builder reads from that store, so new offers show up there.
- Split the tourism journey into `src/components/tourism-*.tsx` instead of growing `wepa-marketplace.tsx`.
- Reuse existing partner and hospital photos, and generate extra category images where needed.
- Add Spanish catalog entries. Add a test that partner-created offers show up in the hospital perk menu and that trending ranks are deterministic.
- Lovable Cloud tables already exist, but this demo has no real login. Moving offers to the real database can come after the demo.
