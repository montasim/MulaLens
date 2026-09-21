# Chrome Web Store submission

## Version 3.1.0 update

Upload `release/MulaLens-v3.1.0-chrome-unpacked.zip` to the existing MulaLens item (`fchnnoakpkkefkpbcliooalddncffedo`) on the **Package** tab. Replace the summary and detailed description on **Store listing** with the text below, confirm the **Privacy practices** tab reflects the three supported sites and Ask behavior, then submit the update for review. The package version is `3.1.0`; do not create a separate store item.

## Store listing

**Language:** English

**Name:** MulaLens

**Summary:**

Research companies on Deshi Mula, Beton Kemon, and TruCareer with workplace stories, salaries, jobs, and cited answers.

**Detailed description:**

MulaLens places company research beside listings and profiles on Deshi Mula, Beton Kemon, and TruCareer. Open MulaLens Analytics beside a company name to view its research panel.

Inside the panel you can:

- review workplace signals and linked community stories;
- compare reported salary ranges, roles, and current job links;
- inspect the sources behind each company brief; and
- ask a focused question and read a cited answer.

The toolbar popup helps you find a supported company site or open research for the current company. On Beton Kemon and TruCareer, the button appears only where a company record has been verified against the b4join research API. Not every company on those sites has a matching record yet.

Salary and workplace information may be community-submitted. Check the original sources and confirm important claims directly. Ask is optional and requires a storage disclosure choice before the first question.

**Category:** Tools

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
deshimula.com, betonkemon.com, and trucareer.co.

**Permission justification — storage:**

Stores only whether the user accepted the disclosure required before sending
an Ask question. This prevents repeatedly requesting the same consent.

**Permission justification — activeTab:**

When the user opens the toolbar popup, checks the current tab URL to identify a
supported company page and offer the appropriate research action. This access
is temporary and does not read a list of previously visited pages.

**Host permission justification — b4joinacompany.netlify.app:**

Allows the background service worker to request company records, workplace
stories, salary evidence, job information, and cited answers from the b4join
research API.

**Content-script host justification — deshimula.com, betonkemon.com, and trucareer.co:**

Runs the extension only on these three company sites so it can identify company entries
and render the associated research panel beside the page.

**Remote code:** No. All executable extension code is packaged in the uploaded
ZIP. External sites open only after the user follows a link.

**Data types to disclose:**

- Website content: company names and identifiers found on the three supported sites.
- User-generated content: company story-search terms and questions submitted
  through Ask.

The toolbar checks only the active page URL after the user clicks the icon; it
does not collect browsing history.

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
