# GA4 events for contact actions (G-2Z5VJ13B20)

Added by experiment E1 in `assets/front/home.js` (homepages `/`, `/ru/`, `/es/`, `/zh/`, the only pages that load GA4 with this script).
Each event is sent with `gtag('event', <name>, {page_language, section})`. If `gtag` is missing or blocked, nothing happens. No markup or design change.
Parameters are site-owned labels only: never URLs, mail subjects or visitor input. The older `contact_click` event stays and fires in parallel for email and personal Telegram links.

| Event | Fires on |
| :-- | :-- |
| `cta_calendar` | click on a `calendar.app.google` link |
| `cta_telegram` | click on a personal Telegram link (`t.me/<name>`) |
| `cta_bot` | click on a Telegram bot link (`t.me/...bot`) |
| `cta_channel` | click on the channel link (`t.me/timothy_ivaikin_ru` or an invite link `t.me/+...`, `t.me/joinchat/...`) |
| `cta_email` | click on a `mailto:` link |
| `cta_whatsapp` | click on `wa.me` or `api.whatsapp.com` |
| `cta_linkedin` | click on a `linkedin.com` link |
| `pdf_download` | click on a link to a `.pdf` file |
| `form_submit` | submit of a form after browser validation passes (the homepages have no form today; ready for later) |

Mark the events as key events in GA4 (Admin, Events, "Mark as key event"): `cta_calendar`, `cta_telegram`, `cta_email`, `cta_whatsapp`, `cta_channel`, `cta_bot`, `form_submit`.

Rollback: `git revert <commit>` of the single E1 commit; GitHub Pages updates in 1-5 minutes.

## E3: channel note (`/` and `/ru/`)

A small note in the contact block links to the Telegram channel. The link is the constant `telegramChannelUrl` in `content/home.mjs`; copy is `channelNote` and `channelLink` for `en` and `ru` (Spanish and Chinese pages have no note). A click fires `cta_channel`.
To use an invite link for this site, change only `telegramChannelUrl` and run `npm run build`. Rollback: revert the E3 commit.
