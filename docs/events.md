# FightCraft Funnel Events

All events that fire from the website to GHL, Slack, Amplitude, and Meta Pixel. Use this as the source of truth for building automations.

## Lead Events

### `lead_created`
Fires when a new lead opts in via any form on the site.

**Endpoint:** `POST /api/leads`
**Destinations:** GHL webhook (per location), Slack, Amplitude, Meta Pixel (`Lead`)
**Payload to GHL:**
- `name`, `email`, `phone`, `location`
- `source` — `fightcraft-web`
- `lead_source` — `website`, `meta`, `gear`, etc. (depends on form origin)
- `sid` — unique session ID for personalized links
- `tags` — none

**Dedup behavior:** Upserts by email. Returning leads update their existing record and keep the original SID.

---

## Quiz Events

### `quiz_started` / `quiz_step_answered`
Fires on every quiz answer.

**Endpoint:** `POST /api/quiz-progress`
**Destinations:** GHL webhook (per location), Amplitude
**Payload to GHL:**
- `email`, `name`, `phone`, `location`
- `source` — `fightcraft-quiz-progress`
- `quiz_step` — 0-5 (current step index)
- `quiz_step_name` — `program`, `experience`, `commitment`, `objection`, `vision`, `readiness`
- `quiz_latest_answer` — stable key value (e.g. `beginner`, `kickboxing`, `time`)
- `quiz_total_answered` — number of steps completed
- `quiz_total_questions` — 6
- `quiz_completed` — `false`
- `quiz_program`, `quiz_experience`, etc. — all answers so far as stable keys
- `tags` — `quiz-in-progress`, `quiz-step-1` through `quiz-step-6`

**Use for:** Quiz abandonment sequence. Trigger on `quiz-in-progress` tag without `quiz-completed` after X hours.

### `quiz_completed`
Fires when all 6 quiz steps are answered.

**Endpoint:** `POST /api/quiz`
**Destinations:** GHL webhook (per location), Slack
**Payload to GHL:**
- `email`, `name`, `phone`, `location`
- `source` — `fightcraft-quiz`
- `quiz_program` — slug value (kickboxing, muay_thai, brazilian_jiu_jitsu, etc.)
- `quiz_experience` — `beginner`, `dabbled`, `some_experience`, `active`
- `quiz_commitment` — `committed_2_3x`, `willing_to_adjust`, `starting_slow`, `unsure`
- `quiz_objection` — `time`, `intimidation`, `fitness_first`, `cost`
- `quiz_vision` — `confidence`, `community`, `competition`, `health`
- `quiz_readiness` — `ready_now`, `couple_weeks`, `after_travel`, `exploring`
- `tags` — `quiz-completed`, `program:xxx`, `experience:xxx`, etc.

**Use for:** Booking sequence. Trigger on `quiz-completed` tag without a booking after X hours.

---

## Funnel Events

Fire from `lib/funnel.ts` via `fireFunnelEvent(event, offer)`.

### `offer_viewed`
Fires when a known lead visits a paid landing page.

**Endpoint:** `POST /api/funnel-event`
**Destinations:** GHL webhook (per location)
**Fired from:**
- `/[slug]/web-special` — offer: `web-special-97`
- `/[slug]/fast-pass` — offer: `fast-pass-499`
- `/[slug]/early-riser` — offer: `early-riser-33`
- `/[slug]/start` — offer: `start-33`
- `/[slug]/gear-kickboxing` — offer: `gear-kickboxing`

**Payload to GHL:**
- `email`, `name`, `phone`, `location`, `sid`
- `source` — `fightcraft-web`
- `funnel_event` — `offer_viewed`
- `funnel_offer` — offer name
- `tags` — `offer_viewed`, `offer:{name}`

**Use for:** Abandoned browse sequence. Trigger on `offer_viewed` without `checkout_started` after X hours.

### `checkout_started`
Fires when a lead submits the form and is redirected to Stripe.

**Endpoint:** `POST /api/funnel-event`
**Destinations:** GHL webhook (per location)
**Payload to GHL:** Same as `offer_viewed` but with `funnel_event: 'checkout_started'`, `tags: ['checkout_started', 'offer:{name}']`

**Use for:** Abandoned checkout sequence. Trigger on `checkout_started` without purchase completion after X hours. Send them back to the offer with their SID pre-filled.

---

## Purchase Events

### `purchase_completed`
Fires on the Stripe success page.

**Destinations:** Amplitude (`purchase_completed`), Meta Pixel (`Purchase`)
**Payload:**
- `location`
- `currency` — USD (Meta Pixel)

**Note:** Stripe is the source of truth for actual payment. This fires when the client lands on the success page after Stripe redirect. For hard confirmation, use Stripe webhooks.

### `upsell_viewed` / `upsell_accepted` / `upsell_declined`
Fires on post-checkout upsell pages.

**Destinations:** Amplitude
**Fired from:**
- `/[slug]/checkout/gear` — gear upsell (wraps, basic, premium)
- `/[slug]/checkout/accelerator` — accelerator (meal plan, meal plan + coach)

---

## Booking Events

### `booking_completed`
Fires on quiz confirmation pages after GHL calendar booking.

**Destinations:** Amplitude, Meta Pixel (`Schedule`)
**Fired from:**
- `/[slug]/quiz/call-confirmed` — `booking_type: 'self'`, `type: 'call'`
- `/[slug]/quiz/class-confirmed` — `booking_type: 'self'`, `type: 'class'`, with `class_name`, `day`, `time`

### `call_booked` (server-side)
Fires from AI setters booking a call.

**Endpoint:** `POST /api/events`
**Destinations:** Amplitude (server-side)
**Use for:** Tracking which leads the AI setter converted to bookings.

---

## GHL Automation Recipes

### 1. Quiz abandonment
- **Trigger:** Tag added `quiz-in-progress`
- **Wait:** 30 minutes
- **Condition:** Contact does NOT have tag `quiz-completed`
- **Action:** Send email with SID link to `/[location]/quiz?sid={{contact.sid}}`

### 2. Did not book
- **Trigger:** Tag added `quiz-completed`
- **Wait:** 1 hour
- **Condition:** Contact has no appointment booked
- **Action:** Send email/SMS with booking link

### 3. Abandoned offer (viewed but no checkout)
- **Trigger:** Tag added `offer_viewed`
- **Wait:** 30 minutes
- **Condition:** Contact does NOT have tag `checkout_started` for the same offer
- **Action:** Send email with SID link back to offer page

### 4. Abandoned checkout (started but no purchase)
- **Trigger:** Tag added `checkout_started`
- **Wait:** 15 minutes
- **Condition:** Contact has not completed purchase (use Stripe webhook or manual status field)
- **Action:** Send urgent email with SID link back to offer page

---

## SID Personalization

All email templates should use this link format for maximum personalization:

```
https://fightcraft.com/{location}/{page}?sid={{contact.sid}}
```

When the contact clicks:
1. The SID param overrides localStorage
2. Lead data loads from the database via `/api/leads/{sid}`
3. Form fields pre-fill automatically
4. Headlines personalize with first name ("Ali, ready to save $307?")
5. The page feels "made for them"

---

## Environment Variables

All webhooks are per-location:

```
WEBHOOK_SAN_JOSE=         # Main GHL lead webhook (receives lead_created, offer_viewed, checkout_started)
WEBHOOK_MERCED=
WEBHOOK_BREVARD=

WEBHOOK_QUIZ_PROGRESS_SAN_JOSE=   # Quiz step-by-step
WEBHOOK_QUIZ_PROGRESS_MERCED=
WEBHOOK_QUIZ_PROGRESS_BREVARD=

WEBHOOK_QUIZ_COMPLETE_SAN_JOSE=   # Quiz completion
WEBHOOK_QUIZ_COMPLETE_MERCED=
WEBHOOK_QUIZ_COMPLETE_BREVARD=

WEBHOOKS_LIVE=true                # Master switch for firing webhooks
```
