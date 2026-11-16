# NovaStack rewards demonstration

A buildless, single-file website for the internal AppVentory Channels CPC, CPA, and lead-generation demonstration. Deploy `index.html` at the root of a GitHub Pages repository. No dependencies, server, build step, API key, real customer records, or payment integration are needed.

## Implemented visitor experience

- Shared NovaStack landing page for CPC campaign destinations.
- CRM readiness workshop demo registration, with required name, fictional `.example` email, and company.
- Three-step interactive CRM migration sandbox with field validation, record review, and handoff.
- Readiness-plan request form and a useful browser-generated text download.
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

**CPL remains intentionally unconfigured until the exact product instructions are supplied.** The readiness form currently provides its download locally and clearly states that lead attribution is not configured. Do not claim it generates attributed leads yet.

## Suggested campaign destinations

- CPC: site root, `#approach`, or `#readiness`, according to the campaign story.
- Workshop CPA: `#workshop`.
- Sandbox CPA: `#sandbox`.
- CPL after integration is completed: `#readiness`.

Keep the landing page shared across campaigns. Start a verification run using the partner's generated tracking link, not the direct website URL.

## Privacy and demonstration boundaries

Forms require fictional email addresses ending in `.example`. Sample buttons supply fictional records. The site sends no email, books no calendar event, takes no money, and does not connect to a live CRM. CPA calls use only the registered action ID. Form values are not persisted locally or transmitted by custom application code. The installed AppVentory tracking script owns its own attribution behavior.

## Local checks and publication

Open through an HTTP server for a representative browser test, for example `python3 -m http.server 8080` from this directory. GitHub Pages can serve the repository's root from the `main` branch.

Before publication, verify HTML structure and JavaScript syntax. After publication, test a generated campaign link, complete the matching action, and confirm the result in both portals. Local JavaScript checks do not verify remote attribution.

## Validation completed

- HTML parser: 48 unique IDs; all in-page links and label targets resolve.
- JavaScript syntax: passed with the local Node runtime.
- Mock-DOM logic checks: no attribution on load; invalid registration is blocked; exact action IDs; duplicate guard; reset; incorrect field mapping feedback; asynchronous and synchronous tracking failure; retry after failure; missing-tracker messaging; and honest CPL pending behavior. These checks do not prove remote tracking.
- Live browser layout, GitHub deployment, and portal attribution are for the parent agent to verify after publication.
