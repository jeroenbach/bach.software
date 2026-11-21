---
id: ST-01
type: story
feature: FEAT-001
status: done
approved_by: "auto (delegated by feature approval)"
pr: ""
---

# Story: Backend error handling with classified problem details (API-04, CS-03)

## Decided without the maintainer (research)

Settled from research during story prep, not reviewed by the maintainer. Override any of these freely.

- AC12 (CORS) → promoted to binding; the error path must attach `Access-Control-Allow-Origin`/`Vary: Origin` to 4xx/5xx problem responses for allowed origins
- AC13 → keep `application/problem+json` (RFC 9457); assert the runtime 400 content type; Kiota keys error parsing by status code and normalizes the `+json` suffix
- Q1 (cascade) → keep FluentValidation's default Continue; an empty url yields `["urlRequired","urlInvalid"]`
- Q2 → a general `BadHttpRequestException` arm maps to its own `StatusCode` (missing `url` → 400), detail-free, no code
- Q3 → a client abort is handled by the framework (499, Debug log, handler never invoked); a dependency timeout (`TaskCanceledException`, not request-aborted) is classified 502; the former maintainer open item is closed
- Q4 → malformed Plausible JSON (`JsonException`) and a null result both throw the dedicated dependency exception → 502

## Functional
### User story
As Jeroen (the maintainer), I want backend failures classified by cause and reported through one central handler, so that an unreachable Plausible Analytics (502) is distinguishable in logs and monitoring from a real bug (500), and so that the frontend gets structured, code-based problem details to show the visitor a clear message.

### Acceptance criteria
1. Given a Plausible call that fails with an HTTP error (`HttpRequestException`), when `GET /api/analytics/pageReads` or `GET /api/analytics/pageLikes` is called, then the response is `502` with `application/problem+json`, a detail-free body (no stack trace, no exception message, no `code` extension), and exactly one error-level log entry is written for the request.
2. Given a Plausible response that cannot be deserialized (a thrown `JsonException` from malformed JSON or a body missing a `required` member, or a body that deserializes to literal `null`), when either endpoint is called, then the response is `502` (not 500), thrown as a dedicated Infrastructure exception type that is neither `AppException` nor a bare `InvalidOperationException`.

   > **PROPOSED (adversarial review, blocker, finding 2):** "cannot be deserialized" must cover a `JsonException` from malformed JSON, not only a null result. Wrap the `JsonSerializer.Deserialize<QueryResult>(...)` call so both a thrown `JsonException` and a null result raise the dedicated dependency exception (→ 502), honouring DECIDED decision 11 / ADR 1a-A. Add the Q4 test `GetAnalytics_WhenPlausibleResponseIsMalformedJson_Returns502`.

   DECIDED (research): Adopt as proposed. Wrap the `JsonSerializer.Deserialize<QueryResult>(...)` call in `PlausibleService` so both a thrown `JsonException` and a null result raise the dedicated Infrastructure dependency exception, which the handler maps to 502.
   Why: DECIDED decision 11 (maintainer) is explicit that "Unparseable Plausible responses map to 502", and ADR 1a-A gives the rationale ("a malformed dependency response is the dependency failing"). The common unparseable case is malformed/truncated JSON (`JsonException`), not a literal JSON `null`; leaving it at 500 would silently under-implement an approved decision. Covered by the Q4 test and resolves ST-03 AC4.
   Sources: feature spec Decision log 11, ADR 1a-A; `PlausibleService.cs` (deserialize then null-check at lines 62-66 / 108-112).
3. Given an unclassified exception thrown anywhere in the request (for example a `NullReferenceException` forced in a test via a faulty `IAnalyticsService`), when either endpoint is called, then the response is `500` `ProblemDetails` that is detail-free, with one error-level log entry.
4. Given an invalid `url` (empty, or not an absolute http/https URL), when either endpoint is called, then the response is `400` `ValidationProblemDetails` whose `errors` dictionary values are error codes (for example `urlRequired`, `urlInvalid`), not FluentValidation's English prose, and the body carries no English `ErrorMessage` text.
5. Given the validator rules in `UrlInputValidator`, then every rule sets an explicit error code taken from the `ErrorCodes` catalog, and the handler projects `e.ErrorCode` (not `e.ErrorMessage`) into the validation dictionary through its own explicit `FluentValidation.ValidationException` branch (not only a `Classify` arm).
6. Given `AnalyticsEndpoints.cs`, then neither `GetPageReads` nor `GetPageLikes` contains a `try/catch`, the `LogUnexpectedError` logger message is removed, and both keep their typed `Results<Ok<...>, BadRequest<ValidationProblemDetails>, ProblemHttpResult>` return unions.
7. Given the root route group in `Program.cs`, then both `ProducesProblem(500)` and `ProducesProblem(502)` are declared once for the API with the `ProblemDetails` schema, and the runtime OpenAPI document for `pageReads` and `pageLikes` still contains the 400 `ValidationProblemDetails` reference, a 500 response and a new 502 response, each with a problem schema.
8. Given `Program.cs`, then exactly one handler is registered via `AddExceptionHandler<ProblemDetailsExceptionHandler>()` plus `AddProblemDetails()`, `UseExceptionHandler()` is in the pipeline, and the middleware's duplicate diagnostics log is suppressed (`SuppressDiagnosticsCallback`), proven by test: one failing request produces exactly one error log entry.
9. Given the backend sync test `ErrorCodesSyncTests` (adopted from the API-04 reference), when it runs, then it regenerates `src/app/errors/error-codes.json` from the `ErrorCodes` catalog (code to placeholder names), fails when the committed file was stale, and a second test fails when two groups produce the same wire code. The committed file lists at least `urlRequired` and `urlInvalid`.
10. Given the existing tests, then `AnalyticsEndpointTests.GetPageLikes_WhenPlausibleRequestFails_*` and `...ResponseCannotBeDeserialized_*` assert `HttpStatusCode.BadGateway` instead of `InternalServerError`, and `OpenApiDocumentTests.PageReads_DeclaresTypedResponses` additionally asserts the `502` response.
11. Given `dotnet build` and `dotnet test src/api/Bach.Software.sln`, then both are clean (analyzers are warnings-as-errors) and no test is removed without a replacement.

### Edge cases
- A `ValidationException` thrown with multiple failures on one property: the dictionary keeps all codes for that property.
- A client-aborted request is not logged as an error. The ASP.NET Core exception-handling middleware intercepts a request-abort `OperationCanceledException`/`IOException` (when `HttpContext.RequestAborted.IsCancellationRequested`) before invoking any `IExceptionHandler`: it sets status 499, records the abort metric, logs at Debug via `RequestAbortedException()` (never Error), and returns without rethrowing. So this story's handler is never reached for a client abort and adds no cancellation arm for it; it must only avoid classifying an abort as a 500 (which it cannot, since the handler is never called). A dependency timeout is the distinct case below.
- A dependency timeout surfaces as `TaskCanceledException` with `RequestAborted` NOT cancelled; it reaches the handler and is classified 502 (a dependency failing, "retry later") per ADR 1a-A, detail-free. Because the framework guarantees a genuine client abort never reaches the handler, a `TaskCanceledException`→502 arm cannot mislabel an abort.
- The `errors` dictionary property names keep the existing casing used by the Kiota client today.
- The 4xx body carries machine-readable `code` and `placeholders` extensions where an `AppException` carries them; 5xx bodies never carry a `code`.

### Out of scope
- CancellationToken threading (ST-02) and new unit tests for `UrlInputValidator`/`PlausibleService` mapping (ST-03).
- Generating the committed `openapi/` document and regenerating the Kiota client (ST-04).
- Any frontend change, including the `errors.*` translation catalog (ST-05).

## Design reference
No prototype (design phase skipped, decision log 1). No visual change.

## Architecture reference
Implements area 1a (API-04 + CS-03) and the DECIDED entries on error codes (decision 9), OpenAPI problem-schema preservation (decision 12), and 502 for unparseable responses (ADR 1a-A, decision 11).

Files and areas touched:
- New in `src/api/Bach.Software.Application/`: `ErrorCode`, `FailureKind`, `AppException`, typed `ErrorCodes` catalog (a group for the URL validation codes). Adopt the reference at `/Users/jeroenbach/Source/claude-plugins/plugins/spec/standards/dotnet-api/examples/API-04/`.
- New in `src/api/Bach.Software.Infrastructure/PlausibleAnalytics/`: dedicated exception for an unparseable dependency response, thrown from `Services/PlausibleService.cs` instead of the current bare exception.
- New in `src/api/Bach.Software.Web/ErrorHandling/`: `ProblemDetailsExceptionHandler : IExceptionHandler` with `Classify` arms (validation 400 via its own `FluentValidation.ValidationException` branch, `AppException` kinds, a general `BadHttpRequestException` arm mapping to its own `StatusCode`, `HttpRequestException` and the dedicated dependency exception and `TaskCanceledException` all 502, default 500) and its own validation-dictionary projection. No client-abort arm is added: the framework intercepts request-abort cancellations before the handler (see Edge cases). The error path also attaches `Access-Control-Allow-Origin`/`Vary: Origin` for allowed origins (AC12).
- Modified: `src/api/Bach.Software.Web/Endpoints/AnalyticsEndpoints.cs`, `src/api/Bach.Software.Web/Program.cs`, `src/api/Bach.Software.Application/Validation/UrlInputValidator.cs`.
- Removed or folded: `src/api/Bach.Software.Web/Extensions/ValidationExceptionExtensions.cs` (projection moves into the handler).
- Tests in `src/api/Bach.Software.Tests/`: `Integration/AnalyticsEndpointTests.cs`, `Integration/OpenApiDocumentTests.cs`, new `ErrorCodesSyncTests` (writes `src/app/errors/error-codes.json`, the path follows the reference layout and may be adjusted by the developer as long as ST-05 reads the same file), new handler tests.
- Generated artifact committed: `src/app/errors/error-codes.json`.

Dependencies: none (first story). Blocks ST-02 (shared files), ST-04 (OpenAPI content), ST-05 (error-codes.json and classified responses). No release bookkeeping (profile: none). Documentation: none required (backend types are not in `specs/components.md`); `specs/enforcement.md` rows for API-04 and CS-03 move off Open in this story.

## QA plan

Backend-only story: xUnit in `src/api/Bach.Software.Tests/`, run with `dotnet test src/api/Bach.Software.sln`. No frontend, UI, Storybook, Playwright or timezone concerns. Tests go through the real host (API-03) with plain xUnit asserts. Names follow `MethodName_Scenario_ExpectedBehaviour` (CA1707 already suppressed in the Tests project). A route Theory (`pageReads`, `pageLikes`) covers both endpoints wherever a criterion says "either endpoint".

### Fixtures and utilities

Existing: `CustomWebApplicationFactory` (in-memory `PLAUSIBLE_API_TOKEN`, `MockHttpMessageHandler` behind a mock `IHttpClientFactory`). Established pattern to keep: any test that registers an error responder uses its own `using var factory`, because the class-fixture handler keeps responders for the fixture lifetime.

New (in `Bach.Software.Tests/TestHelpers/`):
- `CapturingLoggerProvider`: an `ILoggerProvider` collecting `(Category, LogLevel, Exception?, Message)` for every category. Wired through a `CustomWebApplicationFactory` constructor option or `ConfigureLogging`. Hand-rolled to avoid a new package; `Microsoft.Extensions.Diagnostics.Testing` (`FakeLogger`) is an acceptable alternative.
- `FaultyAnalyticsService`: an `IAnalyticsService` stub that throws a supplied exception, registered via `WithWebHostBuilder` plus `RemoveAll<IAnalyticsService>()`. ST-02 changes the interface signature, so it must update this stub in the same edit.
- Factory option to supply `CORS_ALLOWED_ORIGINS` through the existing in-memory configuration (never by editing `appsettings*.json`).
- Test-only `ErrorCode` values built with the public `ErrorCode` constructor (`new ErrorCode("Test", "Case", FailureKind.NotFound, new { id = 1 })`) to exercise `AppException` arms. Production throw sites still use only the catalog.
- A small helper reading a problem body as `JsonDocument` (assert on values, not raw strings).

All tests run with the host in the `Development` environment (the `WebApplicationFactory` default), the environment most likely to leak detail, so the detail-free assertions are meaningful.

### Acceptance criteria to test mapping

| AC | Test (class, method) | Kind |
|---|---|---|
| 1 | `AnalyticsEndpointTests.GetAnalytics_WhenPlausibleReturnsHttpError_Returns502DetailFreeProblem` (Theory, both routes): 502, content type `application/problem+json`, `title` present, and no `detail`, `errors`, `code`, `placeholders`, `exception` or stack-trace members; body contains neither the `HttpRequestException` message ("Response status code") nor the sentinel token `test-token`. | integration |
| 1 | `AnalyticsEndpointTests.GetAnalytics_WhenPlausibleConnectionFails_Returns502` (MockHttp `.Throw(new HttpRequestException())`, the network-failure variant of the same class) | integration |
| 1, 8 | `ExceptionHandlerLoggingTests.GetAnalytics_WhenPlausibleFails_LogsExactlyOneError` (Theory, both routes): across all categories exactly one entry at level `Error`; its category is the handler's and its `Exception` is the `HttpRequestException`. | integration |
| 2 | `AnalyticsEndpointTests.GetAnalytics_WhenPlausibleResponseCannotBeDeserialized_Returns502` (body `null`, Theory, both routes) and `AnalyticsEndpointTests.GetAnalytics_WhenPlausibleResponseIsMalformedJson_Returns502` (body `not json`, Theory, both routes; the Q4 test), plus the same detail-free and one-error-log assertions | integration |
| 2 | `PlausibleServiceFailureTests.GetPageReads_WhenResponseDeserializesToNull_ThrowsDependencyResponseException`, `..._WhenResponseIsMalformedJson_ThrowsDependencyResponseException` and the `GetPageLikes` twins: `Assert.IsType<NewExceptionType>`, and assert it is not an `AppException` and not an `InvalidOperationException`. Drives `PlausibleService` through MockHttp, no host. (Mapping tests stay with ST-03.) | unit |
| 3 | `AnalyticsEndpointErrorMappingTests.GetAnalytics_WhenUnclassifiedExceptionThrown_Returns500DetailFreeProblem` (Theory, both routes, `FaultyAnalyticsService` throws `NullReferenceException("sentinel-secret")`): 500, `application/problem+json`, body free of the sentinel, `NullReferenceException` and stack frames, no `code`/`detail`. | integration |
| 3, 8 | `ExceptionHandlerLoggingTests.GetAnalytics_WhenUnclassifiedExceptionThrown_LogsExactlyOneError` (error entry carries the `NullReferenceException`) | integration |
| 4 | `AnalyticsEndpointValidationTests.GetAnalytics_WithEmptyUrl_Returns400WithErrorCodes`: 400, `errors` keyed `Url`, values contain `urlRequired`, body free of "URL is required", "must not be empty" and "must be a valid". | integration |
| 4 | `AnalyticsEndpointValidationTests.GetAnalytics_WithNonHttpUrl_Returns400WithUrlInvalid` (InlineData: `not-a-valid-url`, `ftp://bach.software/x`, `/relative/path`): `errors.Url` equals `["urlInvalid"]`, no prose. | integration |
| 4 (edge) | `AnalyticsEndpointValidationTests.GetAnalytics_WithMultipleFailuresOnOneProperty_KeepsAllCodes`: the empty-URL case returns every code that fired for `Url` (see finding Q1 on cascade). | integration |
| 4 (edge) | `AnalyticsEndpointValidationTests.GetAnalytics_WithMissingUrlParameter_Returns400NotServerError`: no `url` query parameter at all. In `Development` the framework throws `BadHttpRequestException` into the exception handler (`ThrowOnBadRequest`); the new general `BadHttpRequestException` arm maps it to its `StatusCode` (400), detail-free, no `code`. Expect 400 (Q2 decided). | integration |
| 5 | `UrlInputValidatorErrorCodeTests.Validate_WithInvalidInputs_EveryFailureCarriesACatalogCode`: for empty, whitespace, relative and `ftp://` inputs, every failure's `ErrorCode` is a member of the `ErrorCodes` catalog's code set (reflected) and never FluentValidation's default (`NotEmptyValidator`, `PredicateValidator`). Code-only assertions, so it does not overlap ST-03's rule tests. | unit |
| 5 | The 400 body tests above prove the handler projects `ErrorCode` rather than `ErrorMessage` through its own `ValidationException` branch (a `Classify` arm alone yields an empty body, so the field dictionary being present is the proof). | integration |
| 3, 4, edge | `AnalyticsEndpointErrorMappingTests.GetAnalytics_WhenAppExceptionThrown_MapsKindToStatus` (Theory: `Invalid` 400, `NotFound` 404, `Conflict` 409, `Unprocessable` 422): status, `code` and `placeholders` extensions present, level is not `Error`. Pins every `Classify` arm of the kind switch; today nothing throws `AppException`, so without this the arms are untested and uncovered. | integration |
| edge | `AnalyticsEndpointErrorMappingTests.GetAnalytics_WhenAppExceptionHasFieldErrors_ReturnsValidationProblemWithCodes` (`WithError(code, "Url")`) | integration |
| edge | `AnalyticsEndpointErrorMappingTests.GetAnalytics_WhenAppExceptionHasUnknownKind_Returns500WithoutCode`: a `FailureKind` cast from an undefined value falls to the default arm, no `code` on a 5xx. | integration |
| edge | `AnalyticsEndpointErrorMappingTests.GetAnalytics_WhenDependencyTimesOut_Returns502` (`FaultyAnalyticsService` throws `TaskCanceledException` with `RequestAborted` not cancelled): 502, detail-free, no `code`. Pins the `TaskCanceledException`→502 arm (Q3). No direct-handler client-abort test is kept: on .NET 9 the exception-handling middleware intercepts a request-abort cancellation (499, Debug log) before the handler, so the handler has no abort arm to test; the client-abort suppression is covered end-to-end by ST-02 criterion 5. | integration |
| 6 | Not behaviourally testable. Verified by review checklist below (grep for `try`, `catch`, `LogUnexpectedError`, `ValidationExceptionExtensions` in `src/api`). The typed return union is guarded indirectly by the OpenAPI 400 `ValidationProblemDetails` assertion. | review + grep |
| 7 | `OpenApiDocumentTests.PageReads_DeclaresTypedResponses` extended: keeps the 200, the 400 `ValidationProblemDetails` ref and the 500 `ProblemDetails` ref, adds 502 with `application/problem+json` and `#/components/schemas/ProblemDetails`. | integration |
| 7 | New `OpenApiDocumentTests.PageLikes_DeclaresTypedResponses` with the same assertions (the criterion names both operations; today only `pageReads` is checked). | integration |
| 7 | Grep check that `AnalyticsEndpoints.cs` no longer calls `.ProducesProblem(500)` itself and `Program.cs` declares 500 and 502 once on the root group (the document cannot reveal a duplicate declaration). | review + grep |
| 8 | `ExceptionHandlerRegistrationTests.Services_Always_RegisterExactlyOneProblemDetailsExceptionHandler`: `factory.Services.GetServices<IExceptionHandler>()` is a single `ProblemDetailsExceptionHandler`. `UseExceptionHandler` in the pipeline and `AddProblemDetails` are proven by every 4xx/5xx test getting a problem body. | integration |
| 8 | The one-error-log tests above prove `SuppressDiagnosticsCallback`; sensitivity proven by the mutation step in the manual checklist. | integration + manual |
| 9 | `ErrorCodesSyncTests.Frontend_contract_file_matches_the_backend_codes` (regenerates `src/app/errors/error-codes.json`, fails when the committed copy was stale) and `Error_codes_are_unique_across_groups`, adopted from the reference. Add `Error_codes_with_colliding_wire_code_are_reported` against a small fixture catalog (e.g. group `A` method `BC` and group `Ab` method `C`, both `abC`) so the duplicate detector is itself proven to fail, not only to pass on the real catalog. This needs the reflection routine to take the catalog type as a parameter. | unit |
| 9 | Same test class: `Frontend_contract_file_lists_the_url_validation_codes` asserts the generated map contains `urlRequired` and `urlInvalid`, each with an empty placeholder array. | unit |
| 10 | `AnalyticsEndpointTests.GetPageLikes_WhenPlausibleRequestFails_ReturnsBadGateway` and `..._ResponseCannotBeDeserialized_ReturnsBadGateway` (renamed with the assertion, since the old names state the wrong status); `OpenApiDocumentTests.PageReads_DeclaresTypedResponses` asserts 502 (row above). | integration |
| 11 | `dotnet build src/api/Bach.Software.sln` and `dotnet test src/api/Bach.Software.sln` clean. The test list must be a superset: `PageReadsTest.cs` is untouched here (ST-03 deletes it), and every pre-existing test method either keeps its name or is renamed per AC10. | gate |
| 12 | `CorsErrorResponseTests.GetAnalytics_WhenRequestFailsFromAllowedOrigin_KeepsCorsHeader` (Theory over 400/500/502 triggers, `CORS_ALLOWED_ORIGINS` set through the factory, request carries an allowed `Origin`): the problem response carries `Access-Control-Allow-Origin` for that origin and `Vary: Origin`. | integration |
| 13 | `AnalyticsEndpointValidationTests` asserts the runtime 400 `Content-Type` is `application/problem+json` (while the document declares `application/json`); recorded for ST-04 to reconfirm against the regenerated Kiota client. | integration |

### Binding additional criteria (AC12, AC13)

- **AC12, CORS survives the error path.** A failing request from an allowed `Origin` still carries `Access-Control-Allow-Origin` (and `Vary: Origin`) on the 4xx/5xx problem response. A browser cannot read a response without the header, so the frontend (ST-05) would get a network error with no `responseStatusCode` instead of the 502 it maps to `errors.unavailable`. Test: `CorsErrorResponseTests.GetAnalytics_WhenRequestFailsFromAllowedOrigin_KeepsCorsHeader` (Theory over 400, 500 and 502 triggers, `CORS_ALLOWED_ORIGINS` set through the factory, request carries `Origin`).

  > **PROPOSED (adversarial review, blocker, finding 1):** promote AC12 to a binding criterion and correct its mechanism. `UseExceptionHandler` runs first in the pipeline, so the problem response it writes carries no CORS header unless the handler adds it; the earlier "`UseExceptionHandler` before `UseCors` keeps the header" reasoning is backwards and must not be implemented as-is. Production is cross-origin (`bach.software` → AKS), so this breaks ST-05's visitor-facing error message. Resolution: have the error path attach `Access-Control-Allow-Origin` (and `Vary: Origin`) to 4xx/5xx problem responses for allowed origins (copy the header inside the handler, or a pipeline arrangement proven to apply CORS to the error response), verified by `CorsErrorResponseTests`.

  DECIDED (research): Adopt as proposed. AC12 is binding: the error path must attach `Access-Control-Allow-Origin` and `Vary: Origin` to 4xx/5xx problem responses for allowed origins, verified by `CorsErrorResponseTests`. Do not rely on the "`UseExceptionHandler` before `UseCors` keeps the header" reasoning. The mechanism (copy the header in the handler, an `OnStarting` hook, or a pipeline arrangement proven by the test) is left to the developer, provided the test passes.
  Why: the browser drops any cross-origin response lacking `Access-Control-Allow-Origin`, and production is cross-origin (`bach.software` → AKS), so without the header ST-05's reporter receives a network error with no `responseStatusCode` and can never show `errors.unavailable`, defeating this feature's visitor-facing goal (the Data flow diagram). The `IExceptionHandler` path writes the response after `ClearHttpContext()` clears any header the CORS middleware set, so the error path must re-attach it.
  Sources: Microsoft "Enable CORS in ASP.NET Core" (browser requires `Access-Control-Allow-Origin`, middleware ordering); the exception-handling middleware clears the response before writing the problem body; `Program.cs` pipeline order and `ServiceCollectionExtensions.cs` default CORS policy.
- **AC13, error responses keep the Kiota-visible contract.** Assert the runtime `Content-Type` of the 400 body against the `openapi` declaration: the document declares 400 under `application/json` (from `BadRequest<ValidationProblemDetails>`), while the handler writes `application/problem+json`. Assert the runtime type and record that Kiota handles the `+json` suffix. Settle before ST-04 commits the document.

  > **PROPOSED (adversarial review, should-fix, finding 6):** accept AC13 as binding. Keep the standard-compliant `application/problem+json` on the handler, assert the runtime 400 content type, and confirm the generated Kiota client still parses the `ValidationProblemDetails` body despite the `+json` suffix mismatch. Record the result so ST-04 freezes the committed document against verified behaviour, not an assumption.

  DECIDED (research): Adopt as proposed. Keep `application/problem+json` on the handler; the test asserts the runtime 400 content type is `application/problem+json`.
  Why: RFC 9457 and API-04 ("Every error response is RFC 9457") mandate `application/problem+json`, so aligning the document to `application/json` would be the wrong direction. Kiota keys its `errorMappings` by status code, not content type, and normalizes a vendor `+json` suffix to `application/json` when selecting the parse-node factory, so the declared-vs-runtime suffix mismatch does not stop the client parsing the body. ST-04 reconfirms this when it regenerates the client against the committed document.
  Sources: RFC 9457; `standards/dotnet-api/API-04 Exception types and problem details.md` (line 47); Kiota content-type suffix normalization in the abstractions `ParseNodeFactoryRegistry`.

### UI states

None. No UI is touched.

### Regression classes from the packs

- **Reactivity, async cancellation, state migration:** not touched. ST-01 only declares the exception type and handler; a client abort is suppressed by the framework (no handler arm), a dependency timeout maps to 502 (covered by the edge test above), and the token itself arrives in ST-02.
- **Wire contract drift** (the dotnet-api pack's trouble spot): the `ErrorCodesSyncTests` pair plus the OpenAPI document tests.
- **Double logging:** the exactly-one-error-entry assertions across all log categories.

### Coverage

Backend coverage (coverlet, tracked by Codecov) must not decrease. The new production code is fully reachable from the plan: every `Classify` arm (validation, each `FailureKind`, `HttpRequestException`, the dependency exception, default), `CreateProblemDetails` for plain, field-scoped and 5xx bodies, `AppException.Message` (through the logging tests), `ErrorCode` placeholder reflection, and the validator codes. Knowingly left uncovered: nothing, provided the developer does not adopt unused reference members. If `AppException.WithError`/`Errors`/`AppError` and the `errorDetails` extension are kept they are covered by the field-error test above; if the developer drops them as unused, the test and the criterion edge shrink with them (record it in Implementation notes). `SqlException` from the reference handler arm has no counterpart here and must not be copied in.

### Regression risk

- **Touched flows:** both analytics endpoints, `Program.cs` pipeline order and root group, validator messages and codes, OpenAPI document. Guarded by `AnalyticsEndpointTests` (happy path and invalid URL), `HealthEndpointTests` (the root group `MapGroup("/")` must not break `/health`; the 500/502 declarations now also appear on `/health` in the document, which `OpenApiDocumentTests.Document_UsesApiServerWithUnprefixedPaths` should confirm still has unprefixed paths), and `OpenApiDocumentTests`.
- **Other stories:** ST-02 reuses `FaultyAnalyticsService`, `CapturingLoggerProvider` and the handler, and edits the same files. ST-03 deletes `PageReadsTest.cs` and adds validator tests that must use codes, not messages. ST-04 consumes the document (AC13 and the 502 declaration). ST-05 consumes `error-codes.json` and the CORS behaviour (AC12).
- **Frontend:** no source change. The generated client has no 502 mapping until ST-04, so a 502 is thrown as a generic `ApiError` and, as today, shown nowhere; no visible regression.
- **Lint on the generated file:** `src/app/errors/error-codes.json` is linted by the frontend ESLint (`formatters: true`). Run `pnpm lint:fix` after the sync test writes it. If lint rewrites it, the sync test goes red on the next run, so the serializer output (indentation, empty arrays, trailing newline) must be lint-stable.

### Environment quirks

- No timezone pin, container or env var is needed for the backend tests.
- `ErrorCodesSyncTests` writes into the working tree. Resolve the repo root by walking up from `AppContext.BaseDirectory` to a marker (`pnpm-workspace.yaml` or `.git`) instead of counting `..` segments: the reference's `../..` is wrong here (output is `src/api/Bach.Software.Tests/bin/<Config>/net9.0`, seven levels below the root).
- Tests that register error responders or a faulty service use their own factory, never the shared class fixture.

### Manual verification checklist

1. Edit `src/app/errors/error-codes.json` (drop `urlInvalid`), run the sync test: it fails and rewrites the file; `git diff` then shows the restored file only.
2. Mutation check for AC8: temporarily remove `SuppressDiagnosticsCallback`, run the logging tests: they fail with two error entries. Restore.
3. Mutation check for AC1: temporarily make `HttpRequestException` fall to the default arm: the 502 tests fail.
4. Run `pnpm dev:api` with `PLAUSIBLE_API_URL=http://localhost:1` and `curl -i 'http://localhost:8080/api/analytics/pageReads?url=https://bach.software/x'`: expect 502 `application/problem+json`, no detail, one error log line in the console.
5. Repeat with `-H 'Origin: http://localhost:3000'` against a `CORS_ALLOWED_ORIGINS=localhost` run and confirm `Access-Control-Allow-Origin` is present on the 502 (AC12).
6. Review checklist for AC6 and AC7: no `try`/`catch`/`LogUnexpectedError` in `AnalyticsEndpoints.cs`; `ValidationExceptionExtensions.cs` removed with no remaining references; `ProducesProblem(500|502)` appear once, in `Program.cs`.
7. Confirm `specs/enforcement.md` rows for API-04 and CS-03 moved off Open.

### Findings and questions for review

- **Q1 (vague criterion, AC4):** an empty `url` fails both `NotEmpty` and `Must` under FluentValidation's default cascade, so the body carries `["urlRequired", "urlInvalid"]`. The criterion lists the codes only as examples. Decide: keep both (the multiple-codes edge case then has a natural test), or add `Cascade(CascadeMode.Stop)` so an empty URL yields exactly `["urlRequired"]`. The plan asserts `Contains("urlRequired")` for empty and exact equality for the non-empty invalid cases until decided.

  > **PROPOSED (adversarial review, should-fix, finding 5):** keep Continue (both codes fire for empty), which matches AC4's listed examples and gives the multiple-failures edge a natural trigger; set an explicit per-rule code either way. Alternative: `Cascade(CascadeMode.Stop)`, in which case the multiple-codes edge needs a different property or a two-rule-on-one-property fixture.

  DECIDED (research): Keep FluentValidation's default Continue cascade. An empty `url` fires both rules and yields `errors.Url = ["urlRequired","urlInvalid"]`; each rule sets an explicit per-rule code regardless (AC5).
  Why: the approved spec leans this way on two counts. AC4 lists both codes as the examples, and the story's own edge case "a `ValidationException` with multiple failures on one property keeps all codes" presupposes that multiple codes can fire on one property, which only Continue provides. Continue is also the current behaviour, so it is the smallest change (Stop would add `.Cascade(CascadeMode.Stop)` and leave the multiple-codes edge without a natural trigger). Reversible by a one-line cascade change.
  Sources: this story's AC4 and Edge cases; FluentValidation default `CascadeMode.Continue`; `UrlInputValidator.cs`.
- **Q2 (uncovered path):** a missing `url` parameter becomes a `BadHttpRequestException` handled by the central handler in `Development`, but a plain 400 in `Production`. Propose a `BadHttpRequestException` arm using its own `StatusCode` (reference has one only for 413), detail-free for any 4xx without a code. Without it the missing-parameter test fails with 500.

  > **PROPOSED (adversarial review, should-fix, finding 3):** add a general `BadHttpRequestException` arm mapping to its own `StatusCode` (a missing parameter → 400), detail-free, no `code`, so a malformed client request is never classified 500 and does not pollute the "500 = our bug" signal. Change the Q2 test `GetAnalytics_WithMissingUrlParameter_Returns400NotServerError` to expect 400.

  DECIDED (research): Adopt as proposed. Add a general `BadHttpRequestException` arm mapping to its own `StatusCode` (missing `url` → 400), detail-free, no `code`. The Q2 test expects 400.
  Why: API-04's rule table says a framework request problem such as `BadHttpRequestException` "propagates as-is" and gets "one arm in Classify, matched on the framework type (and `StatusCode` where it disambiguates)"; the reference already carries a 413 instance of exactly this arm, and `BadHttpRequestException.StatusCode` defaults to 400. The feature thesis reserves 500 for bugs, and a malformed client request is not our bug. Generalising the reference's 413-specific arm to use `.StatusCode` covers both.
  Sources: `API-04 ...md` rule table (framework signals a request problem); reference `ProblemDetailsExceptionHandler.cs` (the 413 arm); feature ADR 1a-A / Public surface impact (500 = our bug).
- **Q3 (untestable edge as written):** the cancellation edge states no expected status or log level. Proposed rewrite: "when `RequestAborted` is cancelled and the exception is an `OperationCanceledException`, the handler writes no error-level log entry and does not report a 500". Also unstated: an `HttpClient` timeout surfaces as `TaskCanceledException` with `RequestAborted` not cancelled. Decide its class (502 as a dependency failure, or the 500 default); the plan has no test for it until decided.

  > **PROPOSED (adversarial review, should-fix, finding 4):** ST-01 adds the handler arm now so ST-02 criterion 5 has a producer: when `RequestAborted.IsCancellationRequested` and the exception is `OperationCanceledException`, write no error-level log and emit no 500; a timeout (`TaskCanceledException` with `RequestAborted` not cancelled) is classified 502 per ADR 1a-A. The exact wire response for the client-abort case is a maintainer decision (see Open item in Adversarial review).

  DECIDED (research): The proposal's premise does not hold on this stack, so adopt a corrected version. The client abort needs NO handler arm: ASP.NET Core's exception-handling middleware intercepts a request-abort `OperationCanceledException`/`IOException` (`RequestAborted.IsCancellationRequested`) before invoking any `IExceptionHandler`. It sets status 499 (if the response has not started), records the abort metric, logs at Debug via `RequestAbortedException()` (never Error), and returns without rethrowing. So ST-02 criterion 5 (no error log for a client abort) is produced by the framework, and ST-01 only has to not add an arm that would log an abort as an error (it cannot, since the handler is never reached). The dependency-timeout case (`TaskCanceledException`, `RequestAborted` not cancelled) does reach the handler and is classified 502 per ADR 1a-A; the framework interception guarantees this arm cannot catch a genuine client abort. The former maintainer open item (the client-abort wire response) is closed: it is 499 by framework default, with nothing written to the aborted connection, so it is not a product decision.
  Sources: `aspnetcore/.../ExceptionHandlerMiddlewareImpl.cs` (release/9.0: request-aborted short-circuit sets `Status499ClientClosedRequest`, logs `RequestAbortedException()`, skips handlers, returns); feature ADR 1a-A (dependency failure → 502).
- **Q4 (gap against ADR 1a-A):** malformed JSON from Plausible throws `JsonException`, not a null result, and today would be a 500. The ADR rationale (an unparseable dependency response is the dependency failing) argues for 502. Propose extending AC2 to cover `JsonException` with a test `GetAnalytics_WhenPlausibleResponseIsMalformedJson_Returns502`; otherwise record it as a known 500.

  DECIDED (research): Adopt. Malformed JSON (`JsonException`) and a null result both become the dedicated dependency exception → 502; add `GetAnalytics_WhenPlausibleResponseIsMalformedJson_Returns502`. See the decision under AC2; this enforces DECIDED decision 11.
- **Q5 (AC13):** runtime 400 content type (`application/problem+json`) differs from the declared one (`application/json`); see the proposed criterion.

## Adversarial review
Lite, story-level. Verified against the current `main` tree (`Program.cs`, `AnalyticsEndpoints.cs`, `PlausibleService.cs`, `UrlInputValidator.cs`), ST-02, the API-04 reference handler, and Microsoft's CORS docs. The planner's flagged items are each settled below; two are blockers.

1. **(blocker) CORS headers are dropped on error responses, and AC12's justification is backwards (AC12).** AC12 argues CORS survives *because* `UseExceptionHandler` is registered before `UseCors`. That is the ordering that loses CORS. Microsoft's CORS guidance confirms the exception-handling middleware runs first, so any response it produces (the new 4xx/5xx problem bodies) goes out with no `Access-Control-Allow-Origin` header unless the handler adds it itself; the re-executed error path does not re-run `UseCors` (which sits downstream). Verified in `Program.cs`: `UseCors()` is registered before the endpoints, and ST-01 will insert `UseExceptionHandler()` ahead of it. Production is cross-origin (frontend `bach.software`, backend on AKS), so a 502 problem body without the CORS header is read by the browser as a network error with no `responseStatusCode`, and ST-05's reporter can never show `errors.unavailable`. That is the exact visitor-facing outcome this feature exists to deliver, so a silent CORS regression here defeats the whole vertical. Resolution (PROPOSED, routed below): promote AC12 to a binding criterion AND require the error path to actually attach the CORS header to 4xx/5xx problem responses (copy `Access-Control-Allow-Origin`/`Vary` in the handler, or a verified-working pipeline arrangement), proven by `CorsErrorResponseTests`. Do not implement the ordering AC12 currently describes on the assumption it works.
   Source: [Microsoft, Enable CORS in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-10.0).

2. **(blocker) Malformed Plausible JSON returns 500, contradicting DECIDED decision 11 / ADR 1a-A (Q4).** Decision 11 and ADR 1a-A are explicit: "Unparseable Plausible responses map to 502." Verified in `PlausibleService.GetPageReads`/`GetPageLikes`: the body is read, then `JsonSerializer.Deserialize<QueryResult>(responseContent)` runs. Malformed JSON throws `JsonException` *before* the `queryResult == null` check, so it never reaches the dedicated dependency exception AC2 introduces. `JsonException` is not `HttpRequestException`, not `AppException`, so the reference handler's default arm maps it to 500 with an error log. The deserialize-to-null case AC2 covers only fires for a literal JSON `null`; the realistic unparseable case (truncated/garbage body) is malformed JSON. Shipping AC2 as written leaves the common unparseable case at 500, a silent under-implementation of a DECIDED architecture entry. Resolution (PROPOSED, routed into AC2): wrap the deserialize so both a `JsonException` and a null result throw the dedicated Infrastructure dependency exception, so any unparseable response maps to 502; add the `JsonException` test from Q4.

3. **(should-fix) A missing `url` parameter maps to 500, polluting the 500 "this is a bug" signal (Q2).** Verified: `url` is a required non-nullable query parameter; omitting it is a binding failure. In `Development` (the test host default, per the QA plan) minimal APIs throw `BadHttpRequestException` (`ThrowOnBadRequest`), which reaches the handler and, with only the reference's 413 arm, falls to the default 500 arm. The feature's entire thesis is 500 = our bug; a malformed client request is not our bug. Not visitor-reachable (the frontend always sends `window.location.href`), hence should-fix not blocker, but it mislabels a client error in exactly the signal the 500/502 split exists to keep clean. Resolution (PROPOSED, routed into the findings block): add a general `BadHttpRequestException` arm mapping to its own `StatusCode` (so a missing parameter is 400), detail-free, no `code`; promote the Q2 missing-parameter test to expect 400.

4. **(should-fix) ST-01 must own the cancellation arm that ST-02 criterion 5 depends on, and classify an HttpClient timeout (Q3).** The reference handler has no `OperationCanceledException` arm, so an aborted request falls to the default 500 arm and is logged as an error. ST-02 criterion 5 ("a cancelled request produces no error log") has no producer unless ST-01 adds it, and ST-02's inverse-guard test expects a 5xx for an HttpClient timeout. Two distinct shapes must be told apart by `HttpContext.RequestAborted`: a client abort (`RequestAborted.IsCancellationRequested`) and a dependency timeout (`TaskCanceledException` with `RequestAborted` not cancelled). Per ADR 1a-A a dependency timeout is a dependency failure → 502; a client abort should produce no error log. Resolution (PROPOSED, routed into the edge/findings block): ST-01 adds the handler arm now (so it exists before ST-02): when `RequestAborted.IsCancellationRequested` and the exception is `OperationCanceledException`, write no error-level log and do not emit a 500; a timeout (`RequestAborted` not cancelled) is classified 502. Decision the maintainer still owns: the exact response for the client-abort case (status 499-style vs. let the connection drop) is unstated by the feature; recorded as an open item below.

5. **(should-fix) The validator cascade is undecided and shapes AC4's assertions (Q1).** Verified: `UrlInputValidator` sets no `Cascade(CascadeMode.Stop)`, so FluentValidation's default Continue makes an empty `url` fire both `NotEmpty` and `Must`, yielding `["urlRequired", "urlInvalid"]`. The plan handles this defensively (Contains for empty, exact equality for non-empty invalid), so implementation is not blocked, but the `errors.*` catalog and the multiple-codes edge test both depend on which answer is chosen. Resolution (PROPOSED, routed into the findings block): keep Continue (both codes fire for empty), because it gives the multiple-failures edge a natural trigger and matches AC4's listed examples; add explicit per-rule codes regardless. Alternative the maintainer may prefer: `Cascade(CascadeMode.Stop)` so empty yields exactly `["urlRequired"]`, in which case the multiple-codes edge needs a different property or a two-rule-on-one-property fixture.

6. **(should-fix) The 400 content-type mismatch must be settled before ST-04 commits the document (AC13).** Verified: the endpoints return `BadRequest<ValidationProblemDetails>`, so the OpenAPI document declares 400 under `application/json`, while the central handler writes `application/problem+json` at runtime. The Kiota client keys error parsing by status code, but the content-type suffix mismatch must be confirmed harmless (Kiota's `+json` suffix handling) or the declaration aligned, before ST-04 freezes the committed document and the whole frontend error vertical is generated from it. Resolution (PROPOSED, routed below): accept AC13; assert the runtime 400 content type and confirm the generated client still parses the body (keeping the standard-compliant `application/problem+json` on the handler), and record the finding so ST-04 does not regenerate against a stale assumption.

All six findings are now settled by research (see the `DECIDED (research)` entries inline and the rollup under the H1), so the story moves to `awaiting-approval`. Findings 1 and 2 (CORS, malformed JSON) are adopted as proposed; finding 4's premise was corrected by research (the framework, not an ST-01 handler arm, suppresses a client abort) and its former maintainer open item is closed. None is a silent override of the approved feature architecture: findings 2 and 4 enforce DECIDED entries (decision 11, ADR 1a-A), and the rest fill gaps the feature did not cover.

### Open item for the maintainer
- Resolved by research (Q3, finding 4): the client-abort wire response is 499 by ASP.NET Core framework default, with nothing written to the aborted connection, so there is no product decision to make. ST-01 and ST-02 share one behaviour: the framework sets 499 and logs at Debug; ST-01 adds no abort arm. See the DECIDED entry under Q3.

## Implementation notes
Filled by developer during implementation: deviations from plan and why. Deviations that affect the feature design/architecture are also propagated to the feature spec.

Built as specified; 66 backend tests pass (`dotnet build` clean with analyzers as errors). Deviations:

- **Duplicate-log suppression (AC8):** `ExceptionHandlerOptions.SuppressDiagnosticsCallback` is .NET 10 only; the API targets .NET 9. `Program.cs` instead filters the exception-handling middleware's category to drop its Error entries (`builder.Logging.AddFilter(typeof(ExceptionHandlerMiddleware).FullName, level => level < LogLevel.Error)`). Mutation check done: removing the filter fails all five `ExceptionHandlerLoggingTests`. Flagged as an amendment in the feature spec.
- **CORS (AC12):** the handler applies the default CORS policy itself through `ICorsPolicyProvider` and `ICorsService`. The middleware only adds `Vary: Origin` when more than one origin is allowed, so `CorsErrorResponseTests` configures two origins; a single-origin config correctly gets `Access-Control-Allow-Origin` without `Vary`.
- **Test factory config:** `CORS_ALLOWED_ORIGINS` is read while services are registered, before in-memory configuration is applied, so the factory's `ExtraConfiguration` is passed through `UseSetting` instead.
- **Collision fixture (AC9):** the plan's example (`A.BC` and `Ab.C`) does not collide under the first-letter-lowercase derivation (`aBC` vs `abC`); the fixture uses `Ab.C` and `A.bC`, both `abC`.
- **Reuse of the reference:** `AppException.WithError`/`Errors`/`errorDetails` kept (covered by the field-error test); the reference's `SqlException` arm and 413 arm are not copied; `BadHttpRequestException` maps to its own status.
- **Tests:** `OpenApiDocumentTests` keeps `PageReads_DeclaresTypedResponses` and adds `PageLikes_DeclaresTypedResponses` over one shared assertion. The malformed JSON, null and missing-required-member cases are separate named tests. `UnclassifiedFailure.Create` wraps the `NullReferenceException` (CA2201 forbids creating one inline). An extra test shows a disallowed origin gets no CORS header, and one shows a 4xx logs a warning, not an error.
- **Health endpoint:** its own `ProducesProblem(500)` was removed so 500 and 502 are declared once on the root group; `/health` now documents both.
- **Contract file:** `src/app/errors/error-codes.json` generated by the sync test, lint-clean (`npx eslint` on it passes, file unchanged after a re-run). Repo root is found by walking up to `pnpm-workspace.yaml`.
- `specs/enforcement.md`: API-04 row updated; CS-03 was already enforced (partial) and is unchanged. `specs/components.md` untouched (backend types are not tracked there).
- Not run: pnpm lint/typecheck/vitest/Playwright (no frontend source changed; only the generated JSON, linted on its own), manual checklist items 4 and 5 (`pnpm dev:api` with curl).

## Verification report

**Verdict: pass-with-notes.**

### Checks run
- `dotnet build src/api/Bach.Software.sln`: succeeded, 0 warnings, 0 errors (analyzers as errors).
- `dotnet test src/api/Bach.Software.sln`: 66 passed, 0 failed, 0 skipped.
- `npx eslint src/app/errors/error-codes.json`: clean. No frontend source changed, so lint/typecheck/vitest/Playwright were not required.
- Test list is a superset of the pre-existing methods: only the two AC10 renames differ; `PageReadsTest.cs` untouched.
- Not run: manual checklist items 4 and 5 (live `curl`); their behaviour is covered by `CorsErrorResponseTests` and the 502 integration tests. Mutation checks (items 1 to 3) were not repeated by QA (no app-code edits allowed); the developer reports the AC8 mutation result.

### Acceptance criteria
| AC | Result | Evidence |
|---|---|---|
| 1 | pass | `AnalyticsEndpointTests.GetAnalytics_WhenPlausibleReturnsHttpError_Returns502DetailFreeProblem`, `..._ConnectionFails_Returns502`; `ExceptionHandlerLoggingTests.GetAnalytics_WhenPlausibleFails_LogsExactlyOneError` |
| 2 | pass | `PlausibleResponseException` (sealed, plain `Exception`); `PlausibleService.ParseQueryResult` wraps `JsonException` and null; endpoint tests for `null`, `not json`, `{}`; `PlausibleServiceFailureTests` |
| 3 | pass | `AnalyticsEndpointErrorMappingTests.GetAnalytics_WhenUnclassifiedExceptionThrown_Returns500DetailFreeProblem`; logging test |
| 4 | pass | `AnalyticsEndpointValidationTests` (empty, non-http, multiple codes, missing parameter 400) |
| 5 | pass | `UrlInputValidator` uses `ErrorCodes.Url.*().Code` on both rules; handler has its own `ValidationException` branch projecting `ErrorCode`; `UrlInputValidatorErrorCodeTests` |
| 6 | pass | grep: no `try`/`catch`/`LogUnexpectedError`/`ValidationExceptionExtensions` in endpoints; file deleted; typed unions kept (the only `try/catch` is the `JsonException` wrap in `PlausibleService`, which rethrows with context) |
| 7 | pass | `ProducesProblem(500)` and `(502)` appear once, on the root group in `Program.cs`; `PageReads_`/`PageLikes_DeclaresTypedResponses` assert 400, 500, 502 |
| 8 | pass-with-note | One handler via `AddExceptionHandler` + `AddProblemDetails`, `UseExceptionHandler()` present, `ExceptionHandlerRegistrationTests`; duplicate log suppressed by a category filter (see deviation below), proven by the exactly-one-error-entry tests across all categories |
| 9 | pass | `ErrorCodesSyncTests` (4 tests incl. collision fixture); `src/app/errors/error-codes.json` lists `urlInvalid` and `urlRequired`, lint-stable |
| 10 | pass | Renamed tests assert `BadGateway`; 502 asserted in OpenAPI tests |
| 11 | pass | Build and tests clean, no test removed |
| 12 | pass | `CorsErrorResponseTests` (400/500/502, allowed origin gets header and `Vary`; other origin gets none) |
| 13 | pass | `GetAnalytics_WithValidationFailure_ReturnsProblemJsonContentType` |

### Deviation judgement (AC8)
`ExceptionHandlerOptions.SuppressDiagnosticsCallback` is not available on .NET 9, so `Program.cs` filters the `ExceptionHandlerMiddleware` category to drop its Error entries. This satisfies AC8's intent: one failing request yields exactly one error log, asserted across all categories, and Debug-level abort logging is untouched. It is recorded in this story's Implementation notes and flagged as an AMENDMENT in the feature spec (area 1a, `Program.cs` bullet). Note: the filter also silences the middleware's own error log if the handler itself throws; acceptable, revisit on the .NET 10 move.

### Process compliance
- `specs/enforcement.md`: API-04 row updated; CS-03 was already enforced (partial) and the story left it unchanged, consistent with the notes.
- `specs/components.md` correctly untouched (backend types not tracked); no release or docs obligation (profile).
- Comment rule: grep of all `.cs` files for FEAT/ST/AC/ADR/QA plan/finding/decision/Qn references returns nothing; test names follow `Method_Scenario_Expected`.
- No new em dashes (one pre-existing in `OpenApiExtensions.cs`, untouched by this story).
- No silent deviations; all deviations are in Implementation notes.

### Notes
- Maintainer reminder: link the PR in the frontmatter. The feature is not yet done (other stories open).
