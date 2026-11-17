# NovaStack rewards demonstration

A buildless website for internal AppVentory Channels CPC, CPA, CPL and Referral Program demonstrations. Deploy `index.html` at the root of a GitHub Pages repository. No dependencies, server, build step, API key, real customer records, or payment integration are needed.

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

Actions never fire on page load. Synchronous failures and rejected returned promises clear the local duplicate guard and expose a retry button for workshop/sandbox attribution. Calls that return no result are described only as requested; remote success must still be checked in the portal. Each action is requested once per browser session to avoid accidental duplicate clicks. The **Presenter notes → Reset local demo actions** control clears only local duplicate guards and form state. It does not delete or reset any AppVentory data. Reset also restores the sample field mappings. Clearing these guards can allow another recorded action and reward: the live Workshop check recorded a second action after an explicit reset and identical valid registration. Use the QA campaign for repeat checks. When an intentional separate campaign test requires a reset, reopen that campaign’s generated link before proceeding.

The interface distinguishes a local completion, an attribution request, and a confirmed reward. This page cannot establish whether AppVentory recorded or calculated a reward; verify those in the Provider Portal.

## Native CPL discovery requests

The website's **Request a CRM discovery session → Open the discovery request** CTA links directly to the verified SkyBridge tracking URL. AppVentory Channels supplies the native request form and attribution. There is no invented lead API or custom lead-form integration.

| Demonstration | Exact generated link | Eligibility |
| --- | --- | --- |
| Standard CPL discovery | `https://api-channels.appventory.com/sp/setup/track/0Wa59AoW` | USD 15; New, Qualified, and Won referral statuses are selected |
| Qualified-only CPL | `https://api-channels.appventory.com/sp/setup/track/4-ZppakP` | USD 25 for the connected Gold Partner when Qualified |

The qualified-only link is available under **Presenter notes** for the comparison test. A New referral can increase that campaign's referral count while its reward remains zero. Use a different fictional company/contact and `.example` email for each native-form submission, then verify its resulting status and amount in both portals. The native form follows the account's notification settings.

Portal verification on 16 November 2026: standard CPL submission **Marlowe Ridge Consulting** showed one referral and USD 15 for the provider / GBP 11.34 for the partner. Qualified-only submission **Fenwick Studio Group** showed zero reward while New, then USD 25 / GBP 18.90 after the same referral became Qualified. An identical repeat submission created another referral rather than being deduplicated; that duplicate was marked Unqualified. The reward rules do not replace duplicate review.

On 17 November, a controlled status check temporarily changed Marlowe Ridge Consulting from New to Unqualified. The campaign retained USD 15 / GBP 11.34 after two reloads; the expected decrease was not observed. The referral was restored to New, with the provider still at USD 15 and the latest partner display at GBP 11.37. This is an unresolved status-retention diagnostic, not a passed exclusion test: whether prior CPL accrual changes with a later status, and which supported recalculation applies, remain unverified. Partner currency displays can change between observations.

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

The compatibility change was published at HTML commit `558f1d0f5197c7b892459f91c1c2fa4dbb977553` (README commit `557173b74d129b411657f015bbc63ed27ed349b9`). Live testing on 17 November 2026 confirmed the Workshop campaign URL normalized into the ordinary query string before its `#workshop` anchor. Page arrival, an empty registration attempt and the wrong QA action left the campaign at two clicks, one unique click, zero actions and USD 0. A valid matching registration then recorded one action with USD 10 in the Provider Portal and GBP 7.58 in the Partner Portal.

An explicit **Reset local demo actions** followed by the same valid registration recorded a second action: cumulative USD 20 / GBP 15.16. The session guard prevents accidental repeated requests; it is not backend deduplication or one-reward-per-person enforcement. Keep intentional repeat checks in the QA campaign.

The Sandbox matching-action check also passed: one recorded action showed USD 6 in the Provider Portal and GBP 4.55 total in the Partner Portal. Its displayed unit amount was GBP 4.54; retain the observed distinction between unit display and aggregate rather than assuming exact equality. An initial GBP 0 partner display resolved on refresh as the result updated asynchronously; no configuration change was needed. An intentional reset and second Sandbox start recorded two cumulative actions: USD 12 / GBP 9.10. The same per-action repeat limitation applies.

Start every attribution verification run using the partner's generated tracking link, not the direct website URL. Internal `#workshop` and `#sandbox` navigation is safe to retain because it preserves the query string already supplied by the correctly configured campaign redirect.

## Verified CPC and CPA core checks

Six campaign/reward pairs completed their core functional checks for the connected SkyBridge Gold partner on 17 November 2026, with the limits below. These are campaign observations, not payout receipts or a claim that every reward type and edge case has passed.

| Campaign | Reward setup | Latest verified campaign totals | Provider / partner reward |
| --- | --- | --- | --- |
| NovaStack Website Discovery - SkyBridge | NovaStack Enablement - Partner Traffic | 2 clicks / 1 unique | USD 0.50 / GBP 0.38 |
| NovaStack Tier Traffic - SkyBridge | NovaStack CPC - Partner Tier Traffic | 2 clicks / 1 unique | USD 0.40 / GBP 0.30 |
| QA - NovaStack Click Attribution | QA - NovaStack CPC Click Control | 2 clicks / 1 unique | USD 0.01 / GBP 0.01 |
| NovaStack CRM Workshop - SkyBridge | NovaStack CPA - Workshop Registration | 2 clicks / 1 unique / 2 actions | USD 20 / GBP 15.16 |
| NovaStack Guided Sandbox - SkyBridge | NovaStack CPA - Sandbox Engagement | 2 clicks / 1 unique / 2 actions | USD 12 / GBP 9.10 |
| QA - NovaStack Action Attribution | QA - NovaStack CPA Action Control | 3 clicks / 2 unique / 2 actions | USD 0.02 / GBP 0.02 |

For all three CPC campaigns, the first generated-link visit recorded one total and one unique click with the configured reward. A repeat visit raised total clicks to two while unique clicks and reward stayed unchanged. A later direct, untracked website visit left counters and rewards unchanged in both portals. Other partner tiers and long-term attribution windows remain untested.

Workshop and Sandbox matching actions and intentional repeats were verified in both portals. Page visits and nonmatching actions produced zero actions/reward in the provider negative-control readback; those zero-result controls were not separately confirmed in the Partner Portal. Sandbox earns for **Tour Started**; mapping validation and handoff completion are separate website demonstrations, not reward prerequisites. Both deliberate resets allowed another recorded action and reward. The shared local duplicate guard was also exercised through an immediate QA button repeat, which made no additional request; no backend duplicate suppression is claimed.

The QA action regression reached two actions at USD 0.02 / GBP 0.02. Its three total clicks and two unique clicks are the observed counts; the additional click/unique count relative to the earlier baseline has no established cause. Partner unit displays can differ from accrued totals: Workshop displayed GBP 7.56 per action while its first total was GBP 7.58; Sandbox displayed GBP 4.54 while its first total was GBP 4.55. An initially zero Sandbox partner total updated on refresh without a configuration change.

These core checks do not verify payout approval or transfer, all tier branches, every attribution edge case, or the separate standard reward calculations. Campaign detail and Estimated Rewards can also differ: after Sandbox campaign detail reached USD 12, its estimate still showed USD 6. Estimate refresh and source-contribution behavior remain unresolved, so a campaign total should not be presented as a refreshed estimate or payment.

## Privacy and demonstration boundaries

The local workshop form requires a fictional email address ending in `.example`, and its sample button supplies a fictional record. It sends no email, books no calendar event, takes no money, and does not connect to a live CRM. CPA calls use only the registered action ID. Workshop form values are not persisted locally or transmitted by custom application code. The installed AppVentory tracking script owns its own attribution behavior. Native CPL discovery requests create records in AppVentory Channels and follow its account notification settings; the website instructs presenters to use fictional details there.

## Local checks and publication

Open through an HTTP server for a representative browser test, for example `python3 -m http.server 8080` from this directory. GitHub Pages can serve the repository's root from the `main` branch.

Before publication, verify HTML structure and JavaScript syntax. After publication, test a generated campaign link, complete the matching action, and confirm the result in both portals. Local JavaScript checks do not verify remote attribution.

Published follow-ups: referral reset wording at `3a7d3f13220ea3b3521e120bf64e43de669bfd4a`, the portable URL suite at `d1938cc84390c2586337266aeaab7ef55a575d87`, and the portable referral suite at `a5a4cd502cfd441cecf62dd80f2ca75e382ffebb`. Run the tests locally with Node; their passing results do not establish remote reward calculation.

## Validation completed

- HTML parser: unique IDs; all in-page links and label targets resolve.
- JavaScript syntax: passed with the local Node runtime.
- URL compatibility: 25 local cases passed, including both observed malformed URLs, normal URLs, idempotence, collision protection, unrelated query preservation, encoded values, malformed/duplicate tuples and history API failure. The exact provider loader is unchanged and follows the normalization step. Run `node test-campaign-url.cjs` from this directory.
- Mock-DOM logic checks: no attribution on load; invalid registration is blocked; exact action IDs; duplicate guard; reset; incorrect field mapping feedback; asynchronous and synchronous tracking failure; retry after failure; missing-tracker messaging; and independent download behavior. These checks do not prove remote tracking.
- Live testing verified the original site's desktop layout, registration validation, mapping-error handling, three-step sandbox, download, and reset at `https://shanker997.github.io/novastack-rewards-demo/` after commit `5359eac763c55985bdd3c459e09d508b1f906188`. Browser console warnings/errors were absent. That organic-URL run did not establish campaign attribution.
- The native-CPL revision was published at HTML commit `daa9d447bf7d794898af7887e473f304c268d38b`; both exact native-form links and tracking availability were verified on the live website. The subsequent URL compatibility revision is published; Workshop event and reward attribution passed live checks. Sandbox event and reward attribution also passed; its intentional repeat check observed repeated per-action accrual, with the limitation described above.

## Referral Program discovery landing page

`referral-discovery.html` is a separate, shared prospect landing page for the Referral Program demonstrations. It uses the same NovaStack visual style, a CRM discovery story and a return link to the main demo site. The page was published at HTML commit `41d7a8b4bc9b0a88a0f8ef7506ced156c39eb3a7` with README commit `053a5c3a4fd7eec5ab995c0db92ea6bc4c2c8456`. The live form, required-email validation, rejection of a non-`.example` address and tracking-function availability were verified. Those initial checks made no prospect submission. A later live test used the generated SkyBridge link `https://novastacksoftware.coachbar.info/0LQJxeKZ`, which redirected to this page with `?urlCode=0LQJxeKZ`. Alder Quay Operations was created as provider referral NS-ST-16 with Source Referral Program, SkyBridge as partner and Customer Success as owner. The Partner Portal showed Nadia Iqbal as New, Not Eligible and GBP 0. Provider qualification was saved, but the immediate partner reward remained zero. The later Won state and linked deal are included in the final test results below; reward calculation remains unresolved.

The integration comes directly from **Guide to make Referral program up & running → Steps for tracking referrals**. It installs the exact `embeddingwidget.js` snippet with provider UID `41d3be53-08c8-496c-ba31-6d3455d02511`, then calls `trackify.trackLead(formData)` only after an intentional, valid form submission. This separate page does not load `cts.js`, call CPA actions, render a referral widget, invent a callback contract, or interpret attribution parameters. The SDK receives the original landing URL unchanged.

The only submitted fields are the documented `email`, `firstName`, `lastName` and `companyName`. Email is required and must end in `.example`; the other fields are optional and omitted when blank. **Use sample prospect details** fills Nadia Iqbal at Alder Quay Operations (`nadia@alderquay.example`). Use new fictional details for each distinct referral. Custom page code does not persist contact values, send email, book meetings or collect payment. Recorded referrals follow the provider's portal settings.

The page distinguishes tracking capability from an actual recorded referral. A completed local call displays **Referral tracking requested**, with a direction to verify the matching record, partner, status and reward in both portals. It does not infer a remote success response. Missing tracking capability sends nothing; synchronous failures or rejected promises show an explicit retry and warn that the remote outcome is unknown, so a retry could duplicate a referral. There is no automatic retry.

An in-flight request blocks additional submissions and resets. A session guard prevents accidental repeat requests after the call completes, with a memory fallback when storage is blocked. **Presenter notes → Reset local referral request for QA** explicitly warns that another submission can create another referral and reward; it does not clear portal records. Use dedicated test contacts for intentional repeat checks. The guard is shared across visits to this page, so switching to a second program for an intentional test may require this reset followed by that program's generated link.

Local validation: 23 mock-DOM and integration-contract checks passed, covering the exact single loader, all inline script syntax, no automatic tracking, invalid and valid fictional email input, the four-field contract, optional fields, tracker unavailability and later retry, method context, synchronous/asynchronous failures, pending request guards, session reload, storage failures, explicit reset, unknown response values and unchanged URLs. HTML checks confirmed unique IDs and valid in-page and label targets. The live form renders and its required-email, non-`.example` rejection and tracking-capability checks passed. Generated custom-program link attribution and the first actual referral were verified as described above. A reload kept the request form disabled with the existing-session guard. All five program-source submissions are now attributed and verified. Reward calculation remains unresolved as detailed below. Run `node test-referral-discovery.cjs` for the portable local suite. The dedicated-test-contact wording and both portable test files are published at the commits listed above.


The provider now has three Live programs, each with SkyBridge as its sole participant:

| Program | Generated link | Assigned rewards |
| --- | --- | --- |
| NovaStack Partner Referral Program | https://novastacksoftware.coachbar.info/0LQJxeKZ | Qualified Discovery USD 50; Closed-Won 10%; Two Customer Wins USD 200 |
| NovaStack Growth Referral Program | https://novastacksoftware.coachbar.info/f-b62342 | New Introductions USD 20; Recurring Growth 5%; Pipeline Starter USD 100 |
| QA - NovaStack Referral Rule Control | https://novastacksoftware.coachbar.info/QKfriPt2 | Fresh Direct Referral Control USD 1, New-only |

Public enrollment pages and automatic program emails are off. Five distinct website submissions were verified: Alder Quay Operations (NS-ST-16), Bracken Cove Studio (NS-ST-17), Willowmere Advisory (NS-ST-18), Stonefern Systems (NS-ST-19), and the QA contact at Lindenbrook Systems (NS-ST-20). All belong to SkyBridge and Customer Success. Four linked Submitted Deals were also verified: Alder Quay USD 4,800/Won, Bracken Cove USD 2,500/Won, Willowmere USD 450/Won, and Stonefern USD 900/New. Closed deals have a saved 17 November close date. These are fictional internal records, not customer payments.

**Tracking and assignment are verified; program reward processing is unresolved.** Final participant totals were 2 referrals/USD 0 for the custom program, 2/USD 0 for Growth, and 1/USD 0 for QA. New-allowed and New-excluded cases both showed Not Eligible/zero, so zero alone is not a proven status-rule rejection. A fresh USD 1/New-only reward, alone in its own QA program and with no previous estimate, also remained zero before and after one Estimate. This does not support blaming combined rewards or an old estimate alone. The four linked deals still had no Deal Rewards Configuration. No CSV was forced into those deals, and no reward was approved or paid.

The UI describes Monthly calculation as first-of-month processing for the previous month. That does not establish the current manual Estimate scope or resolve the missing program eligibility. The next scheduled monthly check would be 1 December 2026 based on that help text; its outcome has not been observed. Preserve these limits when demonstrating the program. The website function itself creates the intended attributed records, but it cannot repair or confirm the portal's reward-processing service.
