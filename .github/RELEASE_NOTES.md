## What’s new in v3.1.0

- Added MulaLens Analytics buttons to supported company listings and profiles on Beton Kemon and TruCareer, alongside Deshi Mula.
- Checks Beton Kemon identifiers and TruCareer company names against the b4join research API before showing a button. Companies without a verified match are left alone.
- Opens the same Insights, Pay & roles, Stories, and cited Ask panel on all three supported sites.
- Simplified the toolbar popup so new users can choose a company site or open research for the current company.
- Added the SupportKori control to the popup and improved the Ask panel’s consent copy and bottom footer layout.
- Fixed duplicate and misplaced buttons found during live browser checks.

The extension requests access only to Deshi Mula, Beton Kemon, TruCareer, Chrome local storage, the current tab when the toolbar is clicked, and the b4join research API.

## Install in Chrome

1. Download the Chrome ZIP and `SHA256SUMS.txt` attached to this release.
2. Place both files in the same folder and verify the archive with `sha256sum --check SHA256SUMS.txt`.
3. Extract the ZIP to a permanent folder.
4. Open `chrome://extensions`, enable **Developer mode**, and choose **Load unpacked**.
5. Select the extracted folder containing `manifest.json`, then reload any already-open supported company site tabs.

GitHub installations do not update automatically. The Chrome Web Store listing is the automatic-update option after this version is reviewed and published.
