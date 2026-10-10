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
- `content/home.mjs`: localized homepage introductions and contact prompts, reusing established profile copy.
- `scripts/build.mjs`: profile HTML and sitemap generator.
- `scripts/build-home.mjs`: homepage HTML and sitemap generator.
- `assets/front/`: homepage styles, language compatibility, images and contact-click measurement.
- `assets/home/`: profile-page CSS, language-query support, portrait and local fonts.
- `tests/home.test.mjs` and `tests/seo.test.mjs`: static content, metadata, identity, navigation, linked assets and preserved-page checks.

Run `npm run build` after editing copy. It generates the four homepages and four profiles, each with its own canonical URL and language alternates. The two generators own separate sitemap entries; both preserve independent entries, including the interviews. Repeated builds do not duplicate URLs. Interview files and legacy JS/CSS are preserved.

Homepage and profile language links work without JavaScript. Legacy homepage `?lang=en|ru|es|zh` URLs are handled by the homepage compatibility script. On profile pages, the query navigates to the corresponding static profile while retaining other parameters and the fragment. Profile pages do not infer language from location or browser settings, and their wordmark links back to the homepage.

## Public-source provenance

- Founder identity and business contact: [Edge Ecosystem](https://edgeivaikin.com/).
- Product: [EdgeFocus](https://landing.edgefocus.ru/).
- The existing profile-page portrait is reused from [Timothy's public CV](https://cv.ivaikin.com/asset/img/ava-cv-desktop.jpg).
- The homepage portrait uses Timothy's user-authorized archive photograph. Publish only a mechanically resized and compressed derivative; the original file and its EXIF metadata must not be published.
- `assets/front/systems.webp` is a generated conceptual illustration. `assets/front/social.jpg` is an AI-assisted sharing composition based on the authorized portrait. Neither image documents a real client project; the visible homepage portrait remains a photographic derivative.
- Authorship: [Good Results catalog](https://www.goodwillbooks.com/good-results-art-of-efficiency-for-power-765-9781795182980.html) and [Shattering Limits on Google Play Books](https://play.google.com/store/books/details/Timothy_Ivaikin_Shattering_Limits_Self_Improvement?id=2NuiEAAAQBAJ).
- Existing [English interview](https://ivaikin.com/en/interviews/tai-chi-business/) and [Russian interview](https://ivaikin.com/ru/interviews/tai-chi-business/), including the thumbnail.
- Manrope uses the SIL Open Font License, included in `assets/home/fonts/OFL.txt`.

The homepage layout and introductions are newly authored; project, publication, method and FAQ copy reuse the existing localized profiles. Public project names, publication titles and interview assets retain their provenance. The homepage supersedes the previous homepage layout and forms; the profiles and interviews remain in force. The business focus is not an exhaustive account of Timothy’s identity, relationships or life purpose. Book monograms and the abstract systems visual are illustrations, not book covers or evidence of a delivered client system. No claims about corporate legal continuity are introduced.

## Search and AI discovery

Each homepage and profile has indexable HTML, a self-canonical URL, reciprocal `hreflang`, localized title and description, social metadata and a `ProfilePage` identifying the same `Person`. Verified profile links appear visibly and in structured data. `robots.txt` permits crawlers and points to the sitemap, which includes four homepages, four profiles and both interviews.

This is preparation for discovery, not a claim of indexing, ranking or AI citation. Google says no special AI file or schema is required for its AI features; `llms.txt` is not used as an invented ranking mechanism. The existing allow-all robots policy is unchanged.

References: [Google AI guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [Google localized pages](https://developers.google.com/search/docs/specialty/international/localized-versions), [ProfilePage](https://developers.google.com/search/docs/appearance/structured-data/profile-page), [OpenAI crawlers](https://developers.openai.com/api/docs/bots).

After deployment, inspect the real URLs and submit the sitemap through Search Console and Bing Webmaster Tools. Check effective Search Console generative AI inclusion and actual crawler access. Account verification and indexing are not performed by the local build.

## Publication

The existing GitHub Pages setup serves `main` using `CNAME` (`ivaikin.com`). A push to `main` publishes the committed website. No DNS or subdomain changes are needed. Review public copy, run build and tests, verify the HTTPS staging site, then verify the published pages after production promotion.

The homepages and profiles use direct Telegram and email links. Homepage contact paths provide optional project, partnership and media email starters; they do not submit anything automatically. The homepages retain the existing GA4 property for page views and contact clicks, with query/hash-free page locations and Google signals disabled. A contact click is not a submitted inquiry, qualified lead or sale. Profiles make no third-party tracking requests on load. Interview functionality is unchanged.

## Remote staging

`npm run staging` publishes the committed website to the existing HTTPS staging server. It builds, tests, packages an allowlist of public files, uploads an immutable release, atomically switches the preview, and checks all language pages, interviews, response headers and the live revision. It also verifies that the production homepage has not changed. No GitHub push or production deployment is involved.

The persistent preview address and SSH configuration live only in ignored `.staging/config.json`; the latest verified address and revision are in `.staging/latest.json`. The URL contains a random 192-bit capability: anyone given the full link can open it, so do not put it in this public repository. It works without the laptop or a local server. The review URL ends in `/ru/`; the preview root serves the English homepage, language roots serve their own pages, and all `/about/` profiles remain accessible. In the staged copy only, production analytics and form submission are disabled. Search indexing and caching are disabled, outgoing referrers are suppressed, and preview access paths are excluded from the shared Caddy log. Those measures supplement the secret link; they do not make it an account-based login system.

The initial configuration has `sshHost`, `sshUser`, `sshKeyPath`, `origin` and a 32-character base64url `token`. It is stored with owner-only access. Keep the token stable across updates. The installer refuses an unexpected host configuration or silent token replacement. Preview artifacts never include source files, `.git`, private configuration, production DNS configuration or the production sitemap.

Server releases are stored at `/opt/static-sites/ivaikin-staging/releases/`; `current` points to the active version. The first installation validates and gracefully reloads Caddy while preserving all unrelated configuration. Further releases switch the symlink without restarting or reloading the shared server. The installer rolls back the pointer and configuration if installation fails.

Additional installer tests: `python3 -m unittest discover -s tests -p 'test_staging_install.py'`. `tests/staging.test.mjs` covers prefix adaptation, old language links and shell-argument safety using a fake SSH executable. Review the actual HTTPS page before production promotion.
