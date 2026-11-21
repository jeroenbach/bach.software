# Project profile

## Identity

Bach Software is Jeroen's personal blog and portfolio website: a statically generated Nuxt 4 + Vue 3 + TypeScript frontend (`src/app/`) paired with a separately deployed .NET 9 API backend (`src/api/`). Its users are site visitors and blog readers (end users), not library consumers or docs readers; there is no separate "operator" audience beyond Jeroen as the maintainer.

## Technology packs

- vue
  - Deviation from FE-12: ignored until a parent-owned async action exists; adopt the Loading Promise Pattern with the first feature that introduces one (decided 2026-11-20).
- csharp
- dotnet-api

## Commands

```bash
# Install dependencies
pnpm install

# Development
pnpm dev           # Frontend (also runs i18n-extract automatically)
pnpm dev:api       # Backend .NET API (cd src/api && dotnet watch run --project Bach.Software.Web)

# Full check
pnpm check         # Lint + typecheck (bash scripts/check.sh)

# Individual checks
pnpm lint:fix       # ESLint with auto-fix, must be clean
pnpm ci:typecheck   # nuxi typecheck, must be clean
pnpm ci:test        # Vitest unit tests, single run; coverage must not decrease vs. main
dotnet test src/api/Bach.Software.sln   # Backend tests (only when src/api files changed)

# A single frontend test file
TZ=Europe/Amsterdam npx vitest run src/app/composables/useStopWatch.test.ts

# E2E + visual regression capture (requires Docker/colima on macOS)
pnpm playwright:docker            # builds the site, then captures screenshots and runs Playwright in the pinned container (matches CI)
pnpm ci:playwright:docker         # same without building first
pnpm vrt:compare                  # pulls the baseline from R2 and writes the diff report to .reg/index.html (read-only credentials)
pnpm vrt:ci                       # reg-suit run, CI only

# Build
pnpm generate      # Static site generation for Cloudflare Pages
```

Backend lives in `src/api/`; `dotnet test` and `dotnet watch` are run against `src/api/Bach.Software.sln` / `src/api/Bach.Software.Web`, not the repo root.

## Quality gates

A story counts as done when, per the project CLAUDE.md "Workflow — Before Finishing Any Change":

- `pnpm lint:fix`, `pnpm ci:typecheck`, and `pnpm ci:test` are clean (coverage not decreased vs. `main`, tracked by Codecov).
- `pnpm playwright:docker` passes (screenshot capture + E2E) for any change touching `src/app/`; the visual comparison itself is the reg-suit check on the PR, which must be green or its report reviewed and approved with the PR.
- `dotnet test src/api/Bach.Software.sln` passes for any change touching `src/api/`.
- Every functional change has accompanying tests (unit/component/`.nuxt.test.ts` for frontend logic, xUnit for backend).
- UI changes are screenshotted locally for review and verified on the Cloudflare Pages PR preview before calling the work done.
- The PR's GitHub Actions pipeline (`10-quality-assurance.yml`, `20-build-deploy-playwright.yml`, and `40-build-deploy-aks.yml` when backend files changed) is green.

## Testing

- Frontend: two Vitest projects (`vitest.config.ts`) — `unit` (`happy-dom`, `*.test.ts`/`*.spec.ts`) for components/composables/utils, and `nuxt` (full Nuxt runtime via `@nuxt/test-utils`, `*.nuxt.test.ts`/`*.nuxt.spec.ts`) for anything needing routing/i18n/`useHead`. Always run with `TZ=Europe/Amsterdam` (baked into `pnpm test`/`pnpm ci:test`).
- No HTML snapshot tests: components get a Storybook story plus a Playwright capture entry in `src/app/tests/playwright/components.spec.ts` instead. Visual baselines are not committed: the specs only capture screenshots (`page.screenshot` into `visual-regression/actual/`, git-ignored) inside the pinned `mcr.microsoft.com/playwright:v1.60.0-jammy` container, and reg-suit compares them against the baseline published in the Cloudflare R2 bucket `bach-software-visual-regression` for the commit the branch forked from. CI (`20-build-deploy-playwright.yml`) runs `reg-suit run` on every PR and every push to `main`; the `main` runs publish the baseline. Approving the PR is approving the visual change. This supersedes the earlier committed-baselines deviation.
- E2E: Playwright specs in `src/app/tests/playwright/`.
- Backend: xUnit tests in `Bach.Software.Tests`, run via `dotnet test src/api/Bach.Software.sln`.

## data-testid convention

Tests select elements through `data-testid`, never through CSS classes, visible text or DOM position. This is the vue pack's FE-07 standard, adopted exactly; the lint in `eslint.config.js` (`vue/no-restricted-syntax`) enforces the id shape on `.vue` templates.

- **Attribute:** `data-testid`, the default of Playwright's and Testing Library's `getByTestId`. Never `data-test`, `data-cy`, `data-qa` or any other variant, and `testIdAttribute` stays at its default.
- **Pattern:** lowercase kebab-case `<context>-<purpose>-<elementtype>`, full words, no camelCase, underscores or abbreviations. The element type is the last word and the context the first; the purpose sits between them (`order-details-export-button`).
- **Element types** (extend the list here first, never invent a one-off suffix): `button`, `input` (including date inputs), `link`, `checkbox`, `radio`, `select`, `table`, `icon`, `value` (a displayed, read-only value), and the containers that exist as a test scope: `row`, `card`, `panel`, `modal`.
- **Add an id to:** every interactive element (buttons, inputs, links, checkboxes, radios, selects), every element a test needs as a scope (a row, card, panel or modal), and every displayed value a test asserts on or that could be confused with a sibling of the same shape.
- **Do not add an id to:** static labels and headings (the value gets the id, not its label), or purely decorative and layout elements. No blanket tagging of every element.
- **Uniqueness:** an id is unique within its scope, not globally. A scope is a page, a row container, a modal, or any element carrying its own container id. Playwright's `getByTestId` is strict, so an unscoped query against a repeated id fails loudly.
- **Reusable components** cannot hardcode their context. They take a `baseDataTestid` prop that defaults to the component's own kebab-case name and build every inner id from it (`` :data-testid="`${baseDataTestid}-submit-comment-button`" ``). With several instances on one page, override the base per instance (`baseDataTestid="welcome-card"`, `baseDataTestid="news-card"`).
- **Repeated rows and list items:** the container carries `<context>-row-<key>` (the key is the last part, an entity's stable business key), and tests scope through it. Controls and values inside the row keep the plain three-part id and are never suffixed. Suffix the element itself with the key only when there is no container to carry an id. Use an index only when the test is about position, and say so in the test name.
- **In tests:** select by id (`page.getByTestId('order-details-deadline-value')`) and assert on its content. If an element is hard to select, add an id instead of writing a cleverer selector.
- **Production builds** keep the attributes so the end-to-end suite can run against a deployed build. Do not add a plugin that strips them. Renaming or removing an id breaks whoever tests against it, so treat it as a breaking change.

## Public surface & compatibility

This is a private, unpublished application (no npm publish, `"private": true`, version `0.1.0`): there is no semver compatibility promise, internal-only. The project still keeps a living inventory of its shared public surface in `specs/components.md` — shared presentational components (`src/app/components/`), context composables (`src/app/contexts/`), and MDC content components (`src/app/components/content/`) — because reuse across the blog/portfolio UI benefits from one place to check before adding something new. The backend API's public surface is its OpenAPI-described endpoints, consumed only by the frontend's Kiota-generated client (`src/app/services/backend/`); no external consumers.

## Release & changelog

None. No changesets, no package publishing, no version-bump bookkeeping. Shipping is: merge to `main` triggers an automatic deploy (Cloudflare Pages for the frontend, AKS for the backend via `40-build-deploy-aks.yml`).

## Documentation

None beyond `specs/components.md`. There is no separate docs site or reference folder; the blog content itself is the product, and the component inventory is the only living documentation artifact the developer must keep current.

## Design & manual verification

- UI lives in `src/app/` (Nuxt pages, `src/app/components/`, `src/app/contexts/`) and is also exercised in Storybook (`pnpm storybook`, published at `/_storybook` on the deployed site).
- Both color modes must work: light and dark, via `@nuxtjs/color-mode` (`classSuffix: ''`), toggled by `ColorModeSwitcher`.
- Manual verification: screenshot UI changes locally (Playwright script or Storybook), then check the Cloudflare Pages PR preview (`https://pr-<PR-number>.bach.software`) end-to-end before calling a change done, per CLAUDE.md.

## Domain references

No fixed list. Agents check the official docs of whatever dependency is in play (Nuxt, Nuxt Content, Nuxt i18n, Kiota, Azure Functions/ASP.NET, etc.) at the versions actually installed in `package.json` / the `.csproj` files, rather than a pinned set of references.

## Git & delivery

- Merge policy: regular merge commits via GitHub PRs (never squash) — per-story/per-commit history is preserved on `main`.
- Deploy previews to check: `https://pr-<PR-number>.bach.software` (frontend, Cloudflare Pages) and the AKS `pr-<PR-number>` image tag (backend, via `40-build-deploy-aks.yml`) for changes touching `src/api/`.
- No commit-message conventions beyond what is already in the project's `CLAUDE.md` (business-purpose-first subject, no mid-sentence hard wraps, backdating recipe).
- Interactive vs. autonomous session rules: unchanged from the plugin defaults and CLAUDE.md's "Interactive vs Autonomous Sessions" section — no project-specific sharpening.
