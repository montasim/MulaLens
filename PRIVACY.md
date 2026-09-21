# Privacy Policy for MulaLens

Last updated: September 21, 2026

MulaLens adds company research to pages on
[deshimula.com](https://deshimula.com/) and
[betonkemon.com](https://www.betonkemon.com/), and
[trucareer.co](https://trucareer.co/). This policy explains the information
the extension handles, why it is needed, and where it is sent.

## Information the extension handles

The extension handles:

- company names and identifiers found on the supported company page you are viewing;
- company story-search terms you explicitly enter;
- questions you explicitly submit through the **Ask the evidence** feature; and
- your local choice to accept the Ask retention disclosure.

The extension does not request your name, email address, contacts, precise
location, authentication credentials, financial information, or health
information. It does not collect browsing history. When you click the toolbar
icon, it checks the current tab URL to choose the appropriate action. Content
scripts run only on the three supported sites. MulaLens does not sell user data
or use it for advertising.

## How information is used

Company identifiers are sent to the b4join research API at
`https://b4joinacompany.netlify.app/api/v1/extension` to retrieve the company
record, workplace stories, reported salary evidence, jobs, and related
research shown in the extension panel.

Story-search terms are sent to the same API only when you use story search.
Questions are sent only when you submit the Ask form. Ask questions are used
to search the available company evidence and produce a cited answer.

These uses are limited to providing the extension's single purpose: showing
company research beside Deshi Mula, Beton Kemon, and TruCareer.

## Storage and retention

Chrome local storage keeps only whether you accepted the Ask retention
disclosure. You can reset this preference in the MulaLens toolbar popup, by
removing the extension, or by clearing the extension's stored data. Resetting
the preference does not delete questions already stored by b4join.

Before the first Ask request, the extension requires you to affirmatively
accept a disclosure that b4join may store the question, cited excerpts,
answer, and an anonymous installation identifier indefinitely. The extension
does not submit an Ask request until you accept that disclosure.

Company lookup and story-search requests are processed by the b4join API. The
extension itself does not retain those requests in Chrome local storage.

## Sharing and service providers

Information is shared only as necessary to provide the features described
above:

- the b4join API receives company identifiers, story-search terms, and Ask
  questions; and
- an AI service provider used by b4join may process Ask questions and retrieved
  story excerpts to produce cited answers.

No information handled by the extension is sold or transferred to advertising
platforms or data brokers. A SupportKori page is opened only if you choose the
support link; the extension does not load SupportKori code in the page.

## Security

All information sent by the extension is transmitted over HTTPS. The
extension requests Chrome local storage access, temporary access to the
active tab when you click the toolbar icon, and access to the b4join API
needed for its features.

## Limited Use

The use of information received through Chrome APIs adheres to the
[Chrome Web Store User Data Policy](https://developer.chrome.com/docs/webstore/program-policies/policies),
including the Limited Use requirements.

## Contact

For privacy questions or deletion requests concerning information retained by
the b4join service, email
[montasimmamun@gmail.com](mailto:montasimmamun@gmail.com?subject=Deshi%20Mula%20Extended%20privacy%20or%20deletion%20request).
Use the subject **MulaLens privacy or deletion request** and include
the approximate submission date, company page, and enough of the submitted
question to locate the record. Do not send unrelated personal information.

The developer will use those details only to locate and review the retained
record, coordinate deletion with the b4join service, and confirm the outcome.
The extension does not expose the anonymous installation identifier to the
user, so it is not required in the request.

For a suspected vulnerability, use the same email with the subject
**Security: MulaLens**. Send a minimal impact summary first and
coordinate privately before sharing exploit details or sensitive data.
