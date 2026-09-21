# Architecture

```text
deshimula.com / betonkemon.com / trucareer.co
    │ company links
    ▼
Content script ──typed message──► Background API bridge
    │                                  │
    │ Research Panel                   │ HTTP
    ▼                                  ▼
Browser UI                         b4join API
```

The content script discovers Deshi Mula company links, verified Beton Kemon company links, and TruCareer company names, then renders the same Research Panel. Beton Kemon identifiers are checked against the API before a button appears; only known differing identifiers use explicit aliases. TruCareer uses its visible company name to derive a candidate API slug and verifies the returned company name before showing a button. Its UUID is used only to recognize a profile, never as the research slug. The background service worker is the only extension component that calls the b4join API.

The toolbar popup guides users from any page and can ask the content script to open the current supported company profile. Its `activeTab` access is granted when the user clicks the toolbar icon.

The b4join application owns company search, published snapshots, jobs, salary evidence, work-setup derivation, AI providers, persistence, and quotas. None of its backend implementation or raw dataset is duplicated in this repository.

The extension keeps one local preference: acceptance of the Ask retention disclosure. It has no account, setup, onboarding, or configurable API endpoint.
