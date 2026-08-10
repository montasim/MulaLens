# MulaLens

A Chrome extension that turns [Deshi Mula](https://deshimula.com/) company pages into a focused research workspace with company identities, workplace signals, reported salaries, jobs, stories, and cited answers.

<p>
  <a href="https://github.com/montasim/MulaLens/actions/workflows/release.yml"><img alt="Release workflow" src="https://github.com/montasim/MulaLens/actions/workflows/release.yml/badge.svg"></a>
  <a href="https://github.com/montasim/MulaLens/releases/latest"><img alt="Latest release" src="https://img.shields.io/github/v/release/montasim/MulaLens"></a>
  <img alt="Manifest V3" src="https://img.shields.io/badge/Chrome-Manifest_V3-4285F4?logo=googlechrome&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white">
  <a href="https://www.supportkori.com/montasim"><img alt="Support on SupportKori" src="https://img.shields.io/badge/Support-SupportKori-FFDD00"></a>
</p>

![MulaLens research panel showing company insights](./store-assets/mulalens-1280x800.png)

**[Download the latest release](https://github.com/montasim/MulaLens/releases/latest) · [Report an issue](https://github.com/montasim/MulaLens/issues) · [Request privacy help or deletion](mailto:montasimmamun@gmail.com?subject=MulaLens%20privacy%20or%20deletion%20request)**

## Why MulaLens?

Company research often means copying an obfuscated name into several tabs, reconciling inconsistent identities, and separating community reports from verified facts. The extension keeps that workflow beside the Deshi Mula page, returns source-linked evidence from one backend boundary, and labels salary and workplace signals as research inputs rather than company policy.

## Features

- Reveals confirmed company identities behind stylized names on Deshi Mula.
- Adds a research panel beside the site instead of sending users to a separate workflow.
- Surfaces culture signals, community workplace stories, salary evidence, roles, and job links.
- Searches company stories and answers questions against available evidence with citations.
- Keeps the extension thin: company research and generated answers come from the b4join API.
- Runs only on `deshimula.com` and requests only the permissions required for its single purpose.

Salary and workplace information may be community-submitted. Treat it as research input and verify material claims independently before making employment decisions.

> **Project status:** Actively distributed through [GitHub release artifacts](https://github.com/montasim/MulaLens/releases/latest). Chrome Web Store submission instructions exist, but this README does not claim a published store listing.

## Install

### From a GitHub release

1. Download the Chrome unpacked ZIP from the [latest release](https://github.com/montasim/MulaLens/releases/latest).
2. Extract the archive.
3. Open `chrome://extensions` in Chrome.
4. Enable **Developer mode**.
5. Select **Load unpacked** and choose the extracted directory containing `manifest.json`.
6. Open or reload a page on [deshimula.com](https://deshimula.com/).

### Build from source

Requires Node.js 20.19.3 or newer and pnpm 10.

```bash
git clone https://github.com/montasim/MulaLens.git
cd MulaLens
pnpm install --frozen-lockfile
pnpm check
```

Load `dist/extension/` as an unpacked extension, then reload any open Deshi Mula tabs.
The extension has a single Chrome Manifest V3 target, so the build is intentionally
flat: `manifest.json` is written to `dist/extension/manifest.json`, with no
`.output/chrome-mv3/` intermediate directory.

## How it works

```text
deshimula.com
    │ company links
    ▼
Content script ──typed message──► Background API bridge
    │                                  │
    │ Research panel                   │ HTTPS
    ▼                                  ▼
Browser UI                         b4join API
```

The content script discovers canonical company links and renders the interface. The background service worker is the only extension component that calls `https://b4joinacompany.netlify.app/api/v1/extension`. The backend owns company search, jobs, salary evidence, generated answers, persistence, and quotas; no raw research dataset or API key is packaged in the extension.

See the [architecture documentation](./docs/ARCHITECTURE.md) for the full boundary.

## Using the research panel

1. Open a company page or listing on Deshi Mula after installing the extension.
2. Use the injected company badge to open the research panel.
3. Review identity links, workplace signals, salary evidence, jobs, and related stories returned for that company.
4. Submit a story search or an Ask question only after reviewing the retention disclosure.
5. Follow cited source links and independently verify consequential claims before acting on them.

If the panel does not appear, reload the Deshi Mula tab after installing or updating the extension. If the panel loads without research results, check that the hosted b4join API is reachable; the browser package does not contain an offline copy of the research dataset.

## Permissions and privacy

| Permission | Why it is needed |
| --- | --- |
| `storage` | Remembers whether the user accepted the disclosure shown before the first Ask request |
| `https://deshimula.com/*` | Finds company entries and renders the research panel on Deshi Mula |
| `https://b4joinacompany.netlify.app/*` | Retrieves company research and submits explicit story searches or Ask questions |

The extension does not request an account, read browsing history outside Deshi Mula, or inject remote executable code. Questions are sent only when the user submits the Ask form and accepts its retention disclosure. Privacy questions and deletion requests use the direct private email process in the policy; no Chrome Web Store listing is required.

Read the complete [privacy policy](./PRIVACY.md).

## Development

| Command | Purpose |
| --- | --- |
| `pnpm dev:web` | Run the TanStack Start landing page on `http://localhost:3000` |
| `pnpm build:extension` | Build the unpacked extension into `dist/extension/` |
| `pnpm build:web` | Build the landing page and Netlify SSR output |
| `pnpm build` | Build both workspace applications |
| `pnpm check:extension` | Run extension typecheck, lint, tests, and build |
| `pnpm check:web` | Generate routes, lint, typecheck, and build the website |
| `pnpm check` | Verify both workspace applications |

No environment variables, credentials, or local backend are required. The hosted b4join API must be available for research results and cited answers to load.

## Technology

| Area | Technology |
| --- | --- |
| Browser platform | Chrome Manifest V3 |
| Extension code | TypeScript, content script, background service worker |
| Extension interface | Browser DOM, repository-owned styles and icons |
| Product website | TanStack Start, React, shadcn, Tailwind CSS |
| API boundary | Typed HTTPS messages to the hosted b4join extension endpoint |
| Validation and tests | TypeScript, ESLint, Vitest |
| Packaging | Repository build scripts, ZIP archive, SHA-256 checksum |
| Website deployment | Netlify SSR adapter |

## Project structure

- `apps/extension/` — content script, background API bridge, contracts, tests, and extension build
- `apps/web/` — TanStack Start landing page built with shadcn and Tailwind CSS
- `docs/` — architecture, decisions, and Chrome Web Store submission guidance
- `store-assets/` — listing screenshot and promotional artwork
- `prototypes/extention/` — retained extension-interface design reference
- `prototypes/web/v1.html` — retained landing-page design reference
- `apps/web/netlify.toml` — landing-page build and deployment configuration

The web app's `netlify.toml` builds and deploys `apps/web/dist/client`, matching the workspace deployment setup used by VidQuery.

## Releases

Version tags matching `v*` trigger the [release workflow](./.github/workflows/release.yml). It installs locked dependencies, runs `pnpm check`, packages the unpacked extension, generates a SHA-256 checksum, and publishes both files to GitHub Releases.

The release archive is intended for Chrome's **Load unpacked** flow. Verify the downloaded archive against `SHA256SUMS.txt`, keep the extracted directory in a stable location, and reload the extension after replacing files during an update. See [Chrome Web Store guidance](docs/CHROME_WEB_STORE.md) for the prepared submission path; no store availability is claimed.

## Project status and limitations

- The extension is actively released through GitHub and is not claimed as published in the Chrome Web Store.
- It operates only on `deshimula.com`; unrelated pages are outside its permission boundary.
- Research, salary, workplace, and generated-answer availability depends on the hosted b4join API.
- Community reports and salary ranges are unverified and may be incomplete, stale, or context-dependent.
- Generated answers can be wrong; citations should be opened and consequential claims independently checked.
- No research dataset or backend API key is bundled, so the research panel has no offline data mode.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Privacy policy](PRIVACY.md)
- [Chrome Web Store preparation](docs/CHROME_WEB_STORE.md)
- [Architecture decision record](docs/adr/0001-use-a-thin-api-dependent-extension.md)
- [Extension prototype reference](prototypes/extention/README.md)
- [Web prototype reference](prototypes/web/README.md)

## Contributing

Issues and focused pull requests are welcome. Run `pnpm check` before submitting a change, and include an updated screenshot when the research panel changes visibly. Keep the extension/API boundary and privacy policy synchronized with any change to data handling.

The repository does not currently include separate contribution or code-of-conduct files. This section is the canonical contribution guidance until those documents are added; participation should remain respectful and protect user and source privacy.

## Support and security

Use [GitHub Issues](https://github.com/montasim/MulaLens/issues) for reproducible bugs and narrowly scoped feature requests. Avoid posting private questions, browsing details, or sensitive workplace allegations in public issues.

There is no dedicated security-policy file in this repository. Report a suspected vulnerability privately to [montasimmamun@gmail.com](mailto:montasimmamun@gmail.com?subject=Security%3A%20Deshi%20Mula%20Extended) with a minimal impact summary, then coordinate before sending exploit details or sensitive data. Do not use a public issue for vulnerabilities or retained-data requests.

## License status

No open-source license file is currently included. Source visibility alone does not grant permission to copy, modify, or redistribute the code. The release artifacts are intended for personal installation unless the repository owner states otherwise.

## Funding

If MulaLens is useful to you, you can support its continued development through [SupportKori](https://www.supportkori.com/montasim).

Bug reports, privacy feedback, citation corrections, and code contributions are equally valuable ways to help.

## Author

Built and maintained by [Montasim](https://github.com/montasim).
