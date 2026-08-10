# Chrome Web Store submission

## Store listing

**Language:** English

**Name:** MulaLens

**Summary:**

See company culture signals, reported salary ranges, workplace stories, and
cited answers on Deshi Mula.

**Detailed description:**

MulaLens adds focused company research directly beside company
entries on deshimula.com.

Use it to:

- reveal confirmed company names;
- review workplace culture signals and community stories;
- compare reported salary ranges and roles;
- check sourced job and careers links; and
- ask questions about the available evidence and receive answers with
  citations.

The extension works only on deshimula.com. Company research is supplied by the
b4join API. Salary and workplace information may be community-submitted and
should be verified independently before making employment decisions.

The Ask feature is optional. Before the first Ask request, the extension
explains what will be stored and requires your consent.

**Category:** Productivity

**Homepage URL:** https://github.com/montasim/MulaLens

Leave **Official URL** empty unless a site you control has already been
verified in Google Search Console and appears in the dashboard dropdown.

**Support URL:**
https://github.com/montasim/MulaLens/issues

**Privacy policy URL:**
https://github.com/montasim/MulaLens/blob/main/PRIVACY.md

Provide a 128×128 store icon, at least one clear 1280×800 screenshot showing
the extension panel open on deshimula.com, and a 440×280 small promo tile. A
1400×560 marquee tile is optional. Do not include private browser data.

Ready asset:
`store-assets/mulalens-1280x800.png`

Ready small promo tile:
`store-assets/small-promo-tile-440x280.png`

## Privacy

**Single purpose:**

Show company research—including culture signals, workplace stories, reported
salary evidence, jobs, and cited answers—beside company entries on
deshimula.com.

**Permission justification — storage:**

Stores only whether the user accepted the disclosure required before sending
an Ask question. This prevents repeatedly requesting the same consent.

**Host permission justification — b4joinacompany.netlify.app:**

Allows the background service worker to request company records, workplace
stories, salary evidence, job information, and cited answers from the b4join
research API.

**Content-script host justification — deshimula.com:**

Runs the extension only on deshimula.com so it can identify company entries
and render the associated research panel beside the page.

**Remote code:** No. All executable extension code is packaged in the uploaded
ZIP. External sites open only after the user follows a link.

**Data types to disclose:**

- Website content: company names and identifiers found on deshimula.com.
- Web history: the extension detects that the user is viewing a deshimula.com
  page in order to run its single-purpose interface.
- User-generated content: company story-search terms and questions submitted
  through Ask.

Do not select personally identifiable information, health information,
financial and payment information, authentication information, personal
communications, location, or user activity unless the service behavior changes
to collect them.

Certify all three Limited Use statements only after confirming that the
published privacy policy and backend behavior remain consistent with these
answers.

## Distribution

Build the upload contents with `pnpm build:extension`. Package the contents of
`dist/extension/` so `manifest.json` is at the ZIP root; do not add an
`.output/chrome-mv3/` directory to the archive.

Choose **Public** only when the listing, privacy policy, support contact, and
screenshots are ready. Select the countries where the extension should be
available. The extension is free and does not contain paid functionality.

For the first submission, use deferred publishing if you want to inspect the
approved listing before making it public.

## Test instructions

1. Install the extension and open https://deshimula.com/.
2. Open a page or list containing company entries.
3. Select a company entry to open the MulaLens research panel.
4. Review the Brief, Stories, and Pay & roles views.
5. Open Ask, enter a question, accept the retention disclosure, and submit it.

No account or test credentials are required. The b4join API must be available
for research results and cited answers to load.
