---
id: ST-03
type: story
feature: FEAT-001
status: done
approved_by: "auto (delegated by feature approval)"
pr: ""
---

# Story: Backend test hygiene, remove placeholder and cover validation and mapping (CS-02)

## Decided without the maintainer (research)

Settled from research during story prep, not reviewed by the maintainer. Override any of these freely.

- AC4 → ST-01 wraps both `JsonException` (malformed/missing-member) and a null result into the dedicated dependency exception (→ 502); AC4 rewritten to cover both, and ST-03 adds the malformed-JSON and missing-`results` tests
- AC6 → rewritten to the provable form: coverage at the ST-03 tip not below the ST-02 tip, with `UrlInputValidator`/`PlausibleService` branch coverage strictly higher, shown by before/after Cobertura and a green Codecov project check

## Functional
### User story
As Jeroen (the maintainer), I want a backend test suite that only contains tests that assert something, with direct coverage of the URL validation and the Plausible result mapping, so that a regression in either is caught by a failing test instead of passing silently behind a placeholder.

### Acceptance criteria
1. Given the repository, then `src/api/Bach.Software.Tests/PageReadsTest.cs` is deleted and no `Assert.True(true)` placeholder remains in `Bach.Software.Tests`.
2. Given a new `UrlInputValidatorTests`, then tests cover: empty string and null fail with the empty-URL code, a relative URL fails with the invalid-URL code, a non-http scheme (for example `ftp://example.com`) fails, `http://` and `https://` absolute URLs pass, and each failure asserts the error code (from ST-01's `ErrorCodes`), not message prose.
3. Given a new `PlausibleServiceTests` using `RichardSzalay.MockHttp` with the real `PlausibleService`, then tests assert the `GetPageReads` and `GetPageLikes` projections: a Plausible result containing the page's entry maps to the expected `PageReads`/`PageLikes` values; a result that omits the page maps to the default (0 via `GetValueOrDefault`); multiple results map each key independently.
4. Given the service tests, then a non-success Plausible response surfaces as `HttpRequestException`, and a body that cannot be deserialized — malformed JSON, a body missing a `required` member (`JsonException`), or a body that deserializes to literal `null` — surfaces as ST-01's dedicated dependency exception (which ST-01's handler maps to 502).

   > **PROPOSED (adversarial review) — AC4 is not true for every "unparseable body" (finding 1).** Verified against `PlausibleService.cs` (line 62/108) and `QueryResult.cs`: only a body that deserializes to literal `null` reaches the dedicated-exception branch. A malformed body (`not json`) or one missing the `required` `results`/`metrics`/`dimensions` members throws `System.Text.Json.JsonException`, which ST-01's default handler arm classifies as 500 — contradicting ADR 1a-A ("a malformed dependency response is the dependency failing"). Rewrite AC4 to: "a non-success Plausible response surfaces as `HttpRequestException`, and a body that deserializes to null surfaces as ST-01's dedicated dependency exception." The malformed/missing-`results` case needs a decision in ST-01 (still `qa`): either ST-01's handler wraps `JsonException` into the dedicated 502 exception (then ST-03 adds `GetPageReads_WhenResponseBodyIsMalformedJson_ThrowsDependencyException` and a missing-`results` variant), or ST-01 accepts 500 for it and ST-03 pins it with a characterization test. This story cannot settle that; it belongs to ST-01/the maintainer.

   DECIDED (research): ST-01 wraps both `JsonException` (malformed or missing-`required`-member) and a null result into the dedicated Infrastructure dependency exception (see ST-01 AC2 / Q4), so all three unparseable shapes map to 502. AC4 is rewritten above to cover them, and ST-03 adds `GetPageReads_WhenResponseBodyIsMalformedJson_ThrowsDependencyException`, a missing-`results` variant, and the `GetPageLikes` twins alongside the existing JSON-null tests.
   Why: DECIDED decision 11 (maintainer) requires every unparseable Plausible response to map to 502; the malformed/missing-member case is the common one, so leaving it at 500 would under-implement an approved decision. ST-01 (where the wrapping lives) owns the production change; this story asserts the resulting behaviour.
   Sources: feature Decision log 11, ADR 1a-A; ST-01 AC2 decision; `PlausibleService.cs`, `QueryResult.cs`.
5. Given all new tests, then each is named `MethodName_Scenario_ExpectedBehaviour` and passes the analyzers (CA1707 is already suppressed for the Tests project).
6. Given `dotnet test src/api/Bach.Software.sln` with coverage, then coverage at the ST-03 tip is not below the ST-02 tip, with `UrlInputValidator` and `PlausibleService` branch coverage strictly higher, shown by the before/after Cobertura figures in the PR and a green Codecov project check.

   > **PROPOSED (adversarial review) — AC6 is not provable for this story alone (finding 2).** ST-01 and ST-02 also move the backend coverage numbers, and this story's gain is mostly branch coverage, so "higher than on `main`" cannot be attributed to ST-03. Rewrite AC6 to: "coverage at the ST-03 tip is not below the ST-02 tip, with `UrlInputValidator` and `PlausibleService` branch coverage strictly higher, shown by the before/after Cobertura figures in the PR, and the Codecov project check green." This matches the Coverage section's honest expectation already in the plan.

   DECIDED (research): Adopt as proposed; AC6 is rewritten above. The original "higher than on `main`" is not attributable to this story, since ST-01 and ST-02 move the same numbers and ST-03's gain is mostly branch coverage. The rewrite is provable from the before/after Cobertura figures and the Codecov project check, and matches this plan's own Coverage section and the project's "coverage not below `main`" gate.
   Sources: `specs/PROJECT.md` quality gate; this story's Coverage section.

### Edge cases
- Culture-dependent assertions: use invariant values only.
- Tests must not call the real Plausible API; every HTTP call is served by MockHttp.

### Out of scope
- Changing production behaviour. If a test exposes a bug, record it in Implementation notes and fix it only when trivial, otherwise raise it.

## Design reference
No visual change.

## Architecture reference
Implements area 3 (CS-02). Files in `src/api/Bach.Software.Tests/`: delete `PageReadsTest.cs`; add `Validation/UrlInputValidatorTests.cs` (or equivalent folder) and `PlausibleAnalytics/PlausibleServiceTests.cs` (or equivalent). Reads `src/api/Bach.Software.Application/Validation/UrlInputValidator.cs` and `src/api/Bach.Software.Infrastructure/PlausibleAnalytics/Services/PlausibleService.cs` (no production edits expected).

Dependencies: ST-01 (error codes and dedicated exception are what the tests assert), ST-02 (final service signatures, so tests are not rewritten). No release bookkeeping. Documentation: none; `specs/enforcement.md` CS-02 row moves off Open.

## QA plan

Backend-only story, no UI: the states policy, Storybook, Playwright and frontend coverage do not apply. Test kind is xUnit unit tests (no web host) in `src/api/Bach.Software.Tests/`, run via `dotnet test src/api/Bach.Software.sln`. All names follow `MethodName_Scenario_ExpectedBehaviour`; `MethodName` is the method under test. Test names and comments must not reference specs or ACs (CLAUDE.md).

### Preconditions and naming dependencies
The plan is written against the state after ST-01 and ST-02. Names marked TBD are fixed by those stories and the developer reads them from the merged code, so a rename breaks compilation rather than a silent mismatch:
- ST-01's `ErrorCodes` members for the two URL rules (wire codes `urlRequired`, `urlInvalid`) and the dedicated Infrastructure exception type (name TBD).
- ST-02's signatures: `GetPageReads(string url, CancellationToken cancellationToken)` and `GetPageLikes(...)`. Tests pass `CancellationToken.None`. The Tests project is on xunit 2.9.2 (v2), which has no `TestContext.Current`; ST-02's edge case mentioning `TestContext.Current.CancellationToken` only applies after an xunit v3 move. Cancellation behaviour itself is ST-02's test, not duplicated here.

### AC to test map

| AC | Test (class `Method_Scenario_Expected`) | Kind |
|---|---|---|
| 1 | Repo check, no test code: `src/api/Bach.Software.Tests/PageReadsTest.cs` does not exist, and `Grep "Assert.True\(true\)"` over `src/api/Bach.Software.Tests` has zero hits. The verifier runs both. | manual/scripted |
| 2 | `UrlInputValidatorTests` (new, `Validation/`), using `new UrlInputValidator().Validate(new UrlInput { Url = ... })`: | unit |
| | `Validate_WithEmptyUrl_FailsWithUrlRequiredCode` | |
| | `Validate_WithNullUrl_FailsWithUrlRequiredCode` (`Url = null!`) | |
| | `Validate_WithWhitespaceUrl_FailsWithUrlRequiredCode` (extra: `NotEmpty` also rejects whitespace) | |
| | `Validate_WithRelativeUrl_FailsWithUrlInvalidCode` (Theory: `not-a-valid-url`, `relative/path`, `/relative/path`) | |
| | `Validate_WithNonHttpScheme_FailsWithUrlInvalidCode` (Theory: `ftp://example.com`, `file:///etc/hosts`, `mailto:a@b.c`, `javascript:alert(1)`) | |
| | `Validate_WithAbsoluteHttpOrHttpsUrl_Passes` (Theory: `http://example.com`, `https://bach.software/test?x=1#frag`, `HTTPS://EXAMPLE.COM`; asserts `IsValid`, no errors) | |
| | Every failure test asserts `ErrorCode` taken from the `ErrorCodes` catalog, never `ErrorMessage`. | |
| 3 | `PlausibleServiceTests` (new, `PlausibleAnalytics/`), real `PlausibleService` over a per-test `MockHttpMessageHandler`: | unit |
| | `GetPageReads_WhenResultContainsEveryGoal_MapsEachMetricToItsOwnProperty` (six distinct values 1 to 6, so a swapped property is caught) | |
| | `GetPageReads_WhenResultOmitsGoals_DefaultsMissingMetricsToZero` (only `opened` present) | |
| | `GetPageReads_WhenResultsAreEmpty_ReturnsAllZeros` | |
| | `GetPageReads_WhenResultContainsUnknownGoal_IgnoresIt` | |
| | `GetPageLikes_WhenResultContainsLike_MapsLikes` | |
| | `GetPageLikes_WhenResultOmitsLike_DefaultsToZero` (empty results, and a result holding only an unrelated dimension) | |
| | `GetPageLikes_WhenResultContainsLikeAndOtherGoals_MapsOnlyLikes` (multiple results) | |
| 4 | `GetPageReads_WhenPlausibleReturnsNonSuccess_ThrowsHttpRequestException` and the `GetPageLikes_` twin (Theory 401, 429, 500, 503; also assert `StatusCode` on the exception) | unit |
| | `GetPageReads_WhenResponseBodyIsJsonNull_ThrowsDependencyException` and the `GetPageLikes_` twin (body `null`, the existing endpoint test's input; exception type from ST-01) | unit |
| | `GetPageReads_WhenResponseBodyIsMalformedJson_ThrowsDependencyException` and the `GetPageLikes_` twin (body `not json`; Q1 decided, ST-01 wraps `JsonException`) | unit |
| | `GetPageReads_WhenResponseBodyOmitsRequiredResults_ThrowsDependencyException` and the `GetPageLikes_` twin (body missing the `required` `results` member → `JsonException` → dedicated exception) | unit |
| 5 | Build with analyzers as errors, plus a scripted name check: every new `[Fact]`/`[Theory]` method name matches `^[A-Za-z]+_[A-Za-z]+_[A-Za-z]+$` (a `Grep` over the two new files). | scripted |
| 6 | Coverage evidence, see Coverage below. | scripted |

Supplementary tests (not tied to an AC, kept small, they pin behaviour the mapping tests depend on and lift branch coverage):
- `GetPageReads_WithValidUrl_PostsQueryWithBearerTokenAndSiteId` and `GetPageLikes_...`: MockHttp `Expect(HttpMethod.Post, "<apiUrl>/api/v2/query")` with the `Authorization: Bearer` header, content containing the URL host as `site_id` and the read goals (reads) or `like` (likes). Guards a swapped `_readGoals`/`_likeGoals`.
- `Constructor_WithoutApiToken_ThrowsInvalidOperationException` and `GetPageReads_WithoutApiUrlConfigured_UsesDefaultPlausibleHost` (request goes to `https://plausible.io/api/v2/query`).

### Fixtures and utilities
- Existing and reused: `RichardSzalay.MockHttp` (already referenced), `xunit` 2.9.2, `Microsoft.Extensions.Logging.Abstractions.NullLogger<PlausibleService>.Instance`, `ConfigurationBuilder().AddInMemoryCollection(...)` for `PLAUSIBLE_API_TOKEN` and `PLAUSIBLE_API_URL`.
- Not reused: `CustomWebApplicationFactory`. It boots the web host, and its class-fixture `MockHttpHandler` keeps responders across tests (the reason the existing failure tests build a dedicated factory). The service unit tests need no host and no `IClassFixture`.
- New: a private factory helper inside `PlausibleServiceTests` that builds the service from a fresh `MockHttpMessageHandler` per test and a fixed `PLAUSIBLE_API_URL` (for example `https://plausible.test`). Use `Expect` plus `VerifyNoOutstandingExpectation()` so a test fails when the call never happened, not only when the response is wrong. A small shared JSON helper (builds the `{ "results": [ { "metrics": [n], "dimensions": ["goal"] } ] }` body) keeps cases short. Extract to a shared file only if reused by a second class.
- Analyzer traps (analyzers are warnings-as-errors, `AnalysisLevel latest-recommended`): hoist constant arrays to `static readonly` fields (CA1861, as `AnalyticsEndpointTests` already does), pass invariant values only (CA1305), keep Theory parameters all used (xUnit1026). Dispose the `HttpClient` from `ToHttpClient()` with `using`.
- Namespaces `Bach.Software.Tests.Validation` and `Bach.Software.Tests.PlausibleAnalytics` shadow `Bach.Software.Application.Validation` and `Bach.Software.Infrastructure.PlausibleAnalytics` for simple-name lookups; use explicit `using` directives or pick folder names without that overlap.

### Coverage
Gate (profile): backend coverage not below `main`; this story's AC6 asks for strictly higher. CI collects it with `dotnet test src/api/Bach.Software.sln --collect:"XPlat Code Coverage" --results-directory ./coverage-backend` and uploads the Cobertura output to Codecov. Local evidence: run that command at the ST-02 tip (before) and at the ST-03 tip (after) and compare `line-rate`/`branch-rate` for the `Bach.Software.Application` and `Bach.Software.Infrastructure` packages.
- Honest expectation: the validator and `GetPageLikes` happy path are already executed by `AnalyticsEndpointTests`, so line coverage gain is small. Real gains: the `GetPageReads` deserialize-null throw (only the likes variant is exercised today), the `UrlInputValidator` scheme branch combinations, the constructor missing-token guard and default-URL branch, and every mapping branch of `GetPageReads`. Branch coverage should rise more clearly than line coverage.
- Knowingly uncovered: `PlausibleService` logging source-generator output, `new Uri(url)` throwing on a relative URL (the validator guards it upstream), and a duplicate or empty `Dimensions` entry in a Plausible result (`ToDictionary`/`First()` would throw; see finding Q3).

### Environment quirks
No timezone or container needs: the backend tests do not depend on `TZ`. Culture: only invariant values, no `ToString()`/`string.Format` of numbers or dates in assertions. No test may reach the network: the `HttpClient` always comes from `MockHttpMessageHandler`, and an unmatched request must fail the test (MockHttp's default for unmatched requests), not fall through.

### Regression risk
- Deleting `PageReadsTest.cs` removes class `PageReadsTests`; nothing references it (verified by search), and its only test asserted nothing, so no protection is lost.
- No production edits expected. If a test exposes a bug, record it in Implementation notes and fix only when trivial (story out-of-scope rule).
- ST-01 (error codes, exception type, cascade mode) and ST-02 (signatures) are inputs; if they change after this plan, the tests fail to compile or assert, which is intended. `AnalyticsEndpointTests` and `OpenApiDocumentTests` already cover the same code through the endpoint; the new tests do not overlap their assertions (status codes, document shape).
- Other stories: ST-04 (OpenAPI) and ST-05 (frontend) are unaffected.

### Findings and questions
- **Q1 (should-fix, AC4 is not true as written).** AC4 says an "unparseable body" surfaces as the dedicated dependency exception. In `PlausibleService`, only a body that deserializes to `null` (the literal `null`) hits that branch (ST-01 AC2: "deserialize returns null"). A malformed body (`not json`) or one missing the `required` `results` member makes `JsonSerializer.Deserialize` throw `JsonException`, which the ST-01 handler would classify as 500, contradicting ADR 1a-A ("a malformed dependency response is the dependency failing"). Proposed rewrite of AC4: "a Plausible body that deserializes to null surfaces as ST-01's dedicated dependency exception". Decision needed from the maintainer or ST-01 for the malformed case: either ST-01 wraps `JsonException` into the dedicated exception (then add `GetPageReads_WhenResponseBodyIsMalformedJson_ThrowsDependencyException` plus a missing-`results` variant), or the malformed case is accepted as a 500 and ST-03 pins it with a characterization test `..._ThrowsJsonException` and records it in Implementation notes. The plan does not silently pick one.

  DECIDED (research): ST-01 wraps `JsonException` (and null) into the dedicated 502 exception (decision 11). ST-03 adds the malformed-JSON and missing-`results` tests (added to the AC-to-test map). See the AC4 decision above.
- **Q2 (nit, AC2 cascade).** With FluentValidation's default cascade mode, an empty or null URL fails both rules, so `Errors` holds the required code and the invalid code. Tests must match whatever ST-01 decides (`Cascade(CascadeMode.Stop)` gives only the required code). Plan: assert the exact expected code set per case, not just `Contains`, so a cascade change is caught. Also, AC2 lists `http://` as passing: the literal string `http://` with no host is not a valid absolute URI, so the passing cases use a host (`http://example.com`); read the AC as "http and https absolute URLs".
- **Q3 (nit).** Not testing duplicate dimension keys or an empty `Dimensions` list in a Plausible result: both throw in the current mapping and Plausible is not expected to send them. Recorded, not planned.
- **Q4 (should-fix, AC6 wording).** "Coverage higher than on `main`" is hard to prove for this story alone because ST-01 and ST-02 also move the numbers and the gain here is mostly branch coverage. Proposed rewrite: "coverage at the ST-03 tip is not below the ST-02 tip, with `UrlInputValidator` and `PlausibleService` branch coverage strictly higher, shown by the before and after Cobertura figures in the PR, and the Codecov project check is green."

  DECIDED (research): Adopt; AC6 is rewritten to this provable form. See the AC6 decision above.

### Manual verification checklist
- [ ] `PageReadsTest.cs` is gone and no `Assert.True(true)` remains in `Bach.Software.Tests`.
- [ ] `dotnet test src/api/Bach.Software.sln` passes with no warnings (analyzers as errors).
- [ ] Every new test method name matches `MethodName_Scenario_ExpectedBehaviour`.
- [ ] Before and after Cobertura figures attached to the PR (see Coverage).
- [ ] Mutation spot checks: swap two property assignments in `GetPageReads`, change `"like"` to another goal, and relax the scheme check in `UrlInputValidator`; each makes at least one new test fail, then revert.
- [ ] Run the new classes with the network disabled to confirm no test calls the real Plausible API.

## Adversarial review
Lite, story level. Verified against the code (`PlausibleService.cs`, `QueryResult.cs`, `UrlInputValidator.cs`, `PageReadsTest.cs`, `Bach.Software.Tests.csproj`) and the sibling stories ST-01 (`qa`) and ST-02 (`adversarial-review`).

1. **(should-fix, carries an open decision) AC4's "unparseable body" claim is false for most unparseable bodies.** Verified: in `PlausibleService` the result type's `results`/`metrics`/`dimensions` members are `required`, so only a body deserializing to literal `null` reaches the branch ST-01 turns into the dedicated 502 exception (ST-01 AC2 scopes itself to "deserialize returns null"). A malformed body or a missing `results` member throws `JsonException`, which ST-01's default arm classifies as 500 — contradicting ADR 1a-A. AC4 as written is therefore not testable for the malformed case, and the AC-to-test map already has a pending row (`..._WhenResponseBodyIsMalformedJson_...`, "pending a decision"). Routed: PROPOSED AC4 rewrite. Resolved by research: the malformed/missing-`results` classification is settled by DECIDED decision 11 (every unparseable Plausible response → 502), which ST-01 implements by wrapping `JsonException` and null into the dedicated dependency exception. AC4 is rewritten to cover all three unparseable shapes and ST-03 adds the malformed-JSON and missing-`results` tests. No open decision remains, so the status moves to `awaiting-approval`.

2. **(should-fix, routed) AC6 "higher than main" is not attributable to this story.** ST-01 and ST-02 also move the numbers and this story's gain is mostly branch coverage. Routed as a PROPOSED AC6 rewrite ("not below the ST-02 tip, with `UrlInputValidator`/`PlausibleService` branch coverage strictly higher"), matching the Coverage section's own expectation. Routed, so it does not independently force discussion.

3. **(nit, settled by dependency) Cascade mode decides the expected code set for empty/null URL.** Verified: `UrlInputValidator` uses the default cascade (`.NotEmpty()...Must(...)`), so an empty or null URL fails both rules and `Errors` carries both `urlRequired` and `urlInvalid`. The test outcome depends on whether ST-01 sets `CascadeMode.Stop`. The plan (Q2) already handles this by asserting the exact expected code set read from ST-01's merged code; the dependency on ST-01 is explicit. No change needed.

4. **(confirmed, not a finding) xunit v2 / `TestContext.Current` correctly excluded.** Verified `xunit` 2.9.2 in `Bach.Software.Tests.csproj`; `TestContext.Current` does not exist. ST-03 (line 46) already states this and does not inherit ST-02's edge-case error, which ST-02's own finding 1 proposes to rewrite. Consistent across the two stories.

AC1 (placeholder deletion) and the remaining ACs are testable and mapped; the AC-to-test map covers each. Dependencies on ST-01 and ST-02 are explicit.

## Implementation notes
- Added `Validation/UrlInputValidatorTests.cs` and `PlausibleAnalytics/PlausibleServiceTests.cs`; the plan's supplementary request, default-host and missing-token tests are included. `dotnet test src/api/Bach.Software.sln`: 110 passed (77 before), 0 warnings.
- AC1 done: the delete was blocked by the permission classifier in the first session, so the maintainer deleted `src/api/Bach.Software.Tests/PageReadsTest.cs` themselves. Confirmed afterwards: the file is gone and `Assert.True(true)` has zero hits in `Bach.Software.Tests`.
- Final run after the deletion: `dotnet build src/api/Bach.Software.sln` 0 warnings, 0 errors; `dotnet test src/api/Bach.Software.sln` 113 passed, 0 failed. The count is higher than the earlier 110 because other FEAT-001 stories added tests in the working tree in the meantime (the placeholder test is no longer counted).
- Deviation, AC4: the three unparseable-body shapes (`null`, `not json`, `{}`) for both `GetPageReads` and `GetPageLikes` are already covered by ST-01's `PlausibleServiceFailureTests` (asserting `PlausibleResponseException`, named `..._ThrowsDependencyResponseException`), so they are not duplicated under the plan's `..._ThrowsDependencyException` names. ST-03 adds the non-success `HttpRequestException` tests (Theory 401, 429, 500, 503, asserting `StatusCode`).
- Deviation, AC2: the validator uses the default cascade (ST-01 did not set `CascadeMode.Stop`), so empty, null and whitespace URLs fail with both `urlRequired` and `urlInvalid`. The tests assert that exact code set, per the plan's Q2.
- Deviation: the service tests build their own configuration helper (with `PLAUSIBLE_API_URL`) instead of extending `TestHelpers/PlausibleServiceFactory`, which has no URL and is used by the cancellation tests.
- `specs/enforcement.md` CS-02 row has no Open marker to move, left unchanged.
- Coverage (Cobertura, ST-02 tip vs now): total line 0.9737 -> 0.9737, branch 0.8987 -> 0.9240. `UrlInputValidator` branch 0.75 -> 1.0; `PlausibleService` branch 0.8333 -> 1.0. Application branch 0.8571 -> 0.9285, Infrastructure branch 0.90 -> 1.0. Codecov project check not run locally. Re-measured after the placeholder deletion: figures are unchanged (total line 0.9737, branch 0.924; `UrlInputValidator` and `PlausibleService` branch 1.0; Application branch 0.9285; Infrastructure branch 1.0).
- Not run: the mutation spot checks and the network-disabled run (every `HttpClient` comes from MockHttp, so no test can reach the network).

## Verification report

**Verdict: pass.**

### Checks
- `dotnet build src/api/Bach.Software.sln`: 0 warnings, 0 errors (analyzers as errors).
- `dotnet test src/api/Bach.Software.sln` with coverage: 113 passed, 0 failed. No frontend checks (no frontend file belongs to this story).
- Coverage reproduced. After (full suite): total line 0.9737, branch 0.924; `UrlInputValidator` branch 1.0; `PlausibleService` branch 1.0; Application branch 0.9285; Infrastructure branch 1.0. Before (re-measured by excluding the two new classes, 80 tests): total line 0.9737, branch 0.8987; `UrlInputValidator` 0.75; `PlausibleService` 0.8333; Application 0.8571; Infrastructure 0.90. These match the developer's figures exactly. Caveat: the "before" is the current working tree minus ST-03's two classes, not a checkout of the ST-02 tip (no git state changes allowed); other stories' tests are in both runs, so the delta is attributable to ST-03. The Codecov project check could not be run locally.

### Acceptance criteria
| AC | Result | Evidence |
|---|---|---|
| 1 | pass | `PageReadsTest.cs` does not exist; `Assert.True(true)` has zero hits in `Bach.Software.Tests` (excluding bin/obj). |
| 2 | pass | `UrlInputValidatorTests`: empty, null, whitespace (both codes, default cascade, exact code set asserted), relative theory (3), non-http scheme theory (4, ftp/file/mailto/javascript), http/https/uppercase pass with `IsValid` and empty errors. Codes come from `ErrorCodes.Url.*().Code`, never message text. |
| 3 | pass | `PlausibleServiceTests` with the real service over `MockHttpMessageHandler`: six distinct values per read property, omitted goals default to 0, empty results, unknown goal ignored; likes mapped, empty and unrelated-only default to 0, multiple results map only `like`. |
| 4 | pass | Non-success: Theory 401/429/500/503 for reads and likes, asserts `HttpRequestException` and `StatusCode`. Null, malformed JSON and missing required members (`{}`): six tests in ST-01's `PlausibleServiceFailureTests` assert `PlausibleResponseException`, plus endpoint tests asserting 502. Not duplicated under the plan's names, which is acceptable. Mutation check: replacing the `JsonException` wrap with another exception type failed 4 failure tests and 4 endpoint tests. |
| 5 | pass | Build clean; every `[Fact]`/`[Theory]` name in both new files matches `Method_Scenario_Expected`. |
| 6 | pass | Total line equal (0.9737), total branch up (0.8987 to 0.924), `UrlInputValidator` 0.75 to 1.0 and `PlausibleService` 0.8333 to 1.0, strictly higher. |

### Other checks
- Mutation spot checks (each fully reverted, file checksums verified before and after): swapping `read` and `opened` failed 3 tests; changing `like` failed 3; relaxing the scheme check failed 9. Two initial mutations did not compile and were discarded.
- Culture: no number or date formatting in assertions; invariant values only.
- No network: every `HttpClient` comes from `MockHttpMessageHandler`, including the default-host test (an expectation on `https://plausible.io`, never sent for real).
- No spec, story or AC references in test names or comments in the two new files.
- `specs/enforcement.md` CS-02 row has no Open marker to move; it reads "Enforced, danger (partial) + review" and is accurate, so leaving it unchanged is fine.

### Notes (non-blocking)
- The whitespace and empty tests are named `..._FailsWithUrlRequiredCode` but assert both `urlRequired` and `urlInvalid` (default cascade); the name is slightly narrower than the assertion.
- The plan's mutation checklist and network-disabled run were not run by the developer; the verifier ran the mutation checks.
