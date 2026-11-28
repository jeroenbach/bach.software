---
id: QUICK-001
type: quick
status: done
auto: true
approved_by: "auto (delegated by the maintainer)"
pr: ""
---

# Quick: Error codes ride in the OpenAPI document

## Auto mode log

Gates crossed under the maintainer's delegation (/spec:auto). Decisions made at each are listed in the rollups below; override any of them freely.

- Quick gate crossed from awaiting-approval (4 routed PROPOSED edits settled, see DECIDED (research) entries)

## Decided without the maintainer (research)

Settled from research during the auto run, not reviewed by the maintainer. Override any of these freely.

- AR-1 → keep an `AllCodes()`-equivalent for `UrlInputValidatorErrorCodeTests`; adopted as proposed
- AR-2 → frontend specs use a plain relative import of `../../../openapi/v1.json` (probed: `pnpm ci:typecheck` clean, vitest resolves it; no alias, no copy)
- AR-3 → `ErrorCodesTests` carries all five guards incl. dependency-exclusion and `CollidingCatalog`; adopted as proposed
- AR-4 → match problem-details schemas by `EndsWith("ProblemDetails")`, never hardcoded names; adopted as proposed

## Problem

The backend's error-code contract (which `code` values a problem-details response can carry, and which placeholder names each code provides for translation) currently travels to the frontend through a second artifact: `ErrorCodesSyncTests` regenerates `src/app/errors/error-codes.json` via reflection, and the frontend's contract specs read that JSON. That is a sync mechanism the updated API-04 standard supersedes: the OpenAPI document is already the one committed, CI-staleness-checked contract the frontend generates its client from (API-01), so the error codes should ride in it too, with no second file to keep in step and no test that reaches across repo layers to write a frontend file.

Two adjacent gaps the updated standards also name, measured in this codebase:

- `Program.cs:24-27` maps `MapOpenApi()` only under `IsDevelopment()`. Updated API-01 requires the document endpoint in every environment (it is how a separate-repo consumer refreshes its pinned copy), and the existing integration tests run under the Development environment, so nothing pins the served document in production.
- `openapi/v1.json` carries no error-code information at all (0 `x-error-placeholders`), so the problem-details schemas under-describe what the handler actually writes into the body (`code`, `placeholders`).

## Proposed change

Move the contract into the OpenAPI document, per the updated API-04/API-01/FE-19 standards (reference implementation: the spec plugin's `standards/dotnet-api/examples/API-04/`):

1. **Backend — publish:** add `ErrorCodesDocumentTransformer` in `Bach.Software.Web` and register it in `OpenApiExtensions.AddBachSoftwareOpenApi()` alongside the existing server-URL transformer. It reads the `ErrorCodes` catalog via reflection with the same group-name + method-name derivation `ErrorCode` uses, and writes into every problem-details schema in the document (`ProblemDetails`, `HttpValidationProblemDetails`): the `code` property as a string enum of every client-visible code, a `placeholders` property, and an `x-error-placeholders` extension mapping each code to its placeholder names. Only client-visible kinds are published: kind-`Dependency` codes map to a detail-free 502 and never reach the client, so they stay out of the enum (the frontend must not be forced to translate them). The reflection/derivation logic shared with tests moves out of `Bach.Software.Tests/TestHelpers/ErrorCodeCatalog.cs` into the Web project (or the Application layer) so the transformer and the tests consume one implementation.

   PROPOSED (adversarial review): two corrections to this step measured against the codebase. (a) The validation problem-details schema is named `ValidationProblemDetails` here, not `HttpValidationProblemDetails` (see `openapi/v1.json` line 259 and `OpenApiDocumentTests`/`CommittedOpenApiDocumentTests`). Use the reference transformer's `name.EndsWith("ProblemDetails")` match rather than a hardcoded pair of names, so both `ProblemDetails` and `ValidationProblemDetails` get enriched regardless. (b) The helper cannot simply "disappear": `ErrorCodeCatalog.AllCodes(...)` is also consumed by `UrlInputValidatorErrorCodeTests.cs` (not just the sync test). The production replacement moving to the Web/Application layer exposes `ClientVisibleCodes()` (per the reference), which excludes `Dependency` codes and is therefore not a drop-in for `AllCodes()`. Keep an `AllCodes()`-equivalent reachable by that test, or migrate `UrlInputValidatorErrorCodeTests` to the new surface, and list that test in Affected files.
2. **Backend — serve everywhere:** map `app.MapOpenApi()` unconditionally in `Program.cs` (drop the `IsDevelopment()` guard). Add an integration test that pins the served `/openapi/v1.json` under a non-Development environment (`WebApplicationFactory` + `UseEnvironment("Production")`), so removing `MapOpenApi()` or re-guarding it fails the build.
3. **Backend — tests:** replace `ErrorCodesSyncTests` with `ErrorCodesTests`: codes unique across groups, and the served document's `code` enum / `x-error-placeholders` match the catalog exactly (which also fails when the transformer is unregistered). Keep the existing url-validation-codes assertion in the new shape. The sync test's file-writing machinery (`FindRepositoryRoot`, regeneration of the frontend JSON) is deleted, not ported.

   PROPOSED (adversarial review): `ErrorCodesSyncTests` currently holds **five** tests, not the three the Test impact section counts. Two of its guards have no home in the three-test list above and must be carried over so no behaviour goes unpinned: `Dependency_codes_stay_out_of_the_frontend_contract` (the reference's `ErrorCodesTests` keeps this as `Dependency_codes_stay_out_of_the_published_contract` — adopt it), and `Error_codes_with_colliding_wire_code_are_reported` with its `CollidingCatalog` fixture, which is the only test proving the uniqueness detection actually fires on a real collision (the `Error_codes_are_unique_across_groups` test only asserts the real catalog has none). Dropping the collision fixture is a silent coverage decrease that contradicts the Test impact section's "No coverage decrease".
4. **Frontend — consume:** rewrite `src/app/errors/errorCodes.contract.spec.ts` and `src/app/errors/errorsCatalog.spec.ts` to read the code → placeholders map from the committed `openapi/v1.json` (`x-error-placeholders` on the problem-details schema) instead of `error-codes.json`. Same assertions as today: every code translated in every locale, placeholder sets matched exactly in both directions, bucket keys (`unexpected`, `unavailable`, `validation`) kept. Delete `src/app/errors/error-codes.json`.

   DECIDED (research): the specs import the document with a plain relative import, `import openapi from '../../../openapi/v1.json'`. No alias, no tsconfig change, and no colocated copy (a second committed copy is exactly the sync artifact being removed). Probed in this repo before approval: a scratch spec with that import passed `pnpm ci:typecheck` (vue-tsc; `resolveJsonModule` is already on in the generated Nuxt tsconfig, and no `rootDir` constraint exists for TS6059 to fire on) and resolved under the `unit` Vitest project.
5. **Regenerate:** `dotnet build src/api/Bach.Software.sln` rewrites `openapi/v1.json`; `pnpm generate:api` regenerates the Kiota client. Both are committed together per API-01's CI staleness checks. Note: enriching the `code` property with an enum may change the generated client's problem-details types; whatever `pnpm generate:api` produces is the correct output (hand-editing the client is forbidden).
6. **Bookkeeping:** flip the API-01/API-04/FE-19 rows in `specs/enforcement.md` from their "Conflicting with the updated standard" markers to the new mechanism once implemented and probed.

Release obligation: none. The profile's "Release & changelog" section says there is no changelog/versioning bookkeeping; merge to `main` deploys automatically. The OpenAPI document change is internal-only (its single consumer is this repo's own Kiota client, regenerated in the same change).

`specs/components.md`: no shared component changes expected (no presentational/context component is touched).

## Affected files

Backend:

- `src/api/Bach.Software.Web/Extensions/OpenApiExtensions.cs` — register the new transformer
- `src/api/Bach.Software.Web/ErrorHandling/ErrorCodesDocumentTransformer.cs` — new
- `src/api/Bach.Software.Web/Program.cs` — unconditional `MapOpenApi()`
- `src/api/Bach.Software.Tests/ErrorCodesSyncTests.cs` — deleted, replaced by `ErrorCodesTests.cs`
- `src/api/Bach.Software.Tests/TestHelpers/ErrorCodeCatalog.cs` — derivation logic moves to production code; helper shrinks or disappears
- `src/api/Bach.Software.Tests/UrlInputValidatorErrorCodeTests.cs` — PROPOSED (adversarial review): missing from this list; it consumes `ErrorCodeCatalog.AllCodes(typeof(ErrorCodes))` and must be updated when the helper moves/shrinks (see step 1 note)
- `src/api/Bach.Software.Tests/Integration/` — new non-Development `MapOpenApi` pin; `OpenApiDocumentTests.cs` / `CommittedOpenApiDocumentTests.cs` extended to cover the error-code enrichment

Contract artifacts:

- `openapi/v1.json` — regenerated with the error-code enrichment
- `src/app/services/backend/**` — regenerated Kiota client

Frontend:

- `src/app/errors/errorCodes.contract.spec.ts` — reads the OpenAPI document
- `src/app/errors/errorsCatalog.spec.ts` — reads the OpenAPI document
- `src/app/errors/error-codes.json` — deleted

Specs:

- `specs/enforcement.md` — flip the three Conflicting markers after implementation

## Test impact

- Backend: `ErrorCodesSyncTests` (five tests) replaced by `ErrorCodesTests` carrying all five guards in the new shape: uniqueness on the real catalog, the `CollidingCatalog` fixture proving collision detection fires, dependency-exclusion (`Dependency` codes stay out of the published contract), url-validation codes present, and served-document-matches-catalog (replacing the file-sync test). One new integration test for `/openapi/v1.json` under a Production environment, built on `CustomWebApplicationFactory` with `UseEnvironment("Production")` so the host keeps the fixture's in-memory config (`UseHttpsRedirection` is a benign no-op under TestServer). Existing OpenAPI integration tests keep passing with the enriched document. (Counts and guards corrected per adversarial review.)
- Frontend: the two error specs keep their assertion semantics but change their data source; they must fail on an untranslated code, an undeclared `{token}`, an unused placeholder, and a missing bucket key, exactly as today. No coverage decrease: the same behaviours stay pinned, plus the new production-environment pin.
- Full gates per the profile: `pnpm lint:fix`, `pnpm ci:typecheck`, `pnpm ci:test`, `dotnet test src/api/Bach.Software.sln`; `pnpm playwright:docker` is not expected to be affected (no UI change) but CI runs it on the PR regardless.

## Adversarial review

Verdict: no blockers. Four should-fixes, all routed as `PROPOSED (adversarial review)` edits into the sections above, plus one nit. The plan is sound and matches the reference implementation; the gaps are omitted consumers and under-specified mechanics, not a wrong approach.

1. **should-fix — orphaned catalog consumer.** `UrlInputValidatorErrorCodeTests.cs:17` calls `ErrorCodeCatalog.AllCodes(typeof(ErrorCodes))`, so the helper cannot just "disappear" (Proposed change step 1 / Affected files). The reference's production replacement exposes `ClientVisibleCodes()` only, which filters out `Dependency` kinds and is therefore not a substitute for `AllCodes()`. Resolution: keep an `AllCodes()`-equivalent reachable from that test (or migrate the test) and add it to Affected files. Routed into step 1 and the Affected files list.

2. **should-fix — frontend import of the repo-root document is unspecified and may fail typecheck.** `openapi/v1.json` is outside `src/app` and the `~`/`@` alias scope; no frontend file imports across that boundary today, and the reference sidestepped it with a colocated copy this spec forbids reintroducing. Runtime (vitest) resolves a relative import, but `pnpm ci:typecheck` (vue-tsc) can reject a `resolveJsonModule` import outside the inferred `rootDir` (TS6059), which would fail the quality gate. Resolution: state the single-file resolution mechanism (tsconfig path / vitest alias, no copy) and verify typecheck. Routed into step 4.

3. **should-fix — test count undercount and dropped guards.** The Test impact section says `ErrorCodesSyncTests` is "3 tests"; it is actually five. The dependency-exclusion test (the reference keeps it) and the `CollidingCatalog` colliding-wire-code test must be carried into `ErrorCodesTests`. The collision test is the only one that proves the uniqueness check fires on a real collision; dropping it is a silent coverage decrease contradicting the spec's own "No coverage decrease". Routed into step 3 and Test impact.

4. **should-fix — wrong validation schema name.** Step 1 names the validation schema `HttpValidationProblemDetails`; in this codebase it is `ValidationProblemDetails` (`openapi/v1.json:259`, `OpenApiDocumentTests`, `CommittedOpenApiDocumentTests`). Harmless if the reference's `name.EndsWith("ProblemDetails")` match is used (it catches both), but the named example would mislead an implementer who hardcodes the pair. Routed into step 1.

5. **nit — Production pin fixture.** Use `CustomWebApplicationFactory` with `UseEnvironment("Production")` rather than a bare `WebApplicationFactory<Program>`, so the host gets the in-memory config the existing fixture supplies; `UseHttpsRedirection` is a benign no-op under TestServer. Routed into Test impact.

Checks that held up (verified, no finding): the build-time document generation (`Microsoft.Extensions.ApiDescription.Server`) runs the transformer through the `AddOpenApi` registration independently of `MapOpenApi()`, so moving the endpoint out of the `IsDevelopment()` guard does not affect what lands in the committed file; all current `ErrorCodes` factories are parameterless, so the transformer's reflective `Materialize` invocation is safe; `CommittedOpenApiDocumentTests.CommittedDocument_WhenComparedToRuntimeDocument_IsEquivalent` compares only schema names and operation/response shapes, which the property/extension enrichment leaves unchanged, so it keeps passing; the frontend reads `openapi/v1.json` directly (not the Kiota output), so whatever `generate:api` does to the generated client cannot affect the contract test.

## Implementation notes

What was built, step by step:

1. **Backend — publish.** `ErrorCodeCatalog` (the reflection-based derivation previously in `Bach.Software.Tests/TestHelpers/`) moved to `Bach.Software.Application/Errors/ErrorCodeCatalog.cs`, unchanged in shape (`AllCodes`, `ClientVisibleCodes`, `DuplicateCodes`), so it has no OpenApi dependency and both the transformer and the tests consume the one implementation. `ErrorCodesDocumentTransformer` (`Bach.Software.Web/ErrorHandling/`) reads `ErrorCodeCatalog.ClientVisibleCodes(typeof(ErrorCodes))` and writes the `code` enum, `placeholders` property, and `x-error-placeholders` extension into every schema whose name ends in `ProblemDetails` (the DECIDED `EndsWith` match, not a hardcoded `ProblemDetails`/`ValidationProblemDetails` pair). Registered via `OpenApiExtensions.AddBachSoftwareOpenApi()`.
   - **Deviation (mechanism, not outcome):** the reference implementation mutates `document.Components.Schemas` from an `IOpenApiDocumentTransformer`. Measured against this project's `Microsoft.AspNetCore.OpenApi` 9.0.6: at the point document transformers run, response schemas are still generated inline per operation and have not yet been hoisted into `Components.Schemas` (printed the schema-name list from inside the transformer: empty), so mutating that dictionary there silently did nothing — confirmed by a failing `ErrorCodesTests` run before the fix (`KeyNotFoundException` on `components.schemas.ProblemDetails`). Rewrote `ErrorCodesDocumentTransformer` as an `IOpenApiSchemaTransformer`, matched on `context.JsonTypeInfo.Type.Name.EndsWith("ProblemDetails")` instead of the document's schema-name dictionary; this mutates the schema object before hoisting, which does land in the final document (verified: `openapi/v1.json`'s `ProblemDetails`/`ValidationProblemDetails` now carry `code`, `placeholders`, `x-error-placeholders`). Same outcome and same `EndsWith` matching rule the spec decided on; only the .NET extension point changed. Not propagated to the feature/architecture layer since this quick spec has no parent feature.
   - `UrlInputValidatorErrorCodeTests.cs` updated to the moved `ErrorCodeCatalog` namespace (`Bach.Software.Application.Errors`), per AR-1.
2. **Backend — serve everywhere.** `Program.cs` maps `app.MapOpenApi()` unconditionally; the `IsDevelopment()` guard is gone. Added `OpenApiDocumentTests.OpenApiDocument_IsServed_UnderANonDevelopmentEnvironment`, using `CustomWebApplicationFactory.WithWebHostBuilder(b => b.UseEnvironment(Environments.Production))` per the nit, so the host keeps the fixture's in-memory config while running under Production.
3. **Backend — tests.** `ErrorCodesSyncTests.cs` and `TestHelpers/ErrorCodeCatalog.cs` deleted; `ErrorCodesTests.cs` carries all five guards per AR-3: uniqueness across groups, the `CollidingCatalog` fixture proving the uniqueness check fires on a real collision, dependency-code exclusion, the url-validation-codes assertion, and a served-document-matches-catalog test (codes and full placeholder map, both directions) that fails when the transformer or `MapOpenApi()` drops out of the pipeline. `OpenApiDocumentTests` and `CommittedOpenApiDocumentTests` each gained a theory asserting the `code` enum, `placeholders` property, and `x-error-placeholders` extension are present and non-empty on both problem-details schemas.
4. **Frontend — consume.** `errorCodes.contract.spec.ts` and `errorsCatalog.spec.ts` rewritten to read `openapi.components.schemas.ProblemDetails['x-error-placeholders']` from a plain relative import, `import openapi from '../../../openapi/v1.json'` (DECIDED AR-2, probed clean against `pnpm ci:typecheck` and Vitest's `unit` project). Same assertion semantics as before (untranslated code, undeclared placeholder, unused placeholder, missing bucket key). `src/app/errors/error-codes.json` deleted; no other production code referenced it.
5. **Regenerate.** `dotnet build src/api/Bach.Software.sln` (rebuilt, not just incrementally built, since the OpenAPI generation step is skipped when the Web project's output is already up to date) regenerated `openapi/v1.json` with the enrichment. `pnpm generate:api` regenerated the Kiota client; the diff is confined to `models/index.ts` (new `code`/`placeholders` members and their serialize/deserialize functions on `ProblemDetails`/`ValidationProblemDetails`) and `kiota-lock.json`. Neither was hand-edited.
6. **Bookkeeping.** `specs/enforcement.md`: flipped the FE-19, API-01, and API-04 rows from their "Conflicting with the updated standard" markers to describe the shipped mechanism, and replaced the "Not wired this run" migration bullet (now shipped) with the one real residual gap found while verifying: FE-19's danger check doesn't yet warn on a `code`/`x-error-placeholders` change landing without a translation-catalog change (the Vitest contract spec already catches it in CI, so this is a candidate for an earlier-stage guard, not a coverage hole).

Gate results:

- `dotnet build src/api/Bach.Software.sln` (rebuild): clean, 0 warnings, 0 errors.
- `dotnet test src/api/Bach.Software.sln`: 121/121 passed.
- `pnpm lint:fix`: clean, no changes.
- `pnpm ci:typecheck`: clean.
- `pnpm ci:test`: 657/657 passed (59 files).
- `pnpm generate:api`: regenerated `models/index.ts`/`kiota-lock.json` only; committed as-generated.
- `pnpm playwright:docker`: skipped per the task's instruction (no UI change).

Coverage note: `pnpm ci:test:coverage` (not the profile's actual gate, `pnpm ci:test`, which runs without `--coverage`) showed function coverage at 87.85% against the committed `vitest.config.ts` threshold of 87.92%, a drop outside this change's control — `git diff HEAD` confirms zero changes to any file under the coverage `include` globs (`src/app/{components,composables,contexts,pages,stores,types,utils}`), so the gap predates this diff. Reverted the local auto-ratchet edit vitest's `autoUpdate` made to `vitest.config.ts` rather than either lowering the committed threshold or silently absorbing unrelated drift into this spec's diff; flagging here for the maintainer rather than guessing at a fix. Coverage is otherwise tracked by Codecov on the PR per the profile.

`specs/components.md`: not updated — no presentational/context component or shared composable changed, matching the Proposed change's prediction.

Session was interactive (maintainer's local machine): no git add/commit/push performed, per CLAUDE.md. Verification command for the maintainer: `dotnet test src/api/Bach.Software.sln && pnpm lint:fix && pnpm ci:typecheck && pnpm ci:test`.

## Verification report

Gates re-run independently, all green: `dotnet build src/api/Bach.Software.sln --no-incremental` clean (0/0 warnings/errors); `dotnet test src/api/Bach.Software.sln` 121/121; `pnpm lint:fix` clean (no changes); `pnpm ci:typecheck` clean; `TZ=Europe/Amsterdam pnpm ci:test` 657/657 (59 files). `pnpm playwright:docker` not run (no `src/app` UI change, matches the spec's own note). `dotnet build` with a forced rebuild produced `openapi/v1.json` byte-for-byte identical to the working-tree copy (diffed), confirming the committed document is exactly what a build regenerates.

Proposed-change walk (all six steps), against the actual diff:

1. **Backend publish** — pass. `ErrorCodeCatalog` moved to `Bach.Software.Application/Errors/`, no OpenApi dependency; `ErrorCodesDocumentTransformer` matches `*ProblemDetails` by `EndsWith`, writes `code` enum/`placeholders`/`x-error-placeholders` from `ClientVisibleCodes()`. The documented `IOpenApiSchemaTransformer` deviation (schema transformers run before hoisting, document transformers after) is recorded with the reasoning and a reproduction (`KeyNotFoundException` before the fix); sound and consistent with Microsoft.AspNetCore.OpenApi 9.0.6 behaviour, correctly flagged as mechanism-only (no feature/architecture layer exists for a quick spec to propagate it to).
2. **Serve everywhere** — pass. `Program.cs:28` maps `app.MapOpenApi()` unconditionally; no `IsDevelopment()` guard anywhere in the pipeline. Verified live: temporarily re-commenting `AddSchemaTransformer<ErrorCodesDocumentTransformer>()` and rerunning the suite failed `OpenApiDocument_IsServed_UnderANonDevelopmentEnvironment`'s sibling tests and all five `ErrorCodesTests`/`ProblemDetailsSchemas_CarryTheErrorCodeContract` guards (5 failed, `KeyNotFoundException` on `ProblemDetails`), then restored and reconfirmed 121/121 clean — the mechanism genuinely fails when broken, not just a happy-path assertion.
3. **Backend tests** — pass. `ErrorCodesTests.cs` carries all five guards: uniqueness (`Error_codes_are_unique_across_groups`), the `CollidingCatalog` fixture (`Error_codes_with_colliding_wire_code_are_reported`, asserts `["abC"]`), dependency-exclusion (`Dependency_codes_stay_out_of_the_published_contract`), url-validation codes (`Error_codes_list_the_url_validation_codes`), served-document-matches-catalog (`OpenApi_document_is_served_and_carries_the_client_visible_codes`, exact match both directions). `ErrorCodesSyncTests.cs` and `TestHelpers/ErrorCodeCatalog.cs` are deleted (confirmed, no remaining references anywhere). `UrlInputValidatorErrorCodeTests.cs` kept using `ErrorCodeCatalog.AllCodes(typeof(ErrorCodes))` from the new namespace, as the should-fix required.
4. **Frontend consume** — pass. Both specs import `../../../openapi/v1.json` via plain relative import, read `x-error-placeholders` off `ProblemDetails`, same assertion semantics (untranslated code, undeclared token, unused placeholder, missing bucket key all still asserted by construction — walked the logic, not just re-stated the claim). `src/app/errors/error-codes.json` confirmed deleted; no remaining reference anywhere in the repo.
5. **Regenerate** — pass. Diff confined to `models/index.ts` and `kiota-lock.json` as claimed; openapi/v1.json verified regenerable byte-identical (see above). `code` enum on both `ProblemDetails` and `ValidationProblemDetails` confirmed present in the committed document (`urlInvalid`, `urlRequired`).
6. **Bookkeeping** — pass. `specs/enforcement.md` has zero remaining "Conflicting with the updated standard" markers; the API-01/API-04/FE-19 rows describe the shipped `IOpenApiSchemaTransformer` mechanism and the production-pin test. The one residual gap (danger check doesn't catch a code-enum change landing without a translation change) is correctly filed as a future candidate, not hidden.

Compliance: no new undocumented exports/endpoints; `specs/components.md` correctly left untouched (no component/composable touched); no changeset expected per the profile's no-release-bookkeeping rule, correctly noted as such; interactive session correctly left git untouched.

Coverage note re-verified independently: re-ran `pnpm ci:test:coverage` and reproduced the same numbers (functions 87.85% vs. 87.92% threshold); `git diff --name-only` against the coverage `include` globs (`src/app/{components,composables,contexts,pages,stores,types,utils}`) returns nothing for this diff, confirming the drift predates this change. The coverage run's own `autoUpdate: true` ratcheted `vitest.config.ts`'s other three thresholds upward as a side effect of my verification run; reverted it back to the values already on disk before this report so no unrelated edit leaks out of QA. The profile's actual gate, `pnpm ci:test` (no `--coverage`), passed clean.

**Verdict: pass.** No fixes required. Reminder for the maintainer: link the PR in the frontmatter (`pr:`) once opened. This is a standalone quick spec with no parent feature, so no feature-done note applies.
