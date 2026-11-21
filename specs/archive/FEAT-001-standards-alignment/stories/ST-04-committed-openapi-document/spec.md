---
id: ST-04
type: story
feature: FEAT-001
status: done
approved_by: "auto (delegated by feature approval)"
pr: ""
---

# Story: Committed OpenAPI document as the source of the frontend client (API-01)

## Decided without the maintainer (research)

Settled from research during adversarial review, not reviewed by the maintainer. Override any of these freely.

- AC1 → the package is referenced in `Bach.Software.Web.csproj` only with an inline `Version`, not via `Directory.Packages.props`
- AC4 → `generate:api` uses a repo-relative document path and a pinned Kiota version; the first run's `kiota-lock.json` change is expected
- AC6 → the CI gate also catches an untracked `openapi/` file (`git add -N` before `git diff --exit-code`)
- AC9 → the API-01 row moves from "Not applicable" to Enforced
- Edge case 3 → `dotnet publish` in `src/api/Dockerfile` always passes `-p:OpenApiGenerateDocuments=false`

## Functional
### User story
As Jeroen (the maintainer), I want the OpenAPI document generated at build time and committed, with CI failing when it is stale, and the Kiota client generated from that file, so that the frontend client always matches the backend contract and I no longer need a running dev server to regenerate it.

### Acceptance criteria
1. Given `Bach.Software.Web.csproj`, then it references `Microsoft.Extensions.ApiDescription.Server` with `PrivateAssets=all` and an explicit inline `Version` aligned to the installed `Microsoft.AspNetCore.OpenApi` 9.0.x (as that package is already referenced; `src/api/Directory.Packages.props` does not enable central package management and is not touched), with `OpenApiGenerateDocuments=true` and `OpenApiDocumentsDirectory` resolving to the repo-root `openapi/` folder.
2. Given `dotnet build src/api/Bach.Software.sln` on a clean checkout without `PLAUSIBLE_API_TOKEN` set, then the build succeeds and writes the OpenAPI document into `openapi/` (confirming ADR 4-A: no secrets needed at generation time; if it fails, a dummy token is supplied for the generator step only and noted in Implementation notes).
3. Given the committed `openapi/` document, then it contains the `/api` server entry and unprefixed paths produced by the existing `AddBachSoftwareOpenApi` transformer, and for `pageReads` and `pageLikes` it declares the 400 `ValidationProblemDetails`, 500 and 502 problem schemas introduced in ST-01.
4. Given a new script, then `pnpm generate:api` exists in `package.json` and runs Kiota against the committed `openapi/` document (not a running server) via a repo-relative `descriptionLocation`, with the Kiota version pinned (local tool manifest or documented in the README). The first run legitimately changes `kiota-lock.json` once (`descriptionLocation` from `http://localhost:8080/openapi/v1.json` to the relative path, `kiotaVersion` from `1.34.1` to the pinned version if different) and regenerates the 502 mappings; after that change is committed, running it again on a clean tree produces no diff in `src/app/services/backend/`.
5. Given the regenerated client in `src/app/services/backend/analytics/pageReads/index.ts` and `.../pageLikes/index.ts`, then the `errorMappings` include `400`, `500` and `502`.
6. Given CI (`10-quality-assurance.yml`), then a step builds the backend, runs `git add -N openapi/` (or checks that `git status --porcelain openapi/` prints nothing) and then `git diff --exit-code openapi/`; the step fails when the committed document is stale or when a new, untracked `openapi/` file appears, demonstrated by a deliberate local change to an endpoint description that makes the diff non-empty.
7. Given local development, then `pnpm dev:api` (`dotnet watch`) regenerates `openapi/` on build, and `src/app/services/backend/README.md` documents the full flow: build writes `openapi/`, `pnpm generate:api` regenerates the client, commit both.
8. Given `OpenApiDocumentTests` and the runtime `app.MapOpenApi()` dev endpoint, then both continue to work and pass.
9. Given `specs/enforcement.md` and `CLAUDE.md`, then the API-01 row (currently "Not applicable") moves to Enforced, naming the build-time document and the `openapi/` diff gate, and CLAUDE.md's description of regenerating the Kiota client points to `pnpm generate:api`.

> **PROPOSED (adversarial review) — AC corrections, verified against the current tree.** Four acceptance criteria are written against a repo state that does not hold; adopt these edits so each AC is satisfiable and testable:
> - **AC1.** Drop "version in `Directory.Packages.props`". Verified: `src/api/Directory.Packages.props` does not enable central package management (no `ManagePackageVersionsCentrally`); it carries a bare `PackageReference` for FluentValidation, and `Microsoft.AspNetCore.OpenApi` keeps its version inline (9.0.6) in `Bach.Software.Web.csproj`. A `PackageVersion` entry would be ignored and a versionless `PackageReference` would fail to restore. Reword: reference `Microsoft.Extensions.ApiDescription.Server` in `Bach.Software.Web.csproj` only, `PrivateAssets=all`, with an explicit `Version` aligned to the installed `Microsoft.AspNetCore.OpenApi` 9.0.x. This matches the feature architecture, which says only "added to `Bach.Software.Web.csproj`".
> - **AC4.** Add that `generate:api` passes a repo-relative `descriptionLocation` to the committed document and the Kiota version is pinned (local tool manifest or documented), and that the one-time `kiota-lock.json` change (today `http://localhost:8080/openapi/v1.json` and `kiotaVersion 1.34.1`) is expected on the first run so "no diff" is judged from the second run. Without this, "no diff on a clean tree" is false on the first regeneration and flaps across machines/CLI versions.
> - **AC6.** The gate must also catch a new, untracked `openapi/` file. Reword: run `git add -N openapi/` before `git diff --exit-code openapi/`, or fail on any `git status --porcelain openapi/` output. Plain `git diff --exit-code` is blind to untracked files.
> - **AC9.** Reword "moves off Open" to "moves to Enforced (naming the build-time document and diff gate)". Verified: the API-01 row currently reads "Not applicable", not "Open"; the end state (Enforced) is unchanged.

DECIDED (research): AC1. Reference `Microsoft.Extensions.ApiDescription.Server` in `Bach.Software.Web.csproj` only, `PrivateAssets=all`, with an inline `Version` aligned to `Microsoft.AspNetCore.OpenApi` 9.0.x; do not use `Directory.Packages.props`.
Why: `src/api/Directory.Packages.props` has no `ManagePackageVersionsCentrally` and holds only a bare `PackageReference` for FluentValidation, so a `PackageVersion` entry is ignored and a versionless reference fails to restore; `Microsoft.AspNetCore.OpenApi` keeps `Version="9.0.6"` inline in the csproj. The feature architecture and Decision log entry 6 also say only that the package is added to `Bach.Software.Web.csproj`.
Sources: `src/api/Directory.Packages.props`, `src/api/Bach.Software.Web/Bach.Software.Web.csproj`, FEAT-001 Decision log entry 6 and ADR 4-A.

DECIDED (research): AC4. `generate:api` passes a repo-relative `descriptionLocation` to the committed document and pins the Kiota version; the one-time `kiota-lock.json` change is expected on the first run and "no diff" is judged from the second run.
Why: `src/app/services/backend/kiota-lock.json` stores `descriptionLocation` `http://localhost:8080/openapi/v1.json` and `kiotaVersion` `1.34.1`, so the first regeneration from a file must change it, and an absolute path or an unpinned CLI would produce diffs per machine.
Sources: `src/app/services/backend/kiota-lock.json`.

DECIDED (research): AC6. The gate adds `git add -N openapi/` (or fails on any `git status --porcelain openapi/` output) before `git diff --exit-code openapi/`.
Why: `git diff --exit-code` ignores untracked files, so a new or renamed generated file would pass the gate unnoticed.
Sources: git documentation for `git diff --exit-code` and `git add -N`.

DECIDED (research): AC9. The API-01 row moves from "Not applicable" to Enforced, naming the build-time document and the diff gate.
Why: the row in `specs/enforcement.md` reads "Not applicable" ("No static OpenAPI document is committed to diff-check"), not "Open"; the end state is unchanged, only the wording of the starting point was wrong.
Sources: `specs/enforcement.md` API-01 row.

### Edge cases
- Document ordering and formatting must be deterministic so the staleness gate does not flap between machines or operating systems.
- A developer changing an endpoint but forgetting to commit `openapi/` is caught by CI, not by review.
- The new `openapi/` folder must not break the Docker backend image build or the frontend build. Inside the container `$(MSBuildProjectDirectory)/../../../openapi` resolves to `/openapi`, outside the `/src` build context, so `src/api/Dockerfile` passes `-p:OpenApiGenerateDocuments=false` to its `dotnet publish` call unconditionally (the document is committed and consumed only by `pnpm generate:api`). This Dockerfile change is a deviation from the Architecture reference file list and is recorded in Implementation notes.

> **PROPOSED (adversarial review) — disable generation in the Docker publish step.** Verified: `src/api/Dockerfile` sets `WORKDIR /src` and publishes `Bach.Software.Web/Bach.Software.Web.csproj`, so inside the container `$(MSBuildProjectDirectory)/../../../openapi` resolves to `/openapi`, outside the `/src` build context. The AKS image does not need to regenerate the committed document (it is already committed and consumed only by `pnpm generate:api`), so the `dotnet publish` call should pass `-p:OpenApiGenerateDocuments=false` unconditionally rather than conditionally. The Dockerfile is not in the Architecture reference file list; record this deviation in Implementation notes. Verify with a real `docker build -f src/api/Dockerfile src/api`.

DECIDED (research): Edge case 3. `src/api/Dockerfile` passes `-p:OpenApiGenerateDocuments=false` to `dotnet publish` unconditionally; record the deviation in Implementation notes and verify with a real `docker build -f src/api/Dockerfile src/api`.
Why: the Dockerfile sets `WORKDIR /src` and publishes `Bach.Software.Web/Bach.Software.Web.csproj`, so the repo-root path `../../../openapi` resolves to `/openapi`, outside the build context, and the image does not need to regenerate a document that is already committed.
Sources: `src/api/Dockerfile`, `src/api/Bach.Software.Web/Bach.Software.Web.csproj`.

### Out of scope
- Any new endpoint or contract change beyond what ST-01 already introduced.
- Frontend error handling that consumes the regenerated client (ST-05).

## Design reference
No visual change.

## Architecture reference
Implements area 4 (API-01) and ADR 4-A. Files and areas:
- `src/api/Bach.Software.Web/Bach.Software.Web.csproj` (package reference with inline version; `src/api/Directory.Packages.props` is not touched)
- `src/api/Dockerfile` (`-p:OpenApiGenerateDocuments=false` on `dotnet publish`; deviation from the feature architecture's file list, recorded in Implementation notes)
- New `openapi/` folder at the repo root (committed document)
- `package.json` (`generate:api` script, per the CLAUDE.md rule that every user-runnable script gets a package.json entry)
- `src/app/services/backend/` (regenerated client) and `src/app/services/backend/README.md`
- `.github/workflows/10-quality-assurance.yml` (staleness gate)
- `src/api/Bach.Software.Tests/Integration/OpenApiDocumentTests.cs` (verify only)
- `CLAUDE.md` Kiota regeneration wording, `specs/enforcement.md` API-01 row

Dependencies: ST-01 (the document must carry the final 400/500/502 problem schemas, avoiding a second churn of the generated client). Blocks ST-05 (the frontend story starts from the client generated here, so the 502 mapping is already present). The architecture lists ST-04 after ST-01 as a soft ordering; ST-05 after ST-04 is an ordering choice of this split, not a contradiction of the architecture. No release bookkeeping.

## QA plan

### Conventions and environment
- No UI is touched: no component, state, Storybook or Playwright visual work, and no `specs/components.md` change. No frontend unit test is added (the regenerated client under `src/app/services/backend/` is generated code, excluded from lint and outside the Vitest coverage `include` list).
- Backend tests: xUnit in `src/api/Bach.Software.Tests`, named `MethodName_Scenario_ExpectedBehaviour`. New tests reuse `CustomWebApplicationFactory` and the existing `IClassFixture` pattern from `OpenApiDocumentTests`; no new fixture is needed beyond a small helper that locates the repo-root `openapi/` folder by walking up from `AppContext.BaseDirectory`.
- Pipeline-level checks (AC2, AC4, AC6) are verified by running the real commands on a clean tree, not by mocking: `git clean` equivalent (fresh clone or `git stash -u` first), `dotnet build`, `pnpm generate:api`, `git status --porcelain`.
- Run with `TZ=Europe/Amsterdam` for any Vitest command. Visual baselines are not involved, so the jammy container rule does not apply.

### Pre-implementation findings (QA, settled in adversarial review; the adopted wording is in the ACs above)
1. **AC1 cannot be satisfied literally.** `src/api/Directory.Packages.props` does not enable central package management (no `ManagePackageVersionsCentrally`); it is an auto-imported props file that today carries a global `PackageReference` for FluentValidation, and `Microsoft.AspNetCore.OpenApi` keeps its version inline in `Bach.Software.Web.csproj`. A `PackageReference` added there would hit every project; a `PackageVersion` entry would be ignored. Adopted (now AC1): the package is referenced in `Bach.Software.Web.csproj` only, `PrivateAssets=all`, with an explicit `Version` aligned to the installed `Microsoft.AspNetCore.OpenApi` (9.0.x), consistent with how that package is already referenced. Test: `Select-String`/grep of the csproj in the verification step.
2. **AC6 misses untracked files.** `git diff --exit-code openapi/` is blind to a file that is new and untracked (first run, or a renamed output file). Adopted (now AC6): the CI step runs `git add -N openapi/` (or `git status --porcelain openapi/` and fail on any output) before `git diff --exit-code openapi/`.
3. **AC4 "no diff on clean tree" depends on `kiota-lock.json`.** The lock file stores `descriptionLocation` (today `http://localhost:8080/openapi/v1.json`), `descriptionHash` and `kiotaVersion` (`1.34.1`). The first regeneration legitimately changes `descriptionLocation` once, and an absolute path would flap per machine. Adopted (now AC4): `generate:api` passes a repo-relative path to the committed document, and the Kiota version is pinned (dotnet local tool manifest or documented in the README) so a different CLI version cannot create a diff. Specify the expected one-time diff of the lock file so "no diff" is judged from the second run onward.
4. **Output file name is unconfirmed.** The architecture diagram assumes `openapi/v1.json`; the build-time generator names the file after the project/document (for example `Bach.Software.Web.json`). The file name must be decided, pinned if needed (generator `--file-name` option), and used identically in `generate:api`, the README, the new test and the CI gate. Verify by listing `openapi/` after a clean build.
5. **AC9 premise is stale.** `specs/enforcement.md` currently lists API-01 as "Not applicable" (not "Open"), with the reason "no static OpenAPI document is committed". The row must move to Enforced with the new mechanism named, not merely "off Open".
6. **Docker build context.** `src/api/Dockerfile` runs `dotnet publish` with `/src` as context and the project at `/src/Bach.Software.Web`, so `../../../openapi` resolves to `/openapi` inside the container, outside the context. The edge case "must not break the Docker backend image build" is resolved by the Dockerfile passing `-p:OpenApiGenerateDocuments=false` to `dotnet publish` unconditionally (adopted), recorded in Implementation notes (Dockerfile is not in the architecture file list), and needs a real `docker build -f src/api/Dockerfile src/api` to prove it.
7. **Hot reload may skip regeneration.** `dotnet watch` applies some edits via hot reload without a full build, which would not rewrite `openapi/`. AC7 needs a manual check (see checklist); if hot reload skips it, the README states that a rebuild or restart is needed.
8. **Lint and line endings can corrupt determinism.** `pnpm lint:fix` (antfu config) may reformat `openapi/*.json`, and CRLF on Windows would flap the gate. Add `openapi/**` to the ESLint ignores if lint touches it, and a `.gitattributes` rule (`openapi/*.json text eol=lf`) if line endings are not already normalised.
9. **Ordering dependency.** AC3 and AC5 can only be verified after ST-01 is implemented (400/500/502 schemas, `ProducesProblem(502)` on the root group). If ST-01 is not merged, those criteria are blocked, not failed.

### Acceptance criteria to test mapping

| AC | Test | Kind | Name or command |
|---|---|---|---|
| 1 | Inspect `Bach.Software.Web.csproj`: `Microsoft.Extensions.ApiDescription.Server` with `PrivateAssets=all`, `OpenApiGenerateDocuments=true`, `OpenApiDocumentsDirectory` ending at repo-root `openapi/`; after build, the file lands at `<repo>/openapi/` and not under `src/api/`. The `Version` is inline in the csproj and aligned to `Microsoft.AspNetCore.OpenApi` 9.0.x; `src/api/Directory.Packages.props` is unchanged (`git diff` empty for it). | Manual (scripted check) | grep csproj, `git diff -- src/api/Directory.Packages.props`, `ls openapi/` after build |
| 2 | On a clean checkout with `PLAUSIBLE_API_TOKEN` unset (`env -u PLAUSIBLE_API_TOKEN dotnet build src/api/Bach.Software.sln`), the build exits 0 and `openapi/` contains the document; `git status` shows no change versus the committed file. Also run `dotnet test` once with the variable unset to confirm the test host is unaffected. If it fails, record the dummy-token workaround for the generator step only. | Integration (command) | `dotnet build`, then `git status --porcelain openapi/` |
| 3 | New `CommittedOpenApiDocumentTests` reads the committed file (not the runtime endpoint): `CommittedDocument_WhenRead_UsesApiServerWithUnprefixedPaths` (servers[0].url `/api`, paths `/health`, `/analytics/pageReads`, `/analytics/pageLikes`, none starting `/api`); `CommittedDocument_PageReads_DeclaresValidationAndServerFailureProblemSchemas` and `CommittedDocument_PageLikes_DeclaresValidationAndServerFailureProblemSchemas` (400 refs `ValidationProblemDetails`, 500 and 502 ref `ProblemDetails`). Mirrors the assertions in `OpenApiDocumentTests`. | Integration (xUnit) | `Bach.Software.Tests/Integration/CommittedOpenApiDocumentTests.cs` |
| 3 (parity) | `CommittedDocument_WhenComparedToRuntimeDocument_IsEquivalent`: parse the committed file and `GET /openapi/v1.json` from the factory and assert the same `paths` keys, operation response codes and `components.schemas` keys, so the committed document cannot silently diverge from what the app serves. | Integration (xUnit) | same class |
| 4 | `package.json` has `generate:api`; script text references the committed `openapi/` file via a repo-relative path and no `http://` URL, and the Kiota version is pinned (tool manifest or README). On a clean tree run `pnpm generate:api` twice: after the first run only the expected `kiota-lock.json` location change (and the 502 mapping from AC5) differs; after committing, the second run leaves `git status --porcelain src/app/services/backend/` empty. Run once from a different cwd to prove path handling. | Integration (command) | `pnpm generate:api && git status --porcelain src/app/services/backend/` |
| 5 | After regeneration, `errorMappings` in `src/app/services/backend/analytics/pageReads/index.ts` and `.../pageLikes/index.ts` contain keys `400`, `500` and `502` with the expected factories. Also check `health/index.ts` gains `502` (root-group declaration) so the diff is explained, not surprising. | Manual (grep) | grep `errorMappings` blocks |
| 6 | CI step in `10-quality-assurance.yml` (backend job): build, then `git add -N openapi/` (or `git status --porcelain` check) and `git diff --exit-code openapi/`, so stale and untracked `openapi/` both fail (AC6). Proof, run locally and once on the PR: (a) change an endpoint `WithDescription` text, build, observe `git diff --exit-code openapi/` exit 1, revert; (b) delete `openapi/*.json`, build, observe the untracked/absence case fails; (c) clean tree passes. Confirm the step runs a real `dotnet build` and not `--no-build` on cached output. | Integration (CI) plus manual demonstration | workflow step; record the failing run in Verification report |
| 7 | (a) With `pnpm dev:api` running, edit an endpoint description and confirm `openapi/` is rewritten (finding 7). (b) README walkthrough: following only the documented steps (build, `pnpm generate:api`, commit both) from a clean clone yields a green tree. Read the README for: build writes `openapi/`, `pnpm generate:api`, commit both, Kiota install and pinned version, no mention of a running server. | Manual | see checklist |
| 8 | Existing `OpenApiDocumentTests` (4 tests) pass unchanged by this story, with ST-01's added 502 assertion; `app.MapOpenApi()` still serves `/openapi/v1.json` in Development (covered by those tests via the factory). No removal of the runtime endpoint. | Integration (xUnit, existing) | `dotnet test --filter FullyQualifiedName~OpenApiDocumentTests` |
| 9 | grep `CLAUDE.md` for the Kiota regeneration sentence: it names `pnpm generate:api` and no longer says to run `kiota generate` against a running server; `specs/enforcement.md` API-01 row (was "Not applicable") reads Enforced with the build-time document, `openapi/` diff gate and `generate:api` named. | Manual (grep) | grep `kiota generate`, read the API-01 row |

### Determinism (edge case 1)
- Run `dotnet build` twice on the same tree, then once after `dotnet clean`, and compare a hash of `openapi/*.json`: identical every time (no timestamps, stable path and schema ordering). Covered functionally by the CI gate, but also check once on macOS (local) versus Linux (CI): the first PR run's gate result is the cross-OS proof, so do not merge until the step is green on `ubuntu-latest` with a document generated on the maintainer's machine.
- Confirm no CRLF in the committed file and that the file ends with a single trailing newline (finding 8).
- Confirm `Microsoft.Extensions.ApiDescription.Server` and `Microsoft.AspNetCore.OpenApi` versions are aligned, since a skew can change output between restores.

### Other edge cases
- Forgotten commit (edge case 2): covered by AC6 demonstration (a).
- Docker context (edge case 3): `src/api/Dockerfile` carries `-p:OpenApiGenerateDocuments=false` on `dotnet publish` and `docker build -f src/api/Dockerfile src/api` succeeds without writing a stray `/openapi` (finding 6); the deviation is noted in Implementation notes. Frontend build: `pnpm generate` still succeeds with the new top-level `openapi/` folder present (no Nuxt or Cloudflare `_routes.json` effect expected; confirm `scripts/verify-cf-routes.mjs` passes). Trivy: `openapi/` is JSON only, no new findings expected.
- Local dev together (feature Constraints): after `pnpm dev:api` plus `pnpm dev`, the page-reads and page-likes calls still work against the regenerated client (no runtime regression from the 502 mapping).

### Stack-specific regression classes
Reactivity, render-count, async-cancellation and state-migration classes are not touched (generated code and build config only). The regenerated client is consumed by `usePageReadsContext.ts` and `usePageLikesContext.ts`: run `pnpm ci:typecheck` and `pnpm ci:test` to prove the added `502` mapping and any regenerated model changes (for example `ProblemDetails`/`ValidationProblemDetails` field changes from ST-01) do not break types or existing context tests.

### Fixtures and utilities
- Existing: `CustomWebApplicationFactory`, `IClassFixture` pattern, `System.Text.Json.JsonDocument` as used in `OpenApiDocumentTests`.
- New: a tiny `RepoRoot` path helper inside the new test class (walk up until a folder containing `openapi/` and `src/api/` is found; fail with a clear message otherwise).

### Coverage
- Frontend: no source under the Vitest `include` list changes, so the thresholds (statements 69.11, branches 66.52, functions 64.87, lines 69.18) are unaffected; confirm `pnpm ci:test` still meets them.
- Backend: the three new tests exercise no new product code; line coverage is neutral to positive. Knowingly uncovered: the MSBuild generation wiring and the CI workflow step, which are verified by commands and the CI demonstration instead of unit tests.

### Regression risk
- Touched: `Bach.Software.Web.csproj` (every build now runs the generator, including `dotnet test` and `dotnet watch`; the AKS image publish is excluded via `src/api/Dockerfile`), `src/api/Dockerfile`, `10-quality-assurance.yml`, `package.json`, the generated client, `kiota-lock.json`, `CLAUDE.md`, `specs/enforcement.md`, and the README.
- Other stories: ST-01 (document content, hard prerequisite), ST-02 and ST-03 (touch `AnalyticsEndpoints.cs`/`PlausibleService.cs` but do not change the contract, so any resulting `openapi/` diff in those stories signals an unintended contract change), ST-05 (starts from the client generated here). Any later story that changes an endpoint must commit `openapi/` or the gate fails.
- Guards: `OpenApiDocumentTests`, `AnalyticsEndpointTests`, the new `CommittedOpenApiDocumentTests`, the CI staleness step, `pnpm ci:typecheck`, `pnpm ci:test`.

### Manual verification checklist
- [ ] `env -u PLAUSIBLE_API_TOKEN dotnet build src/api/Bach.Software.sln` passes on a clean checkout and `openapi/` is written (AC2).
- [ ] `openapi/` file name is the one used by `generate:api`, README, test and CI (finding 4).
- [ ] Two builds and a clean build produce a byte-identical document (determinism).
- [ ] `pnpm generate:api` on a clean tree: only the expected lock-file diff on the first run, none on the second; `kiota-lock.json` holds a relative path and the pinned Kiota version (AC4, finding 3).
- [ ] `errorMappings` include 400, 500, 502 in `pageReads` and `pageLikes` (AC5).
- [ ] CI gate (`git add -N` then `git diff --exit-code`) fails on a deliberate stale document, on a missing/untracked document, and passes on a clean tree; failing run linked in the Verification report (AC6).
- [ ] `pnpm dev:api` rewrites `openapi/` on an endpoint edit, or the README documents the rebuild requirement (AC7).
- [ ] README read end to end by following it literally (AC7).
- [ ] `dotnet test src/api/Bach.Software.sln` is green, including `OpenApiDocumentTests` and the new class (AC8).
- [ ] `src/api/Dockerfile` passes `-p:OpenApiGenerateDocuments=false` and `docker build -f src/api/Dockerfile src/api` succeeds; deviation recorded in Implementation notes (edge case 3).
- [ ] `Microsoft.Extensions.ApiDescription.Server` has an inline `Version` in the csproj and `src/api/Directory.Packages.props` is unchanged (AC1).
- [ ] `pnpm lint:fix` leaves `openapi/` untouched; `pnpm ci:typecheck`, `pnpm ci:test` and `pnpm generate` are green.
- [ ] `CLAUDE.md` wording and `specs/enforcement.md` API-01 row updated (AC9).
- [ ] PR pipeline green (`10-quality-assurance.yml`, and `40-build-deploy-aks.yml` since `src/api/` changes); no `20-build-deploy-playwright.yml` visual change expected.

## Adversarial review
Lite, story level. Blockers only, plus the planner's nine pre-implementation findings verified against the current `main` tree. No blockers found; four acceptance criteria and one edge case were factually wrong as written and are corrected with PROPOSED edits above (routed, so they do not force discussion). Consistency with the approved feature design/architecture holds, and the ST-01 dependency is explicit.

Verification of the planner's flagged items:

1. **(should-fix, routed) AC1 wording unsatisfiable.** Confirmed against `src/api/Directory.Packages.props` (no central package management; bare `PackageReference` for FluentValidation) and `Bach.Software.Web.csproj` (`Microsoft.AspNetCore.OpenApi` version inline, 9.0.6). "Version in `Directory.Packages.props`" cannot be met. PROPOSED edit on AC1 moves the version inline to the csproj, consistent with the feature architecture ("added to `Bach.Software.Web.csproj`"), so this is a wording defect with a mechanical, architecture-backed fix, not a blocker.

2. **(should-fix, routed) AC6 misses untracked files.** Confirmed: `git diff --exit-code` ignores untracked files, so a newly added or renamed `openapi/` output would not fail the gate. PROPOSED edit on AC6 adds `git add -N` / `git status --porcelain`.

3. **(should-fix, routed) AC4 lock-file path and pinned version.** Confirmed against `src/app/services/backend/kiota-lock.json` (`descriptionLocation` is `http://localhost:8080/openapi/v1.json`, `kiotaVersion` `1.34.1`). "No diff on a clean tree" is false on the first regeneration and flaps across machines without a relative path and a pinned CLI version. PROPOSED edit on AC4 captures the one-time lock change and the pinning.

4. **(nit, settled) Output file name unconfirmed.** The build-time generator names the file after the project/document, not necessarily `openapi/v1.json`. Appropriately flagged by the planner (QA finding 4) to pin via `--file-name` and verify during implementation; no AC change needed, the name must be used identically in `generate:api`, README, test and gate.

5. **(should-fix, routed) AC9 stale premise.** Confirmed: `specs/enforcement.md` API-01 row reads "Not applicable" (reason: "No static OpenAPI document is committed"), not "Open". The end state (Enforced) is unchanged; PROPOSED edit on AC9 corrects the wording. The feature architecture's "rows move off Open/Review only" carries the same stale label but the same end state, so no feature amendment is needed.

6. **(should-fix, routed) Docker build context.** Confirmed: `src/api/Dockerfile` publishes from `/src` with the project at `/src/Bach.Software.Web`, so `../../../openapi` resolves to `/openapi` outside the `/src` context, a real risk to the `40-build-deploy-aks.yml` image build. PROPOSED edit in Edge cases disables generation on the publish step unconditionally and records the Dockerfile deviation in Implementation notes.

7. **(settled) Hot reload may skip regeneration.** Appropriately handled by the AC7 manual check plus README rebuild-fallback; no change needed.

8. **(settled) Lint and line endings.** Appropriately handled by the proposed `openapi/**` ESLint ignore and `.gitattributes` `eol=lf` rule; no change needed.

9. **(settled) Ordering dependency on ST-01.** Confirmed: ST-01 is in `adversarial-review`, not done, so AC3/AC5 (400/500/502 schemas, 502 declaration) are legitimately blocked until ST-01 lands, not failed. The dependency is explicit in Architecture reference and the feature Stories table. Not a blocker to this story's readiness; the delegation chain gates implementation on ST-01 anyway.

## Implementation notes
Deviations from plan, with reasons. None affects the feature design/architecture, so nothing is propagated to the feature spec.

- **File name pinned to `openapi/v1.json`** via `<OpenApiGenerateDocumentsOptions>--file-name v1</OpenApiGenerateDocumentsOptions>`. Used identically in the csproj, `generate:api`, README, the new test and the CI gate.
- **`Microsoft.Extensions.ApiDescription.Server` 9.0.6** (inline, `PrivateAssets=all`), matching `Microsoft.AspNetCore.OpenApi` 9.0.6. `Directory.Packages.props` untouched.
- **ADR 4-A confirmed:** `dotnet build` and `dotnet test` succeed with `PLAUSIBLE_API_TOKEN` unset; no dummy token needed.
- **Dockerfile:** `dotnet publish` passes `-p:OpenApiGenerateDocuments=false` (not in the architecture file list). `docker build -f src/api/Dockerfile src/api` succeeded and the image has no `/openapi`.
- **Kiota pinned** in a new local tool manifest `.config/dotnet-tools.json` (1.34.1). `pnpm generate:api` runs `dotnet tool restore && dotnet kiota generate ... -d openapi/v1.json -o src/app/services/backend`. Kiota stores the location relative to the output folder (`../../../../openapi/v1.json`); a second run, and a run from `src/app` via `pnpm --dir`, produce no diff.
- **Generated `baseUrl` changed** in `backendApiClient.ts` from `http://localhost:8080/api` to `/api` (the document's `/api` server entry, previously absolutised by the live server). No runtime effect: `services/backend/index.ts` already sets `adapter.baseUrl = '/api'`.
- **Trailing newline:** the generator emits no trailing newline, so the committed file has none (the gate compares generator output, so adding one by hand would fail it). No CRLF. `.gitattributes` adds `openapi/*.json text eol=lf`; `openapi/**` added to the ESLint ignores.
- **CI gate** lives in the `backend-test` job: a real `dotnet build` (not `--no-build`), then `git add -N openapi/` and `git diff --exit-code openapi/` with an error message. It runs only on the ephemeral CI checkout.
- **Local demonstration of the gate (no git state touched):** the document is still untracked in this working tree, so `git diff` could not show it; a plain `diff` against a saved copy was used instead. Changing the health endpoint description and rebuilding changed `openapi/v1.json` (diff exit 1); reverting restored a byte-identical file. Deleting the file and rebuilding after `dotnet clean` regenerated an identical hash. The CI run on the PR (stale, untracked and cross-OS macOS vs `ubuntu-latest` cases) is not yet observed and must be confirmed there.
- **Docs:** `specs/enforcement.md` API-01 moves to Enforced; the FE-19 row's stale "no static openapi.json" sentence was updated too. `CLAUDE.md` now points to `pnpm generate:api`.
- **Not run:** the `pnpm dev:api` hot-reload check (AC7a) and the README walkthrough from a clean clone; the README states a restart is needed if hot reload skips regeneration. `pnpm playwright:docker` not run (no UI change). `src/api/Bach.Software.Tests/PageReadsTest.cs` left alone as instructed.
- **Checks (this tree):** `dotnet test src/api/Bach.Software.sln` 114 passed (also with the token unset), `pnpm lint:fix` clean, `pnpm ci:typecheck` clean, `pnpm ci:test` 281 passed, `pnpm generate` succeeded (including route verification). `colima` was started to run the Docker build.

## Verification report

**Verdict: pass-with-notes.** Verified in the shared uncommitted working tree (ST-01 and ST-02 done; ST-03's blocked `PageReadsTest.cs` deletion ignored). No git state changed; the temporary endpoint-description change was fully reverted (file and `openapi/v1.json` hashes match the pre-experiment values).

### Checks run
| Check | Result |
|---|---|
| `env -u PLAUSIBLE_API_TOKEN dotnet build src/api/Bach.Software.sln` | Pass, 0 warnings, 0 errors, no token needed (ADR 4-A holds) |
| `env -u PLAUSIBLE_API_TOKEN dotnet test src/api/Bach.Software.sln` | 114 passed, 0 failed |
| `pnpm lint:fix` | Clean; `openapi/` untouched (ESLint ignore in place) |
| `pnpm ci:typecheck` | Exit 0 |
| `pnpm ci:test` | 35 files, 281 tests passed |
| `pnpm generate` | Exit 0, `verify-cf-routes` OK (top-level `openapi/` has no effect) |
| `docker build -f src/api/Dockerfile src/api` | Succeeds; image root has no `/openapi` |
| Determinism | Build, `dotnet clean` + delete + rebuild: byte-identical (md5 `06d2044479483d6943eed9b248243000`), no CRLF |
| Playwright | Not run: no UI change, story does not require it |

### Acceptance criteria
| AC | Result | Evidence |
|---|---|---|
| 1 | Pass | csproj: `Microsoft.Extensions.ApiDescription.Server` 9.0.6 inline, `PrivateAssets=all`, aligned with `Microsoft.AspNetCore.OpenApi` 9.0.6; `OpenApiGenerateDocuments=true`; `OpenApiDocumentsDirectory` = `$(MSBuildProjectDirectory)/../../../openapi`; `Directory.Packages.props` has no diff; output lands in repo-root `openapi/v1.json`, nothing under `src/api/` |
| 2 | Pass | Build with token unset succeeds and rewrites `openapi/v1.json` identically; tests also green with it unset |
| 3 | Pass | Parsed the file: `servers` = `[{url:/api}]`; paths `/health`, `/analytics/pageReads`, `/analytics/pageLikes` (none `/api`-prefixed); pageReads and pageLikes declare 400 `ValidationProblemDetails`, 500 and 502 `ProblemDetails`. `CommittedOpenApiDocumentTests` (4 tests incl. runtime parity) pass |
| 4 | Pass | `package.json` `generate:api` uses `-d openapi/v1.json`, no `http://`; Kiota pinned 1.34.1 in `.config/dotnet-tools.json`. Re-ran `pnpm generate:api` twice (once via `pnpm` from `src/app`): md5 of every file under `src/app/services/backend/` unchanged. A fresh generation into a scratch folder matches the committed client except the hand-written `index.ts` and the lock-file relative path. Lock holds `../../../../openapi/v1.json` and `kiotaVersion` 1.34.1 |
| 5 | Pass | `errorMappings` in `pageReads/index.ts` and `pageLikes/index.ts` contain 400, 500, 502; `health/index.ts` gains 502 (root group), explained |
| 6 | Pass with note | Workflow `backend-test` job: step "Build backend and regenerate the OpenAPI document" runs a real `dotnet build src/api/Bach.Software.sln --no-restore` (not `--no-build`), then step "Check the committed OpenAPI document is up to date" runs `git add -N openapi/` and `git diff --exit-code openapi/` with an `::error::` message. Local demonstration: changing the health `WithDescription` and rebuilding changed `openapi/v1.json` (`diff` vs saved copy, exit 1); reverted to byte-identical. Also confirmed that plain `git diff --exit-code openapi/` exits 0 on the untracked folder, which is why the `git add -N` is needed. The failing/passing CI run is not observable locally (see notes) |
| 7 | Partial, accepted | README documents build writes `openapi/`, `pnpm generate:api`, commit both, pinned Kiota, no running server, and the restart fallback for hot reload. The `dotnet watch` hot-reload check (7a) and a clean-clone README walkthrough (7b) were not run by me or the developer; the README fallback covers the risk |
| 8 | Pass | `OpenApiDocumentTests` (now with the ST-01 cases) pass; `app.MapOpenApi()` untouched |
| 9 | Pass | `specs/enforcement.md` API-01 reads "Enforced, build + CI" naming the build-time document, the CI diff gate (incl. untracked), `pnpm generate:api`, pinned Kiota and the committed-document test; FE-19 stale sentence updated; `CLAUDE.md` now says build, `pnpm generate:api`, commit both, and no longer mentions `kiota generate` against a server |

### Judgment of recorded deviations
- **No trailing newline in `openapi/v1.json`:** accepted. The CI gate compares generator output, so a hand-added newline would fail it. This overrides the QA plan's "single trailing newline" line, which assumed a generator behaviour that does not hold. `.gitattributes` `openapi/*.json text eol=lf` is in place.
- **Generated `baseUrl` now `/api`:** accepted. It follows the document's `/api` server entry; `src/app/services/backend/index.ts` line 37 already sets `adapter.baseUrl = '/api'`, so no runtime effect.
- **Gate demonstrated with plain `diff`:** accepted, since `openapi/` is untracked in this tree; I also confirmed the plain-`git diff` blind spot directly. The CI step text itself is correct for both stale and untracked cases.
- **Dockerfile `-p:OpenApiGenerateDocuments=false`:** accepted and proven with a real image build.

### Process compliance
README, `CLAUDE.md`, `specs/enforcement.md` updated. `package.json` has the `generate:api` script per the project rule. No spec, story, AC or ADR references in the new test, csproj, workflow, Dockerfile, README or manifest. Test names follow `MethodName_Scenario_ExpectedBehaviour`. No `specs/components.md` change needed (no component surface). No release or docs obligation per the profile.

### Notes for the maintainer (not blockers)
1. The CI gate has not been seen running. Do not merge until `10-quality-assurance.yml` is green on `ubuntu-latest` with the document generated on macOS (cross-OS determinism proof) and the Codecov and `40-build-deploy-aks.yml` checks pass.
2. `openapi/`, `.config/` and `.gitattributes` are untracked: they must be added at commit time or the gate and `generate:api` fail on a clean checkout.
3. AC7a (hot reload) and the README clean-clone walkthrough remain unobserved.
4. Link the PR in the frontmatter `pr:` field.
