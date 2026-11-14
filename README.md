# ivaikin.com

Timothy Ivaikin's personal website. The homepage is published as static English, Russian, Spanish and Chinese pages at `/`, `/ru/`, `/es/` and `/zh/`. The existing multilingual `/about/` profiles and both interview pages remain available. Pages use local fonts, with no framework or runtime dependencies.

## Purpose

Help business owners, potential partners and editors understand Timothy's work and start a relevant conversation. The primary invitation is a project discussion; writing, interviews and books provide additional context. A contact click is an expression of interest, not an accepted project or a qualified lead.

The page connects a specific professional proposition (software, IT infrastructure and coordinated delivery) with publicly attributable projects and publications. It makes no guaranteed commercial, medical or personal-development outcome claims.

## Edit, build and preview

Requires Node.js 20 or newer. No installation is needed.

```sh
npm run build
npm test
npm run preview
```

The private preview is at `http://127.0.0.1:4187/ru/`. It binds only to loopback and sends `X-Robots-Tag: noindex`; that header is not part of the published HTML.

- `content/core.mjs`: identity, English and Russian copy.
- `content/extra.mjs`: Spanish and Chinese copy.
- `content/home-evidence.mjs`: sourced cases, recommendation context and first-contact copy.
- `content/books.mjs`: catalog identities, localized book copy, excerpts and edition links.
- `content/home.mjs`: localized homepage introductions and contact prompts, reusing established profile copy.
- `content/recognition.mjs`: English and Russian recognition copy and original-photograph references.
- `scripts/build.mjs`: profile HTML and sitemap generator.
- `scripts/build-home.mjs`: homepage HTML and sitemap generator.
- `scripts/build-books.mjs`: eight owned book pages, language alternates and sitemap entries.
- `scripts/book-cards.mjs`: shared linked book cards for homepages and profiles.
- `scripts/build-recognition.mjs`: bilingual recognition article and sitemap generator.
- `assets/front/`: homepage styles, language compatibility, images and contact-click measurement.
- `assets/home/`: profile-page CSS, language-query support, portrait and local fonts.
- `assets/books/`: published covers and book-page styles.
- `assets/recognition/`: recognition-page CSS and two unchanged source photographs.
- `tests/home.test.mjs` and `tests/seo.test.mjs`: static content, metadata, identity, navigation, linked assets and preserved-page checks.
- `tests/recognition.test.mjs`: bilingual article metadata, distinct evidence photographs, stable identity, internal discovery and reproducible builds.

Run `npm run build` after editing copy. It generates four homepages, four profiles, two recognition articles and eight book pages, each with its own canonical URL and language alternates. The four generators own separate sitemap entries and preserve independent entries, including the interviews. Repeated builds do not duplicate URLs. Interview files and legacy JS/CSS are preserved.

Homepage and profile language links work without JavaScript. Legacy homepage `?lang=en|ru|es|zh` URLs are handled by the homepage compatibility script. On profile pages, the query navigates to the corresponding static profile while retaining other parameters and the fragment. Profile pages do not infer language from location or browser settings, and their wordmark links back to the homepage.

## Public-source provenance

- Founder identity and business contact: [Edge Ecosystem](https://edgeivaikin.com/).
- Product: [EdgeFocus](https://landing.edgefocus.ru/).
- The existing profile-page portrait is reused from [Timothy's public CV](https://cv.ivaikin.com/asset/img/ava-cv-desktop.jpg).
- The homepage portrait uses Timothy's user-authorized archive photograph. Publish only a mechanically resized and compressed derivative; the original file and its EXIF metadata must not be published.
- `assets/front/systems.webp` is a generated conceptual illustration. `assets/front/social.jpg` is an AI-assisted sharing composition based on the authorized portrait. Neither image documents a real client project; the visible homepage portrait remains a photographic derivative.
- Authorship: [Good Results catalog](https://www.goodwillbooks.com/good-results-art-of-efficiency-for-power-765-9781795182980.html) and [Shattering Limits on Google Play Books](https://play.google.com/store/books/details/Timothy_Ivaikin_Shattering_Limits_Self_Improvement?id=2NuiEAAAQBAJ).
- Existing [English interview](https://ivaikin.com/en/interviews/tai-chi-business/) and [Russian interview](https://ivaikin.com/ru/interviews/tai-chi-business/), including the thumbnail.
- The Nasledie Mira recognition articles at `/en/recognition/nasledie-mira-2026/` and `/ru/recognition/nasledie-mira-2026/` use two user-supplied photographs: a diploma marked 2026 and a separate letter of appreciation dated 7 October 2026. The photographs are byte-identical to the supplied JPEGs. Their metadata contains orientation, resolution, color-space and dimension fields only, with empty IPTC data; no location or capture-time data. CSS rotates the displayed originals upright. The document excerpts, captions and English translations are newly authored from these sources; evaluative wording is attributed to the publisher. Existing identity and book references are reused as separate context. The articles add a recognition record and supersede no earlier page.
- Manrope uses the SIL Open Font License, included in `assets/home/fonts/OFL.txt`.

The homepage layout and introductions are newly authored; project, publication, method and FAQ copy reuse the existing localized profiles. Public project names, publication titles and interview assets retain their provenance. The homepage supersedes the previous homepage layout and forms; the profiles and interviews remain in force. The business focus is not an exhaustive account of Timothy’s identity, relationships or life purpose. Book covers are reused from the Amazon ISBN 1795182989 image and the linked Google Play Books listing (2NuiEAAAQBAJ). The latter listing is titled Shattering Limits but its supplied cover reads The Path of Progress; the original artwork is preserved. The abstract systems visual is an illustration, not evidence of a delivered client system. No claims about corporate legal continuity are introduced.

The [homepage history and reuse record](docs/history/legacy-homepage-2026-10.md) preserves the previous version through an annotated Git tag, exact source revision, checksums and a recovery command. The follow-up reuses two source-checked professional recommendation excerpts and the old qualification questions in an optional project brief. The Russian, Spanish and Chinese pages display labelled translations with expandable English originals. The brief offers a copy button and selectable text for email or Telegram, including a manual fallback when clipboard access is denied. Recommendation dates describe the original feedback. These changes introduce no measured conversion or cash-flow claim. The `#testimonials` anchor now reaches the restored recommendations; the remaining legacy anchors retain their existing mappings.

The [November books and evidence record](docs/history/site-evidence-and-books-2026-11.md) identifies source checks, attribution boundaries, owned book routes and contact-intent measurement.

## Search and AI discovery

Each homepage and profile has indexable HTML, a self-canonical URL, reciprocal `hreflang`, localized title and description, social metadata and a `ProfilePage` identifying the same `Person`. Verified profile links appear visibly and in structured data. The recognition articles use `Article` with that same `Person` as their subject and the issuing publisher as a mentioned `Organization`; document dates are not article publication dates. Their language alternatives include only English, Russian and the English default. `robots.txt` permits crawlers and points to the sitemap, which includes four homepages, four profiles, both interviews and both recognition articles.

This is preparation for discovery, not a claim of indexing, ranking or AI citation. Google says no special AI file or schema is required for its AI features; `llms.txt` is not used as an invented ranking mechanism. The existing allow-all robots policy is unchanged.

References: [Google AI guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [Google localized pages](https://developers.google.com/search/docs/specialty/international/localized-versions), [ProfilePage](https://developers.google.com/search/docs/appearance/structured-data/profile-page), [OpenAI crawlers](https://developers.openai.com/api/docs/bots).

After deployment, inspect the real URLs and submit the sitemap through Search Console and Bing Webmaster Tools. Check effective Search Console generative AI inclusion and actual crawler access. Account verification and indexing are not performed by the local build.

## Publication

The existing GitHub Pages setup serves `main` using `CNAME` (`ivaikin.com`). A push to `main` publishes the committed website. No DNS or subdomain changes are needed. Review public copy, run build and tests, verify the HTTPS staging site, then verify the published pages after production promotion.

The homepages and profiles use direct Telegram and email links. Homepage contact paths provide optional project, partnership and media email starters; they do not submit anything automatically. The homepages retain the existing GA4 property for page views and contact clicks, with query/hash-free page locations and Google signals disabled. Contact events preserve channel, language and section, and add an allowlisted intent from explicitly labelled links; generic contacts remain general. A contact click is not a submitted inquiry, qualified lead or sale. Profiles make no third-party tracking requests on load.

The two interview pages use that same GA4 stream through the isolated `assets/interviews/tai-chi-business/interview-analytics.js`. It initializes only on their canonical production URLs. One `config` enables the initial page view; the script does not send an additional manual page view. The contact button emits `contact_click`, never a submitted-lead event. The implementation sends a query/hash-free page location, the referrer origin only, the page language and fixed public campaign labels. Google signals and advertising personalization signals are disabled. This does not remove GA4 cookies or identifiers and is not a claim of cookie-free measurement.

Interview campaign links use `utm_campaign=tai_chi_business`; the script allowlists source, medium and content values. For example, the RU Telegram announcement uses `?utm_source=telegram&utm_medium=social&utm_campaign=tai_chi_business&utm_content=announcement`. Untagged or unrecognized values are explicitly unattributed. Approved labels survive chapter navigation and the RU/EN language switch. Arbitrary query values, message contents and contact details are not included in the custom payload. Local/staged pages do not initialize this stream, and the staging packager removes the analytics script tag.

Before calling measurement operational after deployment, verify an actual page view and contact-click receipt in GA4 and check the stream's Enhanced Measurement/history settings for extra automatic events. Local tests prove this site's initialization, payload and navigation behavior; they do not prove third-party collection or receipt. See [Google page-view behavior](https://developers.google.com/analytics/devguides/collection/ga4/views) and [configuration fields](https://developers.google.com/analytics/devguides/collection/ga4/reference/config).

## Remote staging

`npm run staging` publishes the committed website to the existing HTTPS staging server. It builds, tests, packages an allowlist of public files, uploads an immutable release, atomically switches the preview, and checks all language pages, interviews, recognition articles and photographs, response headers and the live revision. It also verifies that the production homepage has not changed. No GitHub push or production deployment is involved.

The persistent preview address and SSH configuration live only in ignored `.staging/config.json`; the latest verified address and revision are in `.staging/latest.json`. The URL contains a random 192-bit capability: anyone given the full link can open it, so do not put it in this public repository. It works without the laptop or a local server. The review URL ends in `/ru/`; the preview root serves the English homepage, language roots serve their own pages, and all `/about/` profiles remain accessible. In the staged copy only, production analytics and form submission are disabled. Search indexing and caching are disabled, outgoing referrers are suppressed, and preview access paths are excluded from the shared Caddy log. Those measures supplement the secret link; they do not make it an account-based login system.

The initial configuration has `sshHost`, `sshUser`, `sshKeyPath`, `origin` and a 32-character base64url `token`. It is stored with owner-only access. Keep the token stable across updates. The installer refuses an unexpected host configuration or silent token replacement. Preview artifacts never include source files, `.git`, private configuration, production DNS configuration or the production sitemap.

Server releases are stored at `/opt/static-sites/ivaikin-staging/releases/`; `current` points to the active version. The first installation validates and gracefully reloads Caddy while preserving all unrelated configuration. Further releases switch the symlink without restarting or reloading the shared server. The installer rolls back the pointer and configuration if installation fails.

Additional installer tests: `python3 -m unittest discover -s tests -p 'test_staging_install.py'`. `tests/staging.test.mjs` covers prefix adaptation, old language links and shell-argument safety using a fake SSH executable. Review the actual HTTPS page before production promotion.

## Press room

`/press/`, `/ru/press/`, `/es/press/` and `/zh/press/` provide media contacts, source-linked releases, short biographies and text downloads. Full releases are currently English/Russian; the Spanish/Chinese room labels their linked English materials. `content/press.json` and `scripts/build-press.mjs` own these pages. The corporate-culture release records the 13 November 2026 event separately from its 14 November publication date. It reuses the organiser-approved speaker introduction, event programme and first-party photographic record; explanatory paragraphs are new editorial synthesis, not recovered speech. The existing recognition articles and interview remain in force. No private review PDF, EdgeFocus source, unsupported quote or legal-continuity claim is published. Event photo selection remains separate: no unfinished or generatively reconstructed portrait is automatically added. The press room uses existing contact routes and adds no analytics.

The press portrait reuses `assets/front/portrait.webp` unchanged from the existing public homepage. Its archive caption distinguishes it from an event photograph; no capture date or new likeness is invented.

## Russian business blog

`/ru/blog/` is the owned Russian article index. `/ru/blog/ai-enterprise-projects/` is Timothy Ivaikin’s article for industrial, oil-and-gas and banking decision makers. The static pages reuse the existing site styles and public portrait, publicly attributed portfolio cases and current Edge/EdgeFocus descriptions. New material is the enterprise decision framework and explicitly illustrative sector situations; these are not delivered-client or measured-ROI claims. The Infijoy partner/CTO attribution follows Timothy’s direct confirmation for this publication; it does not imply a legal succession or an unnamed current entity’s historical contract. Public sources are linked within the article. Earlier pages and case records remain in force.

The article has visible author/date, self-canonical and Russian language metadata, `BlogPosting`, an index entry and sitemap entries, plus discovery from the Russian homepage. It uses existing contact routes; the email starter includes a fixed article source and qualification questions. No new analytics, forms, automation, publishing schedule or guaranteed response terms are introduced. Publication/crawlability, search indexing, qualified enquiries and collected cash are separate outcomes. Edit these two static HTML pages directly; the normal build preserves them, and staging packages and verifies them.
