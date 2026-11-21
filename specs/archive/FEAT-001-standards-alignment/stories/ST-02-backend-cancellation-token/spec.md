---
id: ST-02
type: story
feature: FEAT-001
status: done
approved_by: "auto (delegated by feature approval)"
pr: ""
---

# Story: Propagate CancellationToken through the analytics request chain (CS-04)

## Decided without the maintainer (research)

Settled from research during story prep, not reviewed by the maintainer. Override any of these freely.

- Criterion 5 → producer is the ASP.NET Core framework (it intercepts a request-abort cancellation before the handler), not an ST-01 handler arm; ST-01 owns the dependency-timeout→502 classification the inverse guard exercises
- Criterion 6 → cite the new `OpenApiDocumentTests.PageReads_/PageLikes_DoesNotDocumentCancellationToken` tests, not the existing `PageReads_DeclaresTypedResponses`
- Edge case → drop the `TestContext.Current` reference (xUnit v3 only); on xunit 2.9.2 tests pass `CancellationToken.None`
- CA2016/CA1068 → not warnings-as-errors by default ("As suggestion"); adding explicit `.editorconfig` severities is mandatory

## Functional
### User story
As a site visitor who navigates away mid-request, I want the backend to stop work for my abandoned analytics call, so that the API does not keep waiting on Plausible Analytics for a response nobody will read, and the analyzer (CA2016) can keep holding that line from now on.

### Acceptance criteria
1. Given `IAnalyticsService`, then `GetPageReads` and `GetPageLikes` each take `CancellationToken cancellationToken` as the last parameter, and `PlausibleService` implements them with the same signature.
2. Given the endpoint handlers `GetPageReads` and `GetPageLikes` in `AnalyticsEndpoints.cs`, then each takes a `CancellationToken cancellationToken` parameter (bound by minimal APIs to the request-aborted token) and forwards it to the service call and to `ValidateAndThrowAsync`.
3. Given `PlausibleService.SendRequest`, then it takes a `CancellationToken` and forwards it to `_httpClient.SendAsync(request, cancellationToken)` and to `response.Content.ReadAsStringAsync(cancellationToken)`; the synchronous `JsonSerializer.Deserialize` call is unchanged.
4. Given a test that cancels the token before or during a Plausible call (using `RichardSzalay.MockHttp` or a stub handler that observes the token), when the service method runs, then it throws `OperationCanceledException` (or `TaskCanceledException`) and the test asserts the token reached the `HttpClient` handler.
5. Given a cancelled request through the endpoint, then the central handler from ST-01 does not produce a 5xx error log for the cancellation (no error-level log entry for `OperationCanceledException` caused by request abort).
6. Given `dotnet build`, then CA2016 and CA1068 are clean as warnings-as-errors (made warning-level by the explicit `dotnet_diagnostic.CA2016.severity = warning` and `dotnet_diagnostic.CA1068.severity = warning` entries this story adds to `src/api/.editorconfig`, since both rules default to suggestion, which `TreatWarningsAsErrors` does not promote), and `dotnet test src/api/Bach.Software.sln` passes. The OpenAPI output is unchanged: the cancellation token is not a documented parameter, and each analytics operation still has exactly one parameter, `url`, asserted by the new `OpenApiDocumentTests.PageReads_DoesNotDocumentCancellationToken` and `PageLikes_DoesNotDocumentCancellationToken` tests from the QA plan.

> **PROPOSED (adversarial review, finding 2, BLOCKER) — criterion 5 has no producer that this story or ST-01 implements-and-tests; resolve ownership before approval.** Criterion 5 asserts the central handler writes no error-level log for a request-abort `OperationCanceledException`. Verified: ST-01 lists this only as an untested edge case ("this story must not log `OperationCanceledException` as a 500 if it can already occur"), with no acceptance criterion and no test, and the feature's area-1a handler plan lists only validation/`AppException`/`HttpRequestException`/default-500 arms, no cancellation arm. Before the token exists (pre-ST-02) a request-abort cancellation cannot occur, so ST-01 never has to handle it; once ST-02 threads the token, an aborted request surfaces an `OperationCanceledException` through the handler, which with no dedicated arm is classified as a 500 and logged as an error, so criterion 5's tests would fail (or pass vacuously). The handler lives in area 1a / ST-01, so this story cannot silently take it over (feature rule 4: a change contradicting the approved area ownership needs a feature/ST-01 amendment first). Resolution for the maintainer / research step: amend ST-01 to add an acceptance criterion and test for the abort-suppression arm (suppress the error log and return no 5xx body when `HttpContext.RequestAborted.IsCancellationRequested`), and state the observable response for an aborted request so criterion 5 and the inverse-timeout guard can assert more than "no error log". ST-01 is still in `qa`, so it can absorb this.

> DECIDED (research): The blocker is resolved, but not by an ST-01 handler arm. Research of the .NET 9 exception-handling middleware shows it intercepts a request-abort `OperationCanceledException`/`IOException` (`RequestAborted.IsCancellationRequested`) before invoking any `IExceptionHandler`: it sets 499, logs at Debug (never Error), and returns without rethrowing. So criterion 5's producer is the framework, and a cancelled request is never classified 500 regardless of ST-01's arms. Criterion 5 stands as written; its "the central handler from ST-01 does not produce a 5xx error log" is satisfied because the handler is not reached for an abort. ST-01's owned contribution is the dependency-timeout→502 arm (`TaskCanceledException` with `RequestAborted` not cancelled), which this story's inverse-guard test exercises; that classification and ST-01's abort behaviour are recorded under ST-01 Q3. No ST-01 area-ownership conflict remains, and no feature amendment is needed (ADR 1a-A already owns dependency→502; the abort behaviour is framework-defined).
> Sources: `aspnetcore/.../ExceptionHandlerMiddlewareImpl.cs` (release/9.0, request-aborted short-circuit); ST-01 Q3 decision; feature ADR 1a-A.

> **PROPOSED (adversarial review, finding 3) — criterion 6's "verified by `OpenApiDocumentTests`" is false as the test stands; the QA plan already carries the fix.** Verified: `OpenApiDocumentTests.PageReads_DeclaresTypedResponses` reads `operation.GetProperty("parameters")[0]` and asserts name `url`, but never asserts the parameter count, so a spurious documented `cancellationToken` at `parameters[1]` would pass unnoticed. (Minimal APIs special-case `CancellationToken` out of the document anyway, so the risk is low, but the stated proof does not hold.) Rewrite criterion 6's tail to: "...the operation still has exactly one parameter, `url`, asserted by the new `OpenApiDocumentTests.PageReads_DoesNotDocumentCancellationToken` / `PageLikes_DoesNotDocumentCancellationToken` tests from the QA plan," rather than citing the existing test.

> DECIDED (research): Adopt as proposed; criterion 6 is rewritten above to cite the new `..._DoesNotDocumentCancellationToken` tests. Verified: `OpenApiDocumentTests.PageReads_DeclaresTypedResponses` reads only `parameters[0]` and never asserts the count, so it cannot prove the absence of a documented `cancellationToken`. Minimal APIs special-case `CancellationToken` out of the document, so the new tests assert the guaranteed behaviour (exactly one parameter, `url`).
> Sources: existing `OpenApiDocumentTests.PageReads_DeclaresTypedResponses`; ASP.NET Core minimal-API special-casing of `CancellationToken`.

> **PROPOSED (adversarial review, finding 4, verified against .NET docs) — CA2016 and CA1068 are NOT warnings-as-errors by default; the `.editorconfig` severity config is required, not a conditional fallback.** Verified against the official rule docs: both CA2016 (ForwardCancellationTokenToInvocations) and CA1068 (CancellationToken parameters must come last) are "Enabled by default ... As suggestion," not as warning. `TreatWarningsAsErrors=true` promotes only warning-level diagnostics; suggestion-level diagnostics are not warnings and are not promoted, and `EnforceCodeStyleInBuild` governs IDExxxx style rules, not CAxxxx quality rules. So on the current `src/api/.editorconfig` (which sets no CA2016/CA1068 severity) a violation would neither warn nor error, criterion 6 would pass vacuously, and the user story's goal ("the analyzer can keep holding that line") would not hold. Make it mandatory (not "if the manual check fails") that this story adds `dotnet_diagnostic.CA2016.severity = warning` and `dotnet_diagnostic.CA1068.severity = warning` to `src/api/.editorconfig`, and correct criterion 6 (and the feature's repeated "already warning-as-error per CS-01's baseline" phrasing) to reflect that these become warnings-as-errors only once that config is added. Keep manual-verification step 1 as the empirical confirmation. Source: learn.microsoft.com rule pages for CA2016 and CA1068 (default severity "As suggestion").

> DECIDED (research): Adopt as proposed. This story adds `dotnet_diagnostic.CA2016.severity = warning` and `dotnet_diagnostic.CA1068.severity = warning` to `src/api/.editorconfig` as a mandatory step (not a conditional fallback). Confirmed against the official rule pages: both CA2016 and CA1068 are "Enabled by default ... As suggestion", and `TreatWarningsAsErrors` promotes only warning-level diagnostics, while `EnforceCodeStyleInBuild` governs IDExxxx style rules, not CAxxxx quality rules; `src/api/.editorconfig` currently sets no severity for either. Criterion 6 is corrected above; manual step 1 remains the empirical confirmation.
> Sources: Microsoft CA2016 and CA1068 rule pages ("Enabled by default: As suggestion"); `src/api/.editorconfig`; `src/api/Directory.Build.props`.

### Edge cases
- `SendRequest` callers other than the two analytics methods (if any) must also be updated; no call site is left without a token.
- Tests that call the service pass a `CancellationTokenSource.Token`, or `CancellationToken.None` when cancellation is not under test; no existing test calls the service directly, so no current test needs changing.

  > **PROPOSED (adversarial review, finding 1) — drop the `TestContext.Current` reference; it does not exist on this stack.** Verified: `Bach.Software.Tests.csproj` pins `xunit 2.9.2` (xUnit v2); `TestContext.Current.CancellationToken` and analyzer xUnit1051 are xUnit v3 only. Rewrite the edge case to: "Tests that call the service pass a `CancellationTokenSource.Token`, or `CancellationToken.None` when cancellation is not under test; no existing test calls the service directly, so no current test needs changing." Criterion 4 is unaffected.

  > DECIDED (research): Adopt as proposed; the edge case is rewritten above. Confirmed `xunit 2.9.2` (v2) in `Bach.Software.Tests.csproj`, where `TestContext.Current` and analyzer xUnit1051 do not exist (both are xUnit v3). Criterion 4 is unaffected.
  > Sources: `Bach.Software.Tests.csproj` (xunit 2.9.2); xUnit v2-vs-v3 `TestContext`/xUnit1051 availability.

### Out of scope
- Switching to `JsonSerializer.DeserializeAsync` (optional, not part of this story, review finding 4).
- New mapping tests for the service (ST-03).

## Design reference
No visual change.

## Architecture reference
Implements area 2 (CS-04). Files:
- `src/api/Bach.Software.Application/Interfaces/IAnalyticsService.cs`
- `src/api/Bach.Software.Infrastructure/PlausibleAnalytics/Services/PlausibleService.cs`
- `src/api/Bach.Software.Web/Endpoints/AnalyticsEndpoints.cs`
- Existing callers in `src/api/Bach.Software.Tests/` (`Integration/AnalyticsEndpointTests.cs`, and any other direct service call).
- `src/api/.editorconfig` (add the mandatory CA2016/CA1068 `= warning` severities; see finding 4).

Dependencies: ST-01 (hard for this split: same two source files, and the handler's cancellation behaviour in criterion 5 lives in ST-01's handler; the architecture lists this only as a soft edge). Blocks ST-03 (tests are written against the final signatures). No release bookkeeping. Documentation: none; `specs/enforcement.md` CS-04 row moves off Open.

## QA plan

Context read: profile Testing section (backend = xUnit in `Bach.Software.Tests`, `dotnet test src/api/Bach.Software.sln`), the csharp pack (CS-02 test naming and structure, CS-04 cancellation), the dotnet-api pack's API-03 (endpoint integration tests through the real host), and the existing tests. Facts found in the tree that shape the plan:
- The Tests project is on **xunit 2.9.2** (v2). `TestContext.Current` and analyzer xUnit1051 are xUnit v3 only, so they do not exist here (see finding 1).
- No test calls `IAnalyticsService.GetPageReads/GetPageLikes` directly today. Everything goes through HTTP via `CustomWebApplicationFactory` (which swaps `IHttpClientFactory` for a `MockHttpMessageHandler`). `MockHttp`'s responders do not receive the cancellation token, so they cannot prove token forwarding.
- `PlausibleService` has a public ctor `(HttpClient, IConfiguration, ILogger<PlausibleService>)` and needs `PLAUSIBLE_API_TOKEN`, so it can be built directly in a test with an in-memory configuration and `NullLogger`.
- `OpenApiDocumentTests.PageReads_DeclaresTypedResponses` reads only `parameters[0]`, so a wrongly documented extra `cancellationToken` parameter would pass unnoticed (see finding 3).
- `.editorconfig` sets no explicit severity for CA2016/CA1068; they rely on `AnalysisLevel=latest-recommended` plus `TreatWarningsAsErrors` (see finding 4).

### Acceptance criteria to test mapping

| AC | Test kind and name | Notes |
|---|---|---|
| 1 | Compile gate: `dotnet build` (interface, `PlausibleService`, all callers) | `PlausibleService : IAnalyticsService` cannot compile with a mismatched signature; CA1068 enforces "last parameter". No reflection test (CS-02: no signature trivia tests). |
| 2 | Integration: `GetPageReads_ClientAbortsRequest_CancelsPlausibleCall` and `GetPageLikes_ClientAbortsRequest_CancelsPlausibleCall` (xUnit `[Theory]` over the two routes would hide which endpoint broke; keep two `[Fact]`s sharing a helper) | Proves the handler parameter is bound to `RequestAborted` and forwarded all the way to the stub HTTP handler. The `ValidateAndThrowAsync` forward is covered by build/CA2016 only (the validator is synchronous in effect and not observable). |
| 3 | Unit (service, stub handler): the three "during" scenarios below | `SendRequest` is private, so it is covered through the public methods. `ReadAsStringAsync(cancellationToken)` is proven by the observing-content test. The unchanged synchronous `Deserialize` is covered by the existing `AnalyticsEndpointTests` happy paths and `..CannotBeDeserialized_*`. |
| 4 | Unit, new file `Unit/PlausibleServiceCancellationTests.cs`, per method (`GetPageReads`, `GetPageLikes`) three tests, six total: | |
| 4a | `GetPageReads_TokenAlreadyCancelled_ThrowsOperationCanceledException` / `GetPageLikes_...` | Stub handler records the token it received and throws if cancelled. Assert `Assert.ThrowsAnyAsync<OperationCanceledException>` and `handler.ObservedToken.IsCancellationRequested`. |
| 4b | `GetPageReads_TokenCancelledWhileSending_ThrowsOperationCanceledException` / `GetPageLikes_...` | Handler signals `RequestStarted`, then awaits `Task.Delay(Timeout.Infinite, token)`. Test awaits `RequestStarted`, cancels the source, asserts the call faults with `OperationCanceledException`. No sleeps (CS-02). |
| 4c | `GetPageReads_TokenCancelledWhileReadingBody_ThrowsOperationCanceledException` / `GetPageLikes_...` | Handler returns 200 with an `HttpContent` subclass whose `SerializeToStreamAsync(..., CancellationToken)` records the token and awaits cancellation. This is the only way to show `response.Content.ReadAsStringAsync(cancellationToken)` is forwarded (an un-forwarded call would hang or complete instead of cancelling). If the framework buffering path turns out not to hand the token to the content, drop 4c and rely on CA2016 for that one call, recorded in Implementation notes. |
| 4 (token identity) | In 4a and 4b assert `handler.ObservedToken.CanBeCanceled` | `HttpClient` hands the handler a linked token, so reference equality is the wrong check; `CanBeCanceled` fails if the service passed `default`/`CancellationToken.None`, and the cancel-then-throw behaviour proves the link. |
| 5 | Integration, `Integration/AnalyticsCancellationTests.cs`: `GetPageReads_ClientAbortsRequest_LogsNoErrorEntry`, `GetPageLikes_ClientAbortsRequest_LogsNoErrorEntry` | Stub Plausible handler blocks until its token is cancelled; the request is aborted mid-flight. Assert the log capture has zero entries at `LogLevel.Error` or above. Reuse the log-capture helper ST-01 builds for its "exactly one error log" test (criterion 8 of ST-01); if ST-01 shipped none, add a minimal capturing `ILoggerProvider` in `Support/`. |
| 5 (inverse guard) | `GetPageReads_PlausibleTimesOutWithoutClientAbort_ReturnsServerErrorAndLogsOnce` | Stub throws `TaskCanceledException` while the request token is NOT cancelled (the shape of an `HttpClient` timeout). Assert a 5xx status and exactly one error entry. Guards the failure mode where the handler's cancellation arm swallows a genuine timeout (CS-04 "Let OperationCanceledException propagate": a client abort and a timeout must be told apart by `RequestAborted`). Exact status follows ST-01's classification. |
| 6 | `dotnet build src/api/Bach.Software.sln` clean; `dotnet test src/api/Bach.Software.sln` green; new `OpenApiDocumentTests.PageReads_DoesNotDocumentCancellationToken` and `PageLikes_DoesNotDocumentCancellationToken` | The new test asserts the operation has exactly one parameter (`url`) and no parameter named `cancellationToken`. Existing `PageReads_DeclaresTypedResponses` must stay green unchanged by this story. |

### Test determinism and design

- **Wait on events, never time.** Use `TaskCompletionSource` (`RequestStarted`, `ObservedCancellation`) and `Assert.ThrowsAnyAsync`. No `Task.Delay` with a duration, no `Thread.Sleep`. For criterion 5, do the abort through the TestServer pipeline so the test awaits the completed pipeline before reading the log capture (for example `factory.Server.SendAsync(context => ...)` and aborting through `IHttpRequestLifetimeFeature.Abort()`, which returns only after the whole app delegate, including the exception handler and its logging, has finished). Do not assert the log right after the client-side call faults: server-side logging may not have run yet, which would make the test pass vacuously.
- **Isolation.** Each test builds its own factory or service (the shared `CustomWebApplicationFactory` keeps responders for the class lifetime, as the existing comments note); use `WithWebHostBuilder` or a dedicated factory to replace `IHttpClientFactory` with one returning `new HttpClient(stubHandler)`.
- **One behaviour per test**, AAA with blank-line separation, expected values as literals.
- **Token source in tests.** Use `new CancellationTokenSource()` and its `Token`; use `CancellationToken.None` where a test deliberately does not exercise cancellation (xUnit v2 has no `TestContext`).

### Fixtures and utilities

Existing, reused: `CustomWebApplicationFactory` (config token, `IHttpClientFactory` swap, `MockHttpHandler`), `AnalyticsEndpointTests` as the style reference, `OpenApiDocumentTests.GetDocumentAsync`, ST-01's log-capture helper and faulty-service fake.

New (in `src/api/Bach.Software.Tests/Support/`, written so ST-03 reuses them for `PlausibleServiceTests`):
- `TokenObservingHttpHandler : HttpMessageHandler`: exposes `ObservedToken`, a `RequestStarted` task, and modes (block until cancelled, return a canned `HttpResponseMessage`, throw a given exception).
- `TokenObservingContent : HttpContent`: records the token passed to `SerializeToStreamAsync` and awaits cancellation.
- A small helper creating `PlausibleService` with in-memory configuration (`PLAUSIBLE_API_TOKEN`), the stub handler, and `NullLogger<PlausibleService>`.

Existing test code that must change in this story:
- ST-01's faulty `IAnalyticsService` fake (criterion 3 of ST-01) implements the old two-argument signatures and stops compiling once the interface changes; update it to the new signatures. `grep -rn "IAnalyticsService" src/api/Bach.Software.Tests` before starting.
- `AnalyticsEndpointTests` needs no edit (it only calls HTTP). Edge case 2 is therefore vacuous today (no direct callers exist).

### States, UI, stack-specific regression classes

- UI states: not applicable (no visual change, backend only).
- Async cancellation is the pack-named trouble spot for this slice, so the plan prescribes the real test for exactly that: cancel mid-flight and assert the downstream call observes it (4a to 4c, 2, 5), plus the inverse guard that a timeout is not mistaken for a client abort. Reactivity and state-migration classes do not apply.

### Coverage

The production change adds parameters and forwards, no new branches, so line coverage of `PlausibleService` and `AnalyticsEndpoints` cannot drop and the new tests add execution of the cancellation paths. Nothing is knowingly left uncovered except the forward into `ValidateAndThrowAsync` (guarded by CA2016 only, see AC 2) and, if dropped, 4c. No frontend coverage impact; `pnpm ci:test` is not required (backend-only), the gate is `dotnet test src/api/Bach.Software.sln`.

### Environment

No timezone or container needs for the backend tests. `PLAUSIBLE_API_TOKEN` is supplied in-memory (factory config or direct configuration); no real network. No Docker, no visual baselines.

### Regression risk

- **Touched flows:** both analytics endpoints and the Plausible call chain; the `IAnalyticsService` interface (only implementers: `PlausibleService`, ST-01's test fake).
- **Other stories:** ST-01 owns the handler's `OperationCanceledException` behaviour (criterion 5 depends on it, see finding 2). ST-03 writes `PlausibleServiceTests` against the final signatures and should reuse the new `Support/` helpers. ST-04 regenerates the committed OpenAPI document; the new "does not document cancellationToken" assertions keep that document free of a spurious parameter.
- **Guards:** `AnalyticsEndpointTests` (happy paths, invalid url, 502 mappings from ST-01), `OpenApiDocumentTests` (contract), and the new tests above.

### Manual verification checklist

1. Analyzer proves its worth (one-off, not committed): after adding the mandatory `dotnet_diagnostic.CA2016.severity = warning` and `dotnet_diagnostic.CA1068.severity = warning` to `src/api/.editorconfig` (decided under finding 4), in `PlausibleService.SendRequest` temporarily drop the token from `_httpClient.SendAsync(request)`; `dotnet build` must fail with CA2016. Temporarily move the parameter before another one; `dotnet build` must fail with CA1068. Revert.
2. Optional smoke on the preview or locally: start `pnpm dev:api`, request `/api/analytics/pageReads?url=...` with `curl --max-time 0.05` against a slow Plausible URL and confirm the API log shows no error-level entry.
3. Confirm no `cancellationToken` parameter shows in `/openapi/v1.json` for both analytics operations.

### Findings (testability of the criteria as written)

1. **Edge case 2 is wrong for this stack.** It tells tests to pass "`TestContext.Current.CancellationToken` as the xUnit analyzer requires". The project uses xunit 2.9.2 where neither exists. Proposed rewrite: "Tests that call the service pass a `CancellationTokenSource.Token` (or `CancellationToken.None` when cancellation is not under test); no existing test calls the service directly, so no current test needs changing." Note ST-02 criterion 4 stays valid as written.
2. **Criterion 5 has no producer.** It relies on ST-01's handler not logging `OperationCanceledException` as an error, but ST-01's acceptance criteria mention this only as an edge case with no test. Without an ST-01 arm, the criterion 5 tests here fail (or, worse, a cancelled request is logged and returned as a 500). Proposed: ST-01 either states the behaviour as a criterion (suppress the error log when `HttpContext.RequestAborted.IsCancellationRequested`, return no body), or this story owns the handler arm. Also state the observable response for an aborted request, otherwise the test can only assert "no error log". The plan asserts the log only and a 5xx-free status when one is observable.
3. **Criterion 6's proof is too weak.** "Verified by `OpenApiDocumentTests`" is not true as the test stands (only `parameters[0]` is checked). Proposed rewrite: "...the operation still has exactly one parameter, `url`, asserted by a new `OpenApiDocumentTests` test."
4. **Analyzer severity is assumed, not shown.** CA2016/CA1068 have no explicit severity in `.editorconfig`; whether `latest-recommended` raises them to warnings should be proven by manual step 1 rather than assumed, since criterion 6 and the story's stated purpose ("the analyzer can keep holding that line") depend on it.

## Adversarial review
Lite, story level. All four items the QA planner flagged were verified against the tree and external docs; each is confirmed. Routed as `PROPOSED (adversarial review)` edits in the relevant sections above.

1. **(blocker, resolved by research) Criterion 5's producer.** The reviewer's premise (an aborted request reaches the handler as an unhandled `OperationCanceledException` and is logged as a 500) does not hold on .NET 9: the exception-handling middleware intercepts a request-abort cancellation before any `IExceptionHandler`, sets 499, logs at Debug, and returns. So criterion 5's producer is the framework, not an ST-01 handler arm, and criterion 5 passes without an area-1a change. ST-01's owned contribution is only the dependency-timeout→502 classification (ADR 1a-A), which this story's inverse-guard test exercises. No area-ownership conflict, no feature amendment. See the DECIDED entry under Acceptance criteria. The status moves to `awaiting-approval`.
2. **(should-fix) Edge case 2 names `TestContext.Current`, which does not exist on this stack.** Confirmed: `Bach.Software.Tests.csproj` pins `xunit 2.9.2` (v2); `TestContext.Current.CancellationToken` and xUnit1051 are v3 only. Routed as a PROPOSED rewrite in Edge cases.
3. **(should-fix) Criterion 6's "verified by `OpenApiDocumentTests`" is false as written.** Confirmed: the existing `PageReads_DeclaresTypedResponses` reads `parameters[0]` and never asserts the count. The QA plan's new `..._DoesNotDocumentCancellationToken` tests already cover this; routed a criterion-6 wording fix to cite them.
4. **(should-fix, verified against .NET docs) CA2016/CA1068 are not warnings-as-errors by default.** Confirmed against the official rule pages: both default to "As suggestion," which `TreatWarningsAsErrors` does not promote, and `.editorconfig` sets no severity for them. The "already warning-as-error" premise is false, not just unproven; the explicit `.editorconfig` severity additions must be mandatory, not a conditional fallback, or the story enforces nothing and criterion 6 passes vacuously. Routed under the Acceptance criteria.

Nits: none that change the outcome.

## Implementation notes
- Production change as specified: token added as last parameter on `IAnalyticsService`, `PlausibleService` (public methods and `SendRequest`), and both endpoint handlers; forwarded to `SendAsync`, `ReadAsStringAsync` and `ValidateAndThrowAsync`. CA2016 and CA1068 set to `warning` in `src/api/.editorconfig`. Confirmed empirically (reverted): dropping the token from `SendAsync` or `ReadAsStringAsync` fails the build with CA2016, moving it off last position fails with CA1068; forwarding `CancellationToken.None` from the endpoint makes the abort test hang instead of pass.
- Deviation, QA 4c dropped: `HttpClient.SendAsync` buffers the response body itself with its own token before returning, so by the time `ReadAsStringAsync(cancellationToken)` runs the content is already buffered and the token cannot be observed there. That forward is guarded by CA2016 only (as the plan allowed). The "while reading body" tests were not written.
- Deviation, edge case 2: it was not vacuous. ST-01 added `PlausibleServiceFailureTests`, which calls the service directly; those six calls now pass `CancellationToken.None`. ST-01's `FaultyAnalyticsService` was updated to the new signatures.
- Helpers live in the existing `Bach.Software.Tests/TestHelpers/` folder (not a new `Support/` folder): `TokenObservingHttpHandler` and `PlausibleServiceFactory` (for ST-03 to reuse). `TokenObservingContent` was not needed (see 4c).
- Abort tests (`Integration/AnalyticsCancellationTests.cs`): the test server reports an abort to the caller before the host has finished handling it, so a test-only `IStartupFilter` outermost middleware signals pipeline completion and the test awaits it before reading the log capture. Reused ST-01's `CapturingLoggerProvider`.
- Inverse guard asserts 502 plus exactly one error entry, following ST-01's dependency-timeout classification. Only the `pageReads` route has it, as planned.
- Unit tests in `Unit/PlausibleServiceCancellationTests.cs`: already-cancelled and cancelled-while-sending, for both methods (4 tests).
- OpenAPI: `PageReads_/PageLikes_DoesNotDocumentCancellationToken` added; the existing typed-response tests are untouched.
- `specs/enforcement.md` CS-04 row moved from Open to Enforced. No feature amendment needed.
- Checks: `dotnet build` clean, `dotnet test src/api/Bach.Software.sln` 77 passed. Frontend checks not run (backend-only change). Manual checklist steps 2 and 3 (curl smoke against a running API, live `/openapi/v1.json`) not run; step 3 is covered by the new OpenAPI tests.

## Verification report
**Verdict: pass-with-notes.**

### Checks
- `dotnet build src/api/Bach.Software.sln`: 0 warnings, 0 errors (CA2016 and CA1068 clean as warnings-as-errors).
- `dotnet test src/api/Bach.Software.sln`: 77 passed, 0 failed.
- Frontend checks not run: backend-only change, no `src/app/` file touched by this story (profile gates apply only to `src/api/` here). Coverage: no new branches in production code, new tests add execution of the cancellation paths; no coverage tool run for the backend.

### Analyzer bite (re-proved, fully reverted)
- `src/api/.editorconfig` holds `dotnet_diagnostic.CA2016.severity = warning` and `dotnet_diagnostic.CA1068.severity = warning`.
- Dropping the token from `_httpClient.SendAsync(request, cancellationToken)` failed the Infrastructure build with CA2016. Moving the token to the first parameter of `IAnalyticsService.GetPageLikes` failed the Application build with CA1068. Both files were restored exactly (diff against a backup and the original diff stat match; full solution builds clean afterwards).

### Acceptance criteria
| AC | Result | Evidence |
|---|---|---|
| 1 | pass | `IAnalyticsService.GetPageReads/GetPageLikes(string url, CancellationToken cancellationToken)`; `PlausibleService` implements the same signatures; solution compiles. |
| 2 | pass | Both handlers in `AnalyticsEndpoints.cs` take `CancellationToken cancellationToken` and forward it to `ValidateAndThrowAsync` and the service call. Tests `GetPageReads_/GetPageLikes_ClientAbortsRequest_CancelsPlausibleCall` pass (token bound to `RequestAborted` reaches the stub handler). |
| 3 | pass | `SendRequest(string, CancellationToken)` forwards to `SendAsync(request, cancellationToken)`; both public methods call `ReadAsStringAsync(cancellationToken)`. `JsonSerializer.Deserialize` is now wrapped in `ParseQueryResult`, which is ST-01's change (JsonException to `PlausibleResponseException`), not this story's. |
| 4 | pass | `Unit/PlausibleServiceCancellationTests`: already-cancelled and cancelled-while-sending for both methods, asserting `OperationCanceledException`, `ObservedToken.CanBeCanceled` and (pre-cancelled) `IsCancellationRequested`. |
| 5 | pass | `GetPageReads_/GetPageLikes_ClientAbortsRequest_LogsNoErrorEntry` assert no entry at Error or above and status below 500, after awaiting pipeline completion (outermost `IStartupFilter` signal), so the assertion is not vacuous. Inverse guard `GetPageReads_PlausibleTimesOutWithoutClientAbort_Returns502AndLogsOnce` asserts 502 and exactly one error entry. |
| 6 | pass | Build and tests green; `OpenApiDocumentTests.PageReads_/PageLikes_DoesNotDocumentCancellationToken` assert exactly one parameter, `url`. |

### Judgment of recorded deviations
- QA 4c dropped: accepted. `HttpClient.SendAsync` defaults to `ResponseContentRead` and buffers the body before returning, so the body-read token is unobservable. CA2016 guards the `ReadAsStringAsync` forward, and the developer's claim that dropping it fails the build is consistent with the proven analyzer severity. The QA plan explicitly allowed this fallback.
- ST-01's `PlausibleServiceFailureTests` passing `CancellationToken.None`: accepted. Those tests deliberately do not exercise cancellation, and edge case 2 allows `CancellationToken.None`. `FaultyAnalyticsService` was updated to the new signatures.
- Helpers in `TestHelpers/` instead of `Support/`: accepted. This matches the existing folder (ST-01 already created it); `TokenObservingHttpHandler` and `PlausibleServiceFactory` are reusable by ST-03.

### Compliance
- `specs/enforcement.md` CS-04 row moved from Open to "Enforced - build" with an accurate rationale (severity entries, tests).
- Grep of `src/api` `.cs` and `.editorconfig` for FEAT/ST/AC/ADR/QA plan/finding/criterion/CS-04 references: none. Test names describe behaviour. No `TestContext` use (xunit 2.9.2).
- No component, docs, or release obligations (profile: none; no frontend surface change; OpenAPI unchanged).

### Notes (non-blocking)
- Manual checklist steps 2 (curl smoke) and 3 (live `/openapi/v1.json`) were not run; step 3 is covered by the new OpenAPI tests, step 2 by the abort log tests.
- The inverse guard exists only for `pageReads`, as planned.
- The PR pipeline (including `40-build-deploy-aks.yml`) is not yet run; the maintainer links the PR in the frontmatter.
