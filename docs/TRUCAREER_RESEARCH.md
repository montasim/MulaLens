# TruCareer company UI research

Observed on 2026-09-21 using the public site in Chrome and its returned HTML. The site content and counts can change.

## Public company flows

- The [home page](https://trucareer.co/) has a company search and a top-ten company list. Its company rows link to `/company/<UUID>?tab=salaries`.
- The [full directory](https://trucareer.co/companies) lists ten companies per page, with search, sort, and pagination. Search updates the URL to `/companies?q=<query>` while the user types; sort adds `sort=name_asc` or `sort=name_desc`, and pagination uses `page=<number>`. The list updates client-side, so an extension must handle nodes changing after initial load. Each listed company has reported salary or interview data, according to the directory heading.
- A [company profile](https://trucareer.co/company/ad16199b-9cac-48e6-bbe1-5da23acbe93e?tab=salaries) uses `/company/<UUID>` rather than a company slug. `tab=salaries` and `tab=interviews` switch profile sections. Role details live below `/company/<UUID>/role/<UUID>`. The company name is an `h1` in the profile header; the header also contains a Follow control. The research button should use the profile `h1` and avoid treating role pages as separate companies.
- Example public identifiers: bKash is `ad16199b-9cac-48e6-bbe1-5da23acbe93e`; [Brain Station 23](https://trucareer.co/company/b315831a-4e42-4fbb-82dd-319356598d71?tab=salaries) is `b315831a-4e42-4fbb-82dd-319356598d71`. These UUIDs are TruCareer identifiers, not MulaLens API slugs.

## DOM and placement observations

- On [home](https://trucareer.co/) and [directory](https://trucareer.co/companies), each company row is an entire `a[href^="/company/"]`. Its `aria-label` combines company name and entry count, e.g. `bKash, 36`. The visible name is a descendant `span.truncate.text-\[15px\].font-semibold.text-ink`; the parent name wrapper is `span.flex.min-w-0.items-center.gap-2`. The row has a logo at left, data-depth and entry columns at right. The row becomes a grid below 680 px. A separate button must not be nested inside this link; use a sibling or another valid placement while preserving row navigation and responsive columns.
- On the [profile](https://trucareer.co/company/ad16199b-9cac-48e6-bbe1-5da23acbe93e?tab=salaries), `main h1` is the company name. The `h1` sits in a flexible header beside the logo; the Follow button is another child of that header. There is room for a button near the name on desktop, but mobile placement needs visual checking.
- Company names are not necessarily identical to MulaLens canonical names: the current pages display `bKash` and `Brain Station 23`, while TruCareer URLs provide only UUIDs. The visible name can be used to derive a candidate slug, then verified against the MulaLens API response. Names that differ materially require a reviewed alias. The UUID must not be sent as the MulaLens slug.

## Scope and limitations

- The public pages can be browsed without login. Follow redirects to or requires login; the research action should be independent of Follow. The directory showed 370 companies, 945 salary entries, and 95 interview entries at observation time. These are TruCareer counts, not MulaLens coverage.
- The returned HTML contains server-rendered rows and profile headings, while browser interaction showed client-side URL and list updates. Stable selectors should rely on route shape, link `href`, and semantic heading rather than Tailwind class strings.
- This research establishes UI routes and candidates for matching. It does not establish that the MulaLens API covers every TruCareer company or that similarly named records refer to the same employer. That coverage requires a separate API audit before showing a research button for each company.
- The current [MulaLens extension API](https://b4joinacompany.netlify.app/api/v1/extension/companies?slugs=brain-station-23) resolves canonical slugs. On 2026-09-21, `/companies?query=Brain%20Station%2023` and `/companies?name=Brain%20Station%2023` returned empty `items`, while `/company?name=Brain%20Station%2023` rejected the request because a slug is required. Name-based search is therefore not currently available through this API contract.
