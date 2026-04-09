# Quiz Disqualification Rules

DQ'd leads see a "thank you" page instead of the class booking widget. They are told a coach will reach out within 24 hours. Use these rules to align GHL automations.

## Quiz Answer Keys

| Key | Question | Values |
|-----|----------|--------|
| `p` | Program interest | Dynamic per location (e.g. `kickboxing`, `muay_thai`, `brazilian_jiu_jitsu`, `kids_martial_arts`, `wrestling`, `explore`) |
| `e` | Experience | `A` = beginner, `B` = dabbled, `C` = some experience, `D` = active |
| `c` | Commitment | `A` = 2-3x/week, `B` = willing to adjust, `C` = starting slow, `D` = unsure |
| `o` | Objection | `A` = schedule, `B` = intimidation, `C` = results, `D` = cost |
| `v` | Vision | `A` = confidence, `B` = community, `C` = competition, `D` = health |
| `r` | Readiness | `A` = ready now, `B` = couple weeks, `C` = after travel, `D` = exploring |

## Hard DQ (always disqualified)

These leads are **never** routed to the booking page.

| Rule | Condition | Reason |
|------|-----------|--------|
| No program selected | `p = explore` | Not sure what they want — needs human conversation |
| Still exploring | `r = D` (exploring) | No intent to start — tire-kicker signal |
| Upcoming travel | `r = C` (after travel) | Can't attend class now — don't waste a booking slot |

## Soft DQ (2+ flags = disqualified)

These are yellow flags. One alone is fine, but **two or more** combined = DQ.

| Flag | Condition | Signal |
|------|-----------|--------|
| Unsure on commitment | `c = D` | No schedule plan |
| Cost concern | `o = D` | Price-sensitive, may not close |

## Qualified (books into a class)

Everyone else. All experience levels qualify (beginners are great customers).

## GHL Automation Alignment

- **Tag: `dq`** — apply to any lead matching the rules above
- **Tag: `dq:no_program`** — `p = explore`
- **Tag: `dq:exploring`** — `r = D`
- **Tag: `dq:travel`** — `r = C`
- **Tag: `dq:soft`** — 2+ soft flags (`c = D` + `o = D`)

### Suggested GHL workflow for DQ'd leads:
1. Do NOT send booking link
2. Assign to a coach for manual outreach within 24 hours
3. Add to nurture sequence (drip content, social proof, testimonials)
4. Re-engage after 14 days with a fresh CTA

### Qualified leads:
1. Send booking confirmation
2. Countdown / fast-pass offer if applicable
3. Day-before reminder
