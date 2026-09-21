# TruCareer integration plan

Research basis: [TruCareer UI findings](./TRUCAREER_RESEARCH.md), the extension source in `apps/extension`, and the live MulaLens extension API checked on 2026-09-21. The core integration described here is implemented in MulaLens 3.1.0; the coverage audit remains a future data task.

## Goal and boundary

Show the existing **MulaLens Analytics** button on supported TruCareer company rows and profiles. Clicking it opens the same MulaLens research panel used on Deshi Mula and Beton Kemon, with the same company data, source labels, loading states, and Ask consent flow. TruCareer's salary and interview counts remain TruCareer data; the panel must not imply that its MulaLens snapshot is a live copy of TruCareer.

The button should appear only when the TruCareer company is verified to map to a MulaLens company record. A TruCareer company without a verified match stays browsable normally. The toolbar popup should explain when no MulaLens record is available.

## What the research established

- Home and directory company links use `/company/<UUID>?tab=salaries`, and profiles use `/company/<UUID>` with an `h1` company name. The UUID cannot be sent as a MulaLens company slug. The visible company name is the matching input.
- The directory has search, sort, and pagination that update the page without a full navigation. Company rows are links, so an injected button must be a sibling rather than a child of the link.
- The public directory listed 370 companies on 2026-09-21. That count is not MulaLens coverage.
- A spot check of prominent names against the [MulaLens company batch endpoint](https://b4joinacompany.netlify.app/api/v1/extension/companies?slugs=bkash,recover,mir-info-systems,vivasoft-limited,vivasoft,pathao,standard-mh-group,enosis-solutions,brain-station-23,neural-semiconductor-limited,manarat-int-school-and-college) returned `bkash`, `vivasoft`, `pathao`, `enosis-solutions`, and `brain-station-23`. The tested identifiers `recover`, `mir-info-systems`, `vivasoft-limited`, `standard-mh-group`, `neural-semiconductor-limited`, and `manarat-int-school-and-college` did not return records. A missing identifier is not proof that a company is absent under another canonical slug.
- The current API does not search by name: `query` and `name` parameters on `/companies` returned empty results for Brain Station 23, and `/company?name=...` requires a slug. The extension must derive a candidate slug from the visible name and verify the returned record, or the backend must add a name resolver.

## Implementation sequence

1. **Resolve from the visible name.** Read the company-name element in each directory/home row and the profile `h1`. Normalize Unicode, trim spaces, and derive a lowercase hyphenated slug candidate from letters and digits without discarding meaningful words. For example, `Brain Station 23` → `brain-station-23` and `bKash` → `bkash`. Batch-request those candidates through `/companies?slugs=`. Accept a result only when its canonical `name` or `sourceName`, after conservative case/space/punctuation normalization, equals the visible TruCareer name. Do not use a fuzzy best match or silently strip `Ltd`, `Limited`, `Group`, or similar identity-bearing terms.
2. **Handle genuine name differences.** For a company such as `Vivasoft Limited`, whose derived `vivasoft-limited` candidate is absent while `vivasoft` exists, add a small reviewed visible-name → canonical-slug alias only after confirming both records describe the same employer. Keep unmatched and ambiguous names unlinked. Use TruCareer's UUID only to cache the resolved result while the page changes; do not require a full UUID crosswalk.
3. **Add a TruCareer site adapter.** Add strict URL parsing for `https://trucareer.co/company/<UUID>` (and verified `www` behavior if observed). On home and `/companies`, find company links and their visible name elements. On profile pages, read the `h1`. Ignore nested role pages. Reuse the existing `Identity` and `ResearchPanel`; never pass a TruCareer UUID or an unverified derived slug to `/company?slug=`.
4. **Verify before rendering.** Cache confirmed name matches for the page session, retry transient API failures, and guard against stale responses after search, pagination, tab changes, or navigation. Insert one button per visible verified row/profile and remove stale buttons when the site changes content. If the user opens the toolbar on an unmatched profile, explain that MulaLens has no confirmed research match.
5. **Place and style the action.** Reuse the shared logo and **MulaLens Analytics** button dimensions, typography, color, and focus treatment. Put the directory button in its own space beside the company information without covering counts or changing row navigation. Put the profile button in the company header without interfering with Follow. Check desktop and narrow layouts in the browser.
6. **Update the toolbar and permissions.** Add the TruCareer origin to content-script matches and to the logo's web-accessible-resource matches. Teach the popup to recognize TruCareer directory and profile routes, open the current company's panel when verified, and offer TruCareer as a starting site from unsupported pages. Keep backend host permissions unchanged.
7. **Update user-facing material.** Revise README, architecture, privacy policy, and store listing copy to include TruCareer and explain that MulaLens research is available only for verified matches. Preserve clear MulaLens attribution in the panel and avoid presenting TruCareer data as MulaLens data.

## Verification and release gates

- Unit-check strict URL parsing, name normalization, exact-name verification, unmatched/ambiguous records, and reviewed aliases.
- Run the extension's typecheck, lint, tests, build, and diff check.
- In the installed Chrome extension, check home, directory search, sort, pagination, matched and unmatched rows, profile salary/interview tabs, route changes, and a role page. Confirm one button, correct company panel, normal row navigation, and no overlapping TruCareer controls on desktop and narrow widths.
- Check popup actions from a matched profile, unmatched profile, directory, and unsupported tab. Check API failure and slow-response states.
- Before release, report measured coverage as **verified matches / TruCareer companies audited**. Do not claim all TruCareer companies have the same research details unless the API coverage and identity audit establish that.

## Dependency

Complete the name-match coverage audit before promising a button for every TruCareer company. Filling missing MulaLens research records is a separate backend/data task; the extension can display only what the API returns. A future backend name-resolution endpoint can replace extension-side candidate generation if verified coverage needs to grow beyond exact matches and reviewed aliases.
