# Homepage history: October 2026 redesign

The redesign removed material from the displayed homepage; it did not erase the source history. This record identifies that material so useful parts can be reused without treating historical marketing as verified current evidence.

## Immutable source

- Repository: [Ivajkin/ivaikin.com](https://github.com/Ivajkin/ivaikin.com).
- Snapshot: [`748dda8caa11d1a82e2be42a6c2718ac7ffab415`](https://github.com/Ivajkin/ivaikin.com/commit/748dda8caa11d1a82e2be42a6c2718ac7ffab415), the latest integrated version before the homepage launch, including the bilingual interview v4.1 release.
- [Original homepage source](https://github.com/Ivajkin/ivaikin.com/blob/748dda8caa11d1a82e2be42a6c2718ac7ffab415/index.html). Its bytes are identical to `index.html` at `a16c7789277a9b96c28b1d62d5ab0ab4187f480b`, which restored the existing homepage while placing the founder profiles on child routes.
- Redesign launch: [`68c76f734b67da80fa5c8aff333c117c882978aa`](https://github.com/Ivajkin/ivaikin.com/commit/68c76f734b67da80fa5c8aff333c117c882978aa).
- Archive tag: `homepage-before-2026-10-redesign`. The full commit above is the authoritative source, independently of tag availability.
- [Checksum manifest](legacy-homepage-2026-10.manifest.json): complete Git tree identifier plus SHA-256, byte size and Git blob identifier for seven selected source files. These checksums describe the historical commit, not the current working files.

## What changed and what can be reused

| Historical asset | State after the redesign | Reuse decision |
|---|---|---|
| Five areas of work: business architecture, technology/AI, connections, leadership and events | Dedicated pillars removed; technology, team delivery and leadership remain in the profile, method and interview content | Reuse concrete business-problem language in the project brief. The old list does not establish five currently available services. |
| Five pillar quotations and eight testimonial cards | Removed from the displayed pages; exact source remains in Git | Reuse short excerpts from two original professional recommendations verified on 2026-10-12: Oleg Nozhichkin (2024-12-10) and Mark Beseliya (2024-12-08), with dates and an original-source link. Other historical quotations require their own source check. |
| Business/role, bottleneck and budget questions in the application form | Replaced by direct contact links and project, partnership and media email starters | Reuse business/role, business bottleneck and optional free-text budget in the project brief. Add decision-maker and deadline as newly authored qualification questions; keep the existing desired-result, audience and current-stage prompts. |
| Inner Circle subscription and promised benefits | Form removed | Preserve the historical implementation. Do not revive subscription or response-time promises without an operating service that can fulfil them. |
| Experience figures, performance multipliers and organization strip | Removed | Retain as historical claims. Publish current evidence only after checking scope, date and attribution; do not turn individual feedback into a general performance guarantee. |
| Four-language content and two interview pages | Four static language homepages and profiles; interview files preserved | Retain the language routes and the interview links. Legacy language queries and anchors have compatibility handling; this does not recreate the removed sections. |
| Legacy design, scripts and analysis | Supporting files remain in the repository; old homepage markup remains in history | Preserve exact files through the snapshot and manifest. Adapt useful questions and verified sources instead of publishing the raw research again. |

The project-brief additions and source links are a reuse specification for the redesign follow-up, implemented through `content/home.mjs` and `scripts/build-home.mjs`. Their presence in this record is not evidence that a visitor used them or that an inquiry was received.

The two selected recommendations were checked against [LinkedIn's received recommendations](https://www.linkedin.com/in/timothyivaikin/details/recommendations/?detailScreenTabIndex=0). Their excerpts retain the original English wording, dates and localized original-language labels on the four homepages. LinkedIn may require sign-in to read the source. Recommendations express professional observations and opinions; they are not quantified, independently audited project results.

## Claim and measurement boundaries

Old quantitative marketing claims, quoted metrics and willingness-to-pay estimates are unverified historical claims, not current results. In particular, the original Thomas Hansen recommendation dated 2020-06-04 does not contain the old homepage's attributed 10x quotation; that claim is not reused. The original analysis is a record of earlier reasoning, not proof of sales, pricing acceptance or cash collection. This history record does not reproduce raw testimonials or personal research.

No measured conversion or free-cash-flow effect has been established for either homepage. Contact clicks show contact intent. The historical form analytics recorded submission attempts before the HTTP response; those events cannot establish that an inquiry was received. Evaluate commercial reuse against collected project contribution after delivery, acquisition, support and working-capital costs, using actual inquiries and payments separately from click counts.

## Extract the original version without changing the checkout

Run from a clone containing the source commit. The command creates a temporary directory and extracts the complete source tree there; it does not switch branches, replace working files or publish the old site.

```sh
(
  set -eu
  archive_dir="$(mktemp -d "${TMPDIR:-/tmp}/ivaikin-homepage-2026-10.XXXXXX")"
  git archive --format=tar 748dda8caa11d1a82e2be42a6c2718ac7ffab415 > "$archive_dir/source.tar"
  tar -xf "$archive_dir/source.tar" -C "$archive_dir"
  printf '%s\n' "$archive_dir"
)
```

The extracted page contains historical tracking and form endpoints. Treat extraction as source recovery; check those integrations before any interactive preview or republication.

This record and manifest are newly authored preservation metadata. They do not supersede the original snapshot, the current homepage or the retained profiles and interviews.
