# NovaStack rewards demonstration

A buildless, single-file website for the internal AppVentory Channels CPC, CPA, and lead-generation demonstration. Deploy `index.html` at the root of a GitHub Pages repository. No dependencies, server, build step, API key, real customer records, or payment integration are needed.

## Implemented visitor experience

- Shared NovaStack landing page for CPC campaign destinations.
- CRM readiness workshop demo registration, with required name, fictional `.example` email, and company.
- Three-step interactive CRM migration sandbox with field validation, record review, and handoff.
- A useful browser-generated readiness-plan text download, available without a form.
- A direct discovery CTA to the native, tracked SkyBridge CPL request form.
- Sample-data buttons, keyboard-accessible controls, responsive layouts, reduced-motion support, and local demo reset.

## Product-provided campaign integration

The exact tracking-loader snippet from **Campaigns → Generate Tracking Code** is installed in the document head. Its `uid` is the provider's public tracking identifier, not an API credential.

Registered CPA actions:

| Completed action | Exact call | Trigger |
| --- | --- | --- |
| Workshop Registration Completed | `trackify.trackEvent("workshop_registration")` | After a valid local workshop registration is completed |
| Sandbox Tour Started | `trackify.trackEvent("sandbox_tour")` | After the interactive sandbox is opened by its start button |
| QA-only action | `trackify.trackEvent("qa_tracking_check")` | Only after the explicit **Presenter notes → Run QA action** button is clicked; requires matching registered campaign action |

Actions never fire on page load. Synchronous failures and rejected returned promises clear the local duplicate guard and expose a retry button for workshop/sandbox attribution. Calls that return no result are described only as requested; remote success must still be checked in the portal. Each action is requested once per browser session to avoid accidental duplicate clicks. The **Presenter notes → Reset local demo actions** control clears only local duplicate guards and form state. It does not delete or reset any AppVentory data. Reset between separate campaign tests that share the same action ID, then reopen the intended generated campaign link. Reset also restores the sample field mappings.

The interface distinguishes a local completion, an attribution request, and a confirmed reward. This page cannot establish whether AppVentory recorded or calculated a reward; verify those in the Provider Portal.

## Native CPL discovery requests

The website's **Request a CRM discovery session → Open the discovery request** CTA links directly to the verified SkyBridge tracking URL. AppVentory Channels supplies the native request form and attribution. There is no invented lead API or custom lead-form integration.

| Demonstration | Exact generated link | Eligibility |
| --- | --- | --- |
| Standard CPL discovery | `https://api-channels.appventory.com/sp/setup/track/0Wa59AoW` | USD 15; New, Qualified, and Won referral statuses are selected |
| Qualified-only CPL | `https://api-channels.appventory.com/sp/setup/track/4-ZppakP` | USD 25 for the connected Gold Partner when Qualified |

The qualified-only link is available under **Presenter notes** for the comparison test. A New referral can increase that campaign's referral count while its reward remains zero. Use a different fictional company/contact and `.example` email for each native-form submission, then verify its resulting status and amount in both portals. The native form follows the account's notification settings.

Parent-observed verification before this website update: standard CPL submission **Marlowe Ridge Consulting** showed one referral and USD 15 for the provider / GBP 11.34 for the partner. Qualified-only submission **Fenwick Studio Group** showed one New referral and zero reward on both sides. Qualification and subsequent calculation are separate checks; this document does not claim that later test passed.

The readiness-plan download is independent, local, and ungated. It does not create a lead or call any tracking action.

## Suggested campaign destinations

- CPC: site root, `#approach`, or `#readiness`, according to the campaign story.
- Workshop CPA: `#workshop`.
- Sandbox CPA: `#sandbox`.
- Discovery CTA: `#discovery` (inside the readiness section); its button navigates to the native standard CPL form.

Keep the landing page shared across campaigns. Start a verification run using the partner's generated tracking link, not the direct website URL.

## Privacy and demonstration boundaries

The local workshop form requires a fictional email address ending in `.example`, and its sample button supplies a fictional record. It sends no email, books no calendar event, takes no money, and does not connect to a live CRM. CPA calls use only the registered action ID. Workshop form values are not persisted locally or transmitted by custom application code. The installed AppVentory tracking script owns its own attribution behavior. Native CPL discovery requests create records in AppVentory Channels and follow its account notification settings; the website instructs presenters to use fictional details there.

## Local checks and publication

Open through an HTTP server for a representative browser test, for example `python3 -m http.server 8080` from this directory. GitHub Pages can serve the repository's root from the `main` branch.

Before publication, verify HTML structure and JavaScript syntax. After publication, test a generated campaign link, complete the matching action, and confirm the result in both portals. Local JavaScript checks do not verify remote attribution.

## Validation completed

- HTML parser: unique IDs; all in-page links and label targets resolve.
- JavaScript syntax: passed with the local Node runtime.
- Mock-DOM logic checks: no attribution on load; invalid registration is blocked; exact action IDs; duplicate guard; reset; incorrect field mapping feedback; asynchronous and synchronous tracking failure; retry after failure; missing-tracker messaging; and independent download behavior. These checks do not prove remote tracking.
- Parent verified the original site's desktop layout, registration validation, mapping-error handling, three-step sandbox, download, and reset at `https://shanker997.github.io/novastack-rewards-demo/` after commit `5359eac763c55985bdd3c459e09d508b1f906188`. Browser console warnings/errors were absent. That organic-URL run did not establish campaign attribution.
- This native-CPL website revision still needs publication and a live CTA check. The native CPL form behavior was separately verified by the parent as described above.
