# Hunt ladder funnel (GA4 G-2Z5VJ13B20)

Added by S2 in `assets/front/home.js` (homepages `/`, `/ru/`, `/es/`, `/zh/`, the pages that load this script).
It shows where visitors drop off on the way from the first visit to a direct contact.
Events are sent with `gtag('event', <id>, <params>)`. If `gtag` or `IntersectionObserver` is missing, nothing happens.
No markup, text or design is changed. The E1 events (`cta_*`, `contact_click`, `form_submit`) keep working in parallel.
After a language redirect (`?lang=` or an old anchor) the script does not run on the intermediate page.

## Ladder stages (Ben Hunt, levels of awareness) and event names

| Hunt level | Event | Fires when |
| :-- | :-- | :-- |
| Unaware | `ladder_1_landing` | first page of a visit (`entry`, `landing`) |
| Problem aware | `ladder_2_problem` | `#work` (what I build) stays in view for 0.5 s |
| Solution aware | `ladder_3_solution` | the approach block (`aria-labelledby="approach-title"`) or `#ideas` stays in view |
| Product aware (proof) | `ladder_4_proof` | `#testimonials` (colleagues' words) stays in view |
| Product aware (offer) | `ladder_5_offer` | the FAQ block (`aria-labelledby="faq-title"`) stays in view |
| Most aware (intent) | `ladder_6_intent` | click on `href="#contact"` or on "copy brief" |
| Most aware (action) | `ladder_7_conversion` | click on email, personal Telegram, bot, calendar, WhatsApp, phone, or a valid form submit |
| helper | `ladder_aux_contact_view` | `#contact` stays in view |
| helper | `ladder_aux_scroll_50`, `ladder_aux_scroll_90` | 50 or 90 percent of the page height seen |
| helper | `ladder_aux_time_30s` | 30 seconds with the tab visible |

Rules:
- Each event fires once per visit. A visit is 30 minutes, kept in `sessionStorage` (`ivaikin_ladder_v1`); in memory if storage is blocked.
- A section counts only after 0.5 s in the upper 70 percent of the screen; fast scrolling does not count.
- `ladder_7_conversion` always sends `ladder_6_intent` first, so the funnel is nested. It is a proxy for a started conversation; real leads are confirmed in the inbox, Telegram and EdgeFocus. The site has no calendar link and no form today, so email and Telegram are the main conversion channels.
- Not counted as contact: LinkedIn, the channel link (`cta_channel`).
- Page order on this site is 1, 2, 4, 3, 5: proof (`#testimonials`) comes before the approach block. Event names follow the meaning of the block, not its position. In a GA4 funnel exploration use the page order of steps and make it an open funnel, or compare steps without strict order.

## Parameters

| Parameter | Values |
| :-- | :-- |
| `page_language` | `en`, `ru`, `es`, `zh` |
| `entry` (landing only) | `direct`, `search`, `social`, `messenger`, `referral`, `internal`, `campaign` (utm), `paid` (utm_medium cpc, ppc, paid) |
| `landing` (landing only) | page path |
| `section` | id of the block that was seen |
| `trigger` (intent) | `anchor`, `copy_brief`, or the channel of the contact click |
| `channel` (conversion) | `email`, `telegram`, `bot`, `calendar`, `whatsapp`, `phone`, `form` |

No URLs, mail subjects, queries or visitor input are sent. There is no A/B test on this site, so there is no `ab_hero` parameter.

## What to create in GA4

1. Admin, Events: mark `ladder_7_conversion` as a key event (optionally `ladder_6_intent`).
2. Admin, Custom definitions, event-scoped custom dimensions (name = parameter): `page_language`, `entry`, `trigger`, `channel`, `section`, `landing`. Data appears in reports about 24 hours after the dimension is created.
3. Explore, Funnel exploration, open funnel, steps in page order: `ladder_1_landing`, `ladder_2_problem`, `ladder_4_proof`, `ladder_3_solution`, `ladder_5_offer`, `ladder_6_intent`, `ladder_7_conversion`. Breakdown by `page_language` and `entry`.

## Rollback

Revert the S2 merge commit (`git revert -m 1 <merge sha>`). The build changes only the cache hash of `home.js` in the four homepages. GitHub Pages updates in 1 to 5 minutes. Tests: `tests/home-ladder.test.mjs`.
