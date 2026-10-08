# ivaikin.com

Timothy Ivaikin's personal website. Static HTML, local fonts, no framework or runtime dependencies.

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
- `scripts/build.mjs`: HTML and sitemap generator.
- `assets/home/`: shared CSS, legacy language redirect, portrait and local fonts.
- `tests/seo.test.mjs`: static content, metadata, identity, navigation and legacy URL checks.

Run the generator after editing copy. It writes `/`, `/ru/`, `/es/`, `/zh/` and `sitemap.xml`. Existing English and Russian interview pages are preserved verbatim. Keep the interview URL list in the generator current when adding interviews.

Old `?lang=en|ru|es|zh` links navigate to the corresponding static page while retaining other parameters and the fragment. Language is never inferred from location or browser settings. New language links work without JavaScript.

## Public-source provenance

- Founder identity and business contact: [Edge Ecosystem](https://edgeivaikin.com/).
- Product: [EdgeFocus](https://landing.edgefocus.ru/).
- Portrait reused from [Timothy's public CV](https://cv.ivaikin.com/asset/img/ava-cv-desktop.jpg); photograph is not retouched for this site.
- Authorship: [Good Results catalog](https://www.goodwillbooks.com/good-results-art-of-efficiency-for-power-765-9781795182980.html) and [Shattering Limits on Google Play Books](https://play.google.com/store/books/details/Timothy_Ivaikin_Shattering_Limits_Self_Improvement?id=2NuiEAAAQBAJ).
- Existing [English interview](https://ivaikin.com/en/interviews/tai-chi-business/) and [Russian interview](https://ivaikin.com/ru/interviews/tai-chi-business/), including the thumbnail.
- Manrope uses the SIL Open Font License, included in `assets/home/fonts/OFL.txt`.

Page copy and layout are newly authored. Public project names, publication titles, portrait and interview assets are reused. This landing replaces the previous homepage design; it does not supersede interview content or make claims about corporate legal continuity. Book monograms are navigation illustrations, not reproductions of book covers.

## Search and AI discovery

Each language has indexable HTML, a self-canonical URL, reciprocal `hreflang`, localized title and description, social metadata and a `ProfilePage` identifying the same `Person`. Verified profile links appear visibly and in structured data. `robots.txt` permits crawlers and points to the sitemap, which retains both interviews.

This is preparation for discovery, not a claim of indexing, ranking or AI citation. Google says no special AI file or schema is required for its AI features; `llms.txt` is not used as an invented ranking mechanism. The existing allow-all robots policy is unchanged.

References: [Google AI guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [Google localized pages](https://developers.google.com/search/docs/specialty/international/localized-versions), [ProfilePage](https://developers.google.com/search/docs/appearance/structured-data/profile-page), [OpenAI crawlers](https://developers.openai.com/api/docs/bots).

After deployment, inspect the real URLs and submit the sitemap through Search Console and Bing Webmaster Tools. Check effective Search Console generative AI inclusion and actual crawler access. Account verification and indexing are not performed by the local build.

## Publication

The existing GitHub Pages setup serves `main` using `CNAME` (`ivaikin.com`). A push to `main` publishes the committed website. Do not change DNS or existing subdomains for this redesign. Review public copy, run build and tests, then verify the published pages.

The new homepage uses direct Telegram and email links, with no form backend, embedded players or third-party tracking requests on load. Old homepage JS/CSS files remain at their existing paths but are not loaded by the new pages. Interview functionality is unchanged.
