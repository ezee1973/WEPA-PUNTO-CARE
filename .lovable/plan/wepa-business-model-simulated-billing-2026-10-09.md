# WEPA Business Model (simulated billing)

## Goal
Show judges how WEPA makes money on every side. All money is simulated with clearly labeled sample numbers. No real charges.

## Pricing (defaults, editable in one place)
- Nurses: free. WEPA keeps 8% of gross pay; nurses only ever see net pay.
- Hospitals: $12,000 per year to participate, plus 8% on nurse pay processed.
- Tourism boosts: Boost $49/mo, Featured $149/mo, Spotlight $399/mo.
- Traveler services: flights (agency fee), airport transfers (SJU, BQN, PSE), concierge add-ons (housing setup, car rental, groceries, family help).

## Nurse side
- Every gig card, gig detail, and offer shows weekly pay as net ("you take home"). Gross is never the headline.
- New "Pay" section in the Passport: upcoming and past payouts (net), schedule, payout method (sample).
- New "Travel & concierge" section: book a flight, airport pickup, and add-ons. Quote, confirm, and see bookings in a trip itinerary. Hospital-covered items show as included.

## Hospital side
- New "Billing" area in the hospital dashboard: annual membership status and renewal, invoices for nurse pay processed (gross pay + 8% fee), and total cost per nurse.
- Gig builder shows the hospital's full cost: nurse net pay, WEPA fee, and perk costs.
- Offer step on ATS shows the nurse's net pay next to the hospital's total.

## Tourism side
- "Boost" button on every My offers card, with three tiers and a simulated checkout.
- Boosted offers get a "Featured" badge and rank first in the hospital perk menu and the partner directory.
- Boost results on the offer: extra views, saves, and packages (synthetic).

## WEPA revenue view
- A small "How WEPA earns" panel on the welcome page's partner/hospital pitch, plus a revenue summary with four streams: nurse pay fee, hospital memberships, boosts, traveler services.

## Rules kept
- English/Spanish everywhere; same brand system; mobile-first on nurse screens.
- All amounts are sample data and labeled as such.

## Technical details
- New `src/lib/business.ts`: rates, `netPay(gross)`, `hospitalCost(gross)`, boost tiers, service catalog, invoice/payout generators (deterministic).
- One local store (`wepa-business-v1`) for boosts, bookings, and hospital billing, same pattern as the partner store.
- Partner catalog sorting reads boost state so boosted offers rise in both directories.
- New components: `nurse-pay.tsx`, `nurse-concierge.tsx`, `hospital-billing.tsx`, boost dialog in `tourism-partner.tsx`.
- Spanish catalog entries; tests for net/gross math, boost ranking, and booking totals.
- Record the business-model module in AGENTS.md and save prices to memory.
