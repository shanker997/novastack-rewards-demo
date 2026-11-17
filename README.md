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

Portal verification on 16 November 2026: standard CPL submission **Marlowe Ridge Consulting** showed one referral and USD 15 for the provider / GBP 11.34 for the partner. Qualified-only submission **Fenwick Studio Group** showed zero reward while New, then USD 25 / GBP 18.90 after the same referral became Qualified. An identical repeat submission created another referral rather than being deduplicated; that duplicate was marked Unqualified. The reward rules do not replace duplicate review.

The readiness-plan download is independent, local, and ungated. It does not create a lead or call any tracking action.

## Campaign destinations

Recommended destinations for new campaigns are listed below. The existing live workshop and sandbox campaigns still retain their fragment destinations because their Destination URL fields are disabled.

- CPC: `https://shanker997.github.io/novastack-rewards-demo/`.
- Workshop CPA: `https://shanker997.github.io/novastack-rewards-demo/`.
- Sandbox CPA: `https://shanker997.github.io/novastack-rewards-demo/`.
- QA-only CPA: `https://shanker997.github.io/novastack-rewards-demo/`.
- Discovery CTA: `#discovery` (inside the readiness section); its button navigates to the native standard CPL form.

Use the shared site root, without a `#fragment`, in the configured CPA campaign destination. Keep the website's internal section navigation intact: after arriving through the generated partner link, use the workshop or sandbox buttons to reach the relevant action.

Live testing found that a configured destination ending in `#workshop` or `#sandbox` redirected with attribution parameters after the fragment, for example `/#workshop?urlCode=…&aid=…&fid=…`. Completing the valid action then showed one click but zero actions and zero reward in the provider campaign. A QA-only CPA configured with the root URL placed the attribution parameters in the query string and recorded one event with a USD 0.01 reward. Destination URL is disabled in the live campaign editor, so the existing campaign URLs were not changed.

This revision adds a synchronous compatibility step **before the unchanged provider tracking loader**. For the known `workshop`, `sandbox`, and `approach` anchors, it moves a complete `urlCode` / `aid` / `fid` tuple from the fragment into the ordinary query string and retains the section anchor. It uses same-origin `history.replaceState`, with no navigation, network request, invented attribution or tracking action. Unrelated existing query text is preserved. If any attribution key already exists in the ordinary query, the URL is left untouched to avoid mixing two campaigns. Unknown anchors, incomplete or duplicate tuples, extra keys and malformed percent escapes are also left untouched.

The compatibility change has passed local tests only. Publication and fresh workshop/sandbox attribution checks in both portals are still required; do not treat a local confirmation as a verified reward. Keep the existing partner links for the retest and reset local demo actions before completing each action.

Start every attribution verification run using the partner's generated tracking link, not the direct website URL. Internal `#workshop` and `#sandbox` navigation is safe to retain because it preserves the query string already supplied by the correctly configured campaign redirect.

## Privacy and demonstration boundaries

The local workshop form requires a fictional email address ending in `.example`, and its sample button supplies a fictional record. It sends no email, books no calendar event, takes no money, and does not connect to a live CRM. CPA calls use only the registered action ID. Workshop form values are not persisted locally or transmitted by custom application code. The installed AppVentory tracking script owns its own attribution behavior. Native CPL discovery requests create records in AppVentory Channels and follow its account notification settings; the website instructs presenters to use fictional details there.

## Local checks and publication

Open through an HTTP server for a representative browser test, for example `python3 -m http.server 8080` from this directory. GitHub Pages can serve the repository's root from the `main` branch.

Before publication, verify HTML structure and JavaScript syntax. After publication, test a generated campaign link, complete the matching action, and confirm the result in both portals. Local JavaScript checks do not verify remote attribution.

## Validation completed

- HTML parser: unique IDs; all in-page links and label targets resolve.
- JavaScript syntax: passed with the local Node runtime.
- URL compatibility: 25 local cases passed, including both observed malformed URLs, normal URLs, idempotence, collision protection, unrelated query preservation, encoded values, malformed/duplicate tuples and history API failure. The exact provider loader is unchanged and follows the normalization step. Run `node test-campaign-url.cjs` from this directory.
- Mock-DOM logic checks: no attribution on load; invalid registration is blocked; exact action IDs; duplicate guard; reset; incorrect field mapping feedback; asynchronous and synchronous tracking failure; retry after failure; missing-tracker messaging; and independent download behavior. These checks do not prove remote tracking.
- Parent verified the original site's desktop layout, registration validation, mapping-error handling, three-step sandbox, download, and reset at `https://shanker997.github.io/novastack-rewards-demo/` after commit `5359eac763c55985bdd3c459e09d508b1f906188`. Browser console warnings/errors were absent. That organic-URL run did not establish campaign attribution.
- The native-CPL revision was published at HTML commit `daa9d447bf7d794898af7887e473f304c268d38b`; both exact native-form links and tracking availability were verified on the live website. The subsequent URL compatibility revision still needs publication and remote CPA retesting.
