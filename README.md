# ivaikin.com

Timothy Ivaikin's personal website, with a separate multilingual child landing. The existing homepage and interviews remain in place. The child pages use static HTML and local fonts, with no framework or runtime dependencies.

## Child landing purpose

Help business owners, potential partners and editors understand Timothy's work and start a relevant conversation. The primary invitation is a project discussion; writing, interviews and books provide additional context. A contact click is an expression of interest, not an accepted project or a qualified lead.

The page connects a specific professional proposition (software, IT infrastructure and coordinated delivery) with publicly attributable projects and publications. It makes no guaranteed commercial, medical or personal-development outcome claims.

## Edit, build and preview

Requires Node.js 20 or newer. No installation is needed.

```sh
npm run build
npm test
npm run preview
```

The private preview is at `http://127.0.0.1:4187/ru/about/`. It binds only to loopback and sends `X-Robots-Tag: noindex`; that header is not part of the published HTML.

- `content/core.mjs`: identity, English and Russian copy.
- `content/extra.mjs`: Spanish and Chinese copy.
- `scripts/build.mjs`: HTML and sitemap generator.
- `assets/home/`: child-page CSS, language-query support, portrait and local fonts.
- `tests/seo.test.mjs`: static content, metadata, identity, navigation and legacy URL checks.

Run the generator after editing copy. It writes only `/about/`, `/ru/about/`, `/es/about/`, `/zh/about/` and their sitemap entries. The existing homepage, its JS/CSS, interviews and all other sitemap entries are preserved. It never writes the root homepage or language-root pages.

The parent homepage keeps its existing `?lang=en|ru|es|zh` behavior. On child pages, that query navigates to the corresponding static child page while retaining other parameters and the fragment. The child pages do not infer language from location or browser settings. Their language links work without JavaScript, and the wordmark links back to the parent site.

## Public-source provenance

- Founder identity and business contact: [Edge Ecosystem](https://edgeivaikin.com/).
- Product: [EdgeFocus](https://landing.edgefocus.ru/).
- Portrait reused from [Timothy's public CV](https://cv.ivaikin.com/asset/img/ava-cv-desktop.jpg); photograph is not retouched for this site.
- Authorship: [Good Results catalog](https://www.goodwillbooks.com/good-results-art-of-efficiency-for-power-765-9781795182980.html) and [Shattering Limits on Google Play Books](https://play.google.com/store/books/details/Timothy_Ivaikin_Shattering_Limits_Self_Improvement?id=2NuiEAAAQBAJ).
- Existing [English interview](https://ivaikin.com/en/interviews/tai-chi-business/) and [Russian interview](https://ivaikin.com/ru/interviews/tai-chi-business/), including the thumbnail.
- Manrope uses the SIL Open Font License, included in `assets/home/fonts/OFL.txt`.

Page copy and layout are newly authored. Public project names, publication titles, portrait and interview assets are reused. This landing is an additional professional profile; it does not replace the homepage, supersede interview content or make claims about corporate legal continuity. Its business focus is deliberate and is not an exhaustive account of Timothy’s identity, relationships or life purpose. The broader existing site remains in force. Book monograms are navigation illustrations, not reproductions of book covers.

## Search and AI discovery

Each language has indexable HTML, a self-canonical URL, reciprocal `hreflang`, localized title and description, social metadata and a `ProfilePage` identifying the same `Person`. Verified profile links appear visibly and in structured data. `robots.txt` permits crawlers and points to the sitemap, which retains the parent homepage and both interviews.

This is preparation for discovery, not a claim of indexing, ranking or AI citation. Google says no special AI file or schema is required for its AI features; `llms.txt` is not used as an invented ranking mechanism. The existing allow-all robots policy is unchanged.

References: [Google AI guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [Google localized pages](https://developers.google.com/search/docs/specialty/international/localized-versions), [ProfilePage](https://developers.google.com/search/docs/appearance/structured-data/profile-page), [OpenAI crawlers](https://developers.openai.com/api/docs/bots).

After deployment, inspect the real URLs and submit the sitemap through Search Console and Bing Webmaster Tools. Check effective Search Console generative AI inclusion and actual crawler access. Account verification and indexing are not performed by the local build.

## Publication

The existing GitHub Pages setup serves `main` using `CNAME` (`ivaikin.com`). A push to `main` publishes the committed website. Do not change DNS or existing subdomains for this child landing. Review public copy, run build and tests, then verify the published pages.

The child pages use direct Telegram and email links, with no form backend, embedded players or third-party tracking requests on load. The original homepage continues to load its original JS/CSS and forms. Interview functionality is unchanged.

## Remote staging

`npm run staging` publishes the committed website to the existing HTTPS staging server. It builds, tests, packages an allowlist of public files, uploads an immutable release, atomically switches the preview, and checks all language pages, interviews, response headers and the live revision. It also verifies that the production homepage has not changed. No GitHub push or production deployment is involved.

The persistent preview address and SSH configuration live only in ignored `.staging/config.json`; the latest verified address and revision are in `.staging/latest.json`. The URL contains a random 192-bit capability: anyone given the full link can open it, so do not put it in this public repository. It works without the laptop or a local server. The review URL ends in `/ru/about/`; the preview root shows the original parent homepage. Old preview-only `/ru/`, `/es/` and `/zh/` links redirect to their child pages. In the staged copy only, production analytics and form submission are disabled; production source files remain unchanged. Search indexing and caching are disabled, outgoing referrers are suppressed, and preview access paths are excluded from the shared Caddy log. Those measures supplement the secret link; they do not make it an account-based login system.

The initial configuration has `sshHost`, `sshUser`, `sshKeyPath`, `origin` and a 32-character base64url `token`. It is stored with owner-only access. Keep the token stable across updates. The installer refuses an unexpected host configuration or silent token replacement. Preview artifacts never include source files, `.git`, private configuration, production DNS configuration or the production sitemap.

Server releases are stored at `/opt/static-sites/ivaikin-staging/releases/`; `current` points to the active version. The first installation validates and gracefully reloads Caddy while preserving all unrelated configuration. Further releases switch the symlink without restarting or reloading the shared server. The installer rolls back the pointer and configuration if installation fails.

Additional installer tests: `python3 -m unittest discover -s tests -p 'test_staging_install.py'`. `tests/staging.test.mjs` covers prefix adaptation, old language links and shell-argument safety using a fake SSH executable. Review the actual HTTPS page before production promotion.
