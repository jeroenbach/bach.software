# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
pnpm install

# Setup local environment variables (interactive; creates .env.local)
pnpm dev-setup

# Development
pnpm dev           # Frontend (also runs i18n-extract automatically)
pnpm dev:api       # Backend .NET API (dotnet watch run --project src/api/Bach.Software.Web on http://localhost:8080)

# Testing
pnpm test          # Vitest unit tests — watch mode
pnpm ci:test       # Vitest unit tests — single run
pnpm playwright    # E2E tests (Playwright)

# A single test file (examples):
TZ=Europe/Amsterdam npx vitest run src/app/composables/useStopWatch.test.ts
TZ=Europe/Amsterdam npx vitest run src/app/components/ResponsiveImage.nuxt.test.ts

# Code quality
pnpm lint          # ESLint
pnpm lint:fix      # ESLint with auto-fix
pnpm check         # Lint + typecheck

# Build
pnpm generate      # Static site generation (for production / Cloudflare Pages)
pnpm preview       # Preview generated site locally

# Storybook
pnpm storybook     # Start Storybook dev server on port 6006

# Screenshot / visual regression tests (capture needs Docker/colima on macOS)
pnpm playwright:docker             # Build the site, then capture screenshots + run Playwright in the pinned container (matches CI)
pnpm ci:playwright:docker          # Same without building first (assumes an existing build)
pnpm vrt:compare                   # Download the baseline from R2 and write the diff report to .reg/index.html (read-only credentials)
pnpm vrt:ci                        # reg-suit run, only meant for CI
```

> **Important**: `pnpm dev` and `pnpm generate` both auto-run `i18n-extract` first. If translations are out of sync you'll see TypeScript errors — run `pnpm dev` once to re-sync.

## Writing Style

- **Never use em dashes (—) to connect two clauses/sentences** in any text you write: content, copy, descriptions, PR text, etc. Rephrase the sentence or use a comma, colon, or parentheses instead. Other uses of the em-dash character are fine (e.g. a placeholder glyph for a missing value, a literal character being preserved from existing/ported behavior).
- **Markdown tables must be readable as plain text.** Pad every cell so the pipes of all rows line up in a monospace font (align the `---` separator row too). Specs, docs, and READMEs are read in editors and diffs without a markdown previewer, so an unaligned table is unreadable where it is actually consumed. Re-align a table after editing it.

## Code Comments

- **Never reference specs, features, stories, or process artifacts in code comments or test names**: no FEAT-001, ST-05, AC4, ADR-2, "QA plan", "feature spec", "finding 3", "decision 4", etc. Specs are process artifacts; the code must stand on its own for a reader who has never seen them.
- Write sensible comments: short and powerful. Let function and variable names carry the explanation; a comment only earns its place when it states a constraint or rationale the code itself cannot show.

## Code Conventions

- **Vue: always use camelCase, never kebab-case** (component names, props, event names, ...). This is also enforced by ESLint (see the ESLint section below).
- **Never use `:style` bindings or inline `style` attributes without Jeroen's explicit approval.** Styling belongs in CSS classes in the stylesheet. When a value must vary per instance, drive it with a class chosen from a prop, not an inline style. If a case truly seems to need `:style`, stop and ask first.
- **`data-testid` naming follows the convention in `specs/PROJECT.md` ("data-testid convention").** Lowercase kebab-case `<context>-<purpose>-<elementtype>`, a `baseDataTestid` prop (defaulting to the component's kebab-case name) on reusable components, and `getByTestId` in tests instead of class, text or position selectors. Lint rejects ids that do not follow the shape.
- **Every user-runnable script gets a `package.json` script.** Whenever you add a script meant to be run by the user (e.g. anything under `scripts/`), add a matching entry to the `scripts` section of `package.json` so it can be run via `pnpm <name>` instead of a long raw command. Name it clearly (e.g. `upload-images` for `scripts/upload-product-images.mjs`).
- **Shared file naming (enforced by ESLint):** files in `src/app/utils/` end in `Util` (`dateUtil.ts`) and files in `src/app/composables/` start with `use` (`useStopWatch.ts`). Use singular, camelCase names; tests mirror the base name with `.test.ts` (or `.nuxt.test.ts`). Other folders are unaffected.

## Git

- **Commit messages lead with the business purpose, not the mechanism.** Open with why this matters, the problem it solves for whoever hits it (a site visitor, a reader, Jeroen maintaining the site), before any technical detail. Technical detail (which flag, which component, why a particular approach was chosen) can follow after that, only if it matters, and should stay brief. **If the business purpose isn't already documented and can't be inferred with confidence, ask Jeroen rather than guessing at one.** For spec-driven work it's usually already written down: pull it from the feature's `Problem & goal` or the story's `User story` section instead of re-deriving it from the diff. When starting a new feature spec, the product-owner should make sure `Problem & goal` actually captures the business purpose (the why, for whom), since it gets reused verbatim later for commit messages.
- **Commit message wrapping: no hard line breaks mid-sentence.** Write each paragraph and each bullet as one continuous line, so the editor's word-wrap handles the display. Only insert a real newline where a new paragraph, bullet, or the subject/body separation actually starts. Never hard-wrap a sentence across multiple lines at a fixed column, because those breaks show up as awkward mid-sentence line breaks when pasted into the VS Code commit box.
- To backdate a commit, set both the committer and the author date:

  ```bash
  GIT_COMMITTER_DATE="Sun Aug 03 20:02:43 2025 +0200" git commit --amend --date="Sun Aug 03 20:02:43 2025 +0200" --no-edit
  ```

## Workflow — Before Finishing Any Change

When completing any code change (feature, fix, refactor):

0. **Verify `node_modules` is actually installed before running any of the steps below** (e.g. `ls node_modules | head`) — don't assume it is. Fresh/sandboxed checkouts can start with an empty `node_modules`, and tools like bare `npx eslint`/`npx tsc` will then fail with confusing module-not-found errors (e.g. `Cannot find package '@antfu/eslint-config'`) that look unrelated to the real cause. If it's missing or empty, run `pnpm install` first.
1. **Run all pipeline checks locally** and fix every error before pushing:
   ```bash
   pnpm lint:fix       # must be clean (auto-fixes what it can)
   pnpm ci:typecheck   # must be clean
   pnpm ci:test        # must pass; coverage must not decrease vs. main
   pnpm playwright:docker   # builds the site, then captures screenshots + runs E2E in Docker (requires Docker/colima)
   dotnet test src/api/Bach.Software.sln   # if backend files changed
   ```
   When a step fails, fix the error and re-run **only that step** — don't restart the whole list from the top (the earlier steps already passed). If the failing tool supports scoping, narrow the re-run to just the affected area first (e.g. `npx eslint --fix <file>`, `TZ=Europe/Amsterdam npx vitest run <test-file>`, `pnpm ci:playwright -- <spec>` inside Docker, or `dotnet test --filter <TestName>`), then run the full step once more to confirm it's clean before moving on.
2. **Add tests** for any new logic — unit tests for pure functions/composables, component tests for `src/app/components/`, `.nuxt.test.ts` for anything needing Nuxt runtime. Coverage must not decrease (tracked by Codecov) — check this locally via `pnpm ci:test` coverage output where possible; if local coverage comparison isn't possible, wait for the PR and check the Codecov status/comment there instead.
3. **Screenshot UI changes** using the Playwright script below or the Storybook dev server (`pnpm storybook`), and show the screenshots directly in the chat for review. Screenshots are local-only scratch output (`.github/screenshots/`, gitignored) — never commit them and never add them to the PR description.
   ```bash
   # Start dev server, then run:
   # node --input-type=module < scripts/take-screenshots.js
   # Screenshots go to .github/screenshots/<name>.png — read them and show them in chat.
   ```
4. **Check the Cloudflare Pages deploy preview instead of adding screenshots to the PR.** Cloudflare automatically creates a preview environment for every open PR; that's what reviewers use to check the change live, not static images in the PR body. The preview URL is posted as a GitHub commit status once `20-build-deploy-playwright.yml` completes. Verify the changed pages render and work correctly end-to-end in the preview. On merge to `main`, Cloudflare deploys to production automatically.

   **Always surface the Cloudflare Pages preview URL when you report a PR — not just the GitHub PR URL.** The URL is not posted as a commit status or bot comment; it is printed by the `Deploy Job` step of `20-build-deploy-playwright.yml` in the `cloudflare/wrangler-action` output (`✨ Deployment alias URL: ...`). Retrieve it from that job's logs once the Deploy Job succeeds. The deploy aliases PRs with `--branch=${{ github.ref_name }}`, which on a pull request is `<PR-number>/merge`, so the **stable preview URL for a PR is `https://<PR-number>-merge.bach-software.pages.dev`** (e.g. PR #63 → `https://63-merge.bach-software.pages.dev`). It always points at the latest deploy of that PR. Preview URLs live on the `pages.dev` domain only; `pr-<N>.bach.software` does not exist (no wildcard DNS is configured for previews on the custom domain). Include this URL in your reply to the user and in the PR description, and when a change touches specific pages, link directly to them on the preview host (e.g. `.../products`).

5. **Always check the PR pipeline and fix any problems.** After pushing (and again on every later push), watch the GitHub Actions runs for the PR — `10-quality-assurance.yml` (lint, typecheck, unit tests, backend tests, coverage, Trivy) and `20-build-deploy-playwright.yml` (build, deploy, Playwright E2E). If any check fails or is red, investigate the logs, reproduce and fix the failure locally, then push the fix and re-check — repeat until the whole pipeline is green. Do not consider a change done while its PR pipeline is failing.

## Remembering Instructions

Whenever the user says "remember this" (or similar) about an instruction or preference, add it to this CLAUDE.md file in the appropriate section (create one if needed). Keep CLAUDE.md as one single file, do not split it into partials. Whether to commit that edit follows the same rule as everything else (see "Interactive vs Autonomous Sessions"): in an interactive session, make the edit and stop there; the user commits it themselves.

## Interactive vs Autonomous Sessions

Which mode applies depends on where the session runs, not on whether Jeroen is chatting along:

- **Working together (interactive session, on Jeroen's local computer)**: only make the changes, do **not** touch git state in any way: no commits, no pushes, and no staging (`git add`). The user stages changes himself deliberately, so he can see what changed in the working tree; staging on his behalf destroys that overview. Read-only git commands (status, diff, log) are fine. When implementing a feature's stories (e.g. via `/spec:continue`), do **not** stop after each story: implement and verify all approved stories in dependency order in one run, leaving everything uncommitted. Only stop early for a parked story, a story waiting on an approval gate, or a story that depends on one of those.
- **Working autonomously (any Claude Code cloud session, i.e. `CLAUDE_CODE_REMOTE=true`, even one Jeroen is chatting with live; GitHub Actions; scheduled agents; or when explicitly asked to finish a task end-to-end)**: follow the full workflow above, including commits, pushes, screenshots, and the PR. Jeroen cannot see a cloud container's working tree, so cloud work only counts once it is committed and pushed.

## Spec-Driven Development

Larger work runs through the spec workflow in `specs/` (see `specs/README.md` and the `spec` plugin's `docs/WORKFLOW.md` for the full lifecycle): epics, features, and stories with approval gates that only Jeroen may pass. He passes the gates in person (`/spec:approve`), or delegates them for one low-risk spec by typing `/spec:auto <id>`, which runs the whole process end to end and approves on his behalf; no agent ever approves outside that typed delegation. The `/spec:*` commands and their agents come from the `spec` plugin in [jeroenbach/claude-plugins](https://github.com/jeroenbach/claude-plugins) (how to install it locally and in cloud sessions: the "Fresh clone?" note in `specs/README.md`), and `specs/components.md` is the living inventory of shared components (keep it up to date on every shared component change). Bug fixes and trivial changes can use `/spec:quick`.

## Architecture

This is a hybrid static site with two independent layers:

- **Frontend** (`src/app/`) — Nuxt 4 + Vue 3 + TypeScript, statically generated and deployed to Cloudflare Pages.
- **Backend** (`src/api/`) — .NET 9 ASP.NET Core minimal API, deployed separately as a container on AKS.

The frontend communicates with the backend via `NUXT_PUBLIC_API_BASE` (`http://localhost:8080` in dev, set in `.env.local` by `pnpm dev-setup`). The backend client in `src/app/services/backend/` is generated by [Kiota](https://learn.microsoft.com/en-us/openapi/kiota) from the committed OpenAPI document `openapi/v1.json`, which the backend build writes. When the API changes, build the backend (`dotnet build src/api/Bach.Software.sln`), run `pnpm generate:api`, and commit both `openapi/` and the client; CI fails on a stale `openapi/` (see `src/app/services/backend/README.md`).

### Routing

There are only two page files that handle all content:

- `src/app/pages/[[segment1]]/[id]-[[slug]].vue` — resolves both blog posts and pages using `postsPaths`/`pagesPaths` maps from `locales.config.ts`.
- `src/app/pages/[...pathSegments].vue` — catch-all, handles lists and other routes.

The `segment1` part of the URL (`/posts/`, `/articles/`, `/content/`, etc.) is locale-specific and defined in `locales.config.ts`. The router uses it to distinguish between a post and a page.

### Internationalisation (i18n)

Three locales: `en` (default/catchall), `nl`, `de`. Strategy is `prefix_except_default` — English URLs have no prefix, others have `/nl/`, `/de/`, etc.

Content is duplicated per locale in `src/app/content/{locale}/`. Nuxt Content collections are generated dynamically in `content.config.ts` as `posts_{locale}`, `pages_{locale}`, and `authors_{locale}`. Always use the locale-specific collection name (e.g. `queryCollection('posts_en')`).

i18n translation keys live in `src/app/locales/*.json`. Run `pnpm i18n-extract` (or just `pnpm dev`) to add/remove keys automatically after adding `$t('key')` calls.

**Key naming convention: structured code keys, never sentences** (per standard FE-08 in the `spec` plugin). Every key is camelCase inside a feature- or component-scoped group: `appHeader.openMainMenu`, `blog.filter.label`, `likeButton.liked`. Rules:

- The key names the meaning/role, not the current English wording (`colorModeSwitcher.label`, not `colorModeSwitcher.switchColorMode`), so copy changes never force key renames.
- Never use a sentence or English text as a key. Besides the FE-08 reasons, vue-i18n parses `.` in a key as a path separator, so sentence keys containing a dot silently create bogus nested entries.
- Every user-visible string goes through the catalog, including proper nouns and trademarks (`appHeader.brand`, `authorInformation.linkedin`); invariant copy simply has identical values in all locales. The locale file must be the complete inventory of what the site says.
- Keep the key structure identical across `en.json`, `nl.json`, and `de.json`; keep groups alphabetically sorted.

### Context / Presentational Component Pattern

This is the central architectural pattern — a strict separation between presentational and context components:

- **Presentational components** (`src/app/components/`) — pure UI: **props in, emits out, nothing else**. They must cause **no side effects**: no router, no stores, no API calls, no access to shared state. Testable in isolation and documented in Storybook.
- **Context components/composables** (`src/app/contexts/`) — the smart layer: **all API calls and all access to shared state live here**. They fetch data, hold state, wire up external dependencies, then pass data down to presentational components via props. Always named with the `Context` suffix (`AppHeaderContext.vue`, `useBlogPostsContext.ts`, etc.) and placed in the context folder.

**Nesting via slots instead of prop drilling:** compose components at the **page or context level** by placing child components into slots, rather than passing lots of props down through intermediate components. For example: `AppHeaderContext` renders `AppHeader` and mounts `SearchContext` inside one of `AppHeader`'s slots. `AppHeader` stays presentational (it just provides the slot), and `SearchContext` gets its own data itself — no prop drilling through the header.

**Links and routing in presentational components:** distinguish *rendering* navigation from *performing* navigation:

- Presentational components **may render** links (`AppLink`/`ChipLink`/`NuxtLink`) with a `to` prop — a rendered `<a href>` is declarative output, like rendered text; the navigation side effect is initiated by the user/browser, not the component. Real anchors are required anyway (SEO, middle-click, no-JS). Never replace a link with a click-emit that makes the context call `router.push` — navigation is content to render, not an action to emit.
- Presentational components **may not call** `useRoute()`, `useRouter()`, or `navigateTo()` — reading the route is ambient shared state and breaks the props-in/emits-out contract. Anything route-derived (current query, active filter, current page) must be read at the page/context level and passed down as a prop.
- When building link targets that modify the current URL's query string, pass the **whole `route.query`** down as a `query: LocationQuery` prop (not individual values like `activeCategory`), spread it, and change only the relevant key — this preserves unrelated query parameters. Omit `path` in the `to` object (`{ query: ... }` resolves relative to the current route). A filter link must also drop `page` so changing a filter resets pagination.

### App-level Configuration Constants

App-wide, non-secret tuning values (page sizes, display toggles, etc.) belong in `src/app/app.config.ts` via `defineAppConfig`, read with `useAppConfig()` at the page/context level — never exported as constants from contexts or composables. Composables should receive such values as parameters so they stay generic (e.g. `useBlogPostPagination(items, page, pageSize)` gets `blogPageSize` from `useAppConfig()` in the page).

### Content & Data Flow

`content.config.ts` defines typed Zod schemas (`postSchema`, `pageSchema`, `authorSchema`) for all Nuxt Content collections. Context composables use `queryCollection(collectionName)` and the `whereNotDraft()` utility to query these.

Author data is joined into post results inside `useBlogPostsContext` — the content itself only stores `authorName`, and the context resolves the full `Author` object by querying `authors_{locale}`.

URLs for posts and pages are computed by helpers in `locales.config.ts` (`createBlogPostUrl`, `createPageUrl`) and stored as `url` on the content item. A content item's `url` takes precedence over the path-based URL, and the page component redirects (301) if the current path doesn't match.

### Reusable Content Snippets (shared text in products/posts/pages)

Text that repeats across multiple content markdown files (e.g. the same care instructions, shipping info, or size guide in many products) must **not** be copy-pasted into each `.md` file. Instead, use shared snippets:

- Shared text lives as its own markdown file in `src/app/content/{locale}/snippets/` (one folder per locale, translated like all other content, exposed as a `snippets_{locale}` collection in `content.config.ts`).
- Content files include a snippet through an MDC block component in `src/app/components/content/` (global Nuxt Content components), e.g. a `ContentSnippet.vue` that queries the `snippets_{locale}` collection for the given name and renders it with `<ContentRenderer>`:

  ```md
  ::content-snippet{name="care-instructions"}
  ::
  ```

- When editing repeated text, edit the snippet once — never the individual products/posts/pages.
- The `snippets` collection and `ContentSnippet.vue` component don't exist yet — create them following the pattern above the first time a snippet is needed.

### Metadata & SEO

`useMetadata` composable (`src/app/composables/useMetadata.ts`) centralises all SEO concerns: `useSeoMeta`, `useHead`, structured data (schema.org JSON-LD), canonical URLs, and hreflang alternate links. Call it from page-level components, not from presentational components.

Alternate URLs across locales come from `useAlternateUrls` (`src/app/composables/useAlternateUrls.ts`): it queries the item's `contentId` in each locale's content collection directly and computes each locale's URL (and slug for the language switcher) with the `locales.config.ts` helpers. The sitemap (`server/routes/sitemap.xml.ts`) is the only consumer of the full site URL map (`getContentUrlMap` in `server/utils/contentUrls.ts`).

### Testing

Two Vitest project configurations in `vitest.config.ts`:

- **`unit`** (`happy-dom`) — for components, composables, and utils. Test files: `*.test.ts` / `*.spec.ts`.
- **`nuxt`** (full Nuxt environment via `@nuxt/test-utils`) — for anything that needs Nuxt runtime (routing, i18n, `useHead`, etc.). Test files must end in `*.nuxt.test.ts` / `*.nuxt.spec.ts`.

Always use `TZ=Europe/Amsterdam` when running tests (dates are timezone-sensitive). This is baked into the `pnpm test` and `pnpm ci:test` scripts.

**No HTML snapshot tests.** Never assert component markup with `expect(wrapper.html()).toMatchSnapshot()` (or inline/file HTML snapshots) in component tests. Instead, for every component: add it to Storybook (`ComponentName.stories.ts`) and register its story id in `src/app/tests/playwright/components.spec.ts`, which captures a screenshot of the story that reg-suit compares against the baseline of the branch's merge-base (capture via `pnpm ci:playwright:docker`, compare via `pnpm vrt:compare`). Unit/component tests should only assert behaviour (props, emits, rendered text/attributes) — never full markup.

Playwright E2E tests are in `src/app/tests/playwright/`. Visual regression captures run in Docker for reproducibility across OS environments (see `pnpm ci:playwright:docker`).

#### Visual regression: baselines live in Cloudflare R2, never in git

Baseline images are **not committed**. The Playwright specs (`components.spec.ts`, `pages.spec.ts`) only **capture** screenshots with `page.screenshot` into `visual-regression/actual/` (git-ignored); they never compare, and `toHaveScreenshot` must not come back. [reg-suit](https://github.com/reg-viz/reg-suit) does the comparing, configured in `regconfig.json`.

- **One environment.** Captures that count are made inside `mcr.microsoft.com/playwright:v1.60.0-jammy` (`pnpm ci:playwright:docker` locally, the `20-build-deploy-playwright.yml` job container in CI). Fonts and anti-aliasing differ per OS, so a capture made on a bare macOS host or in an agent sandbox is not trustworthy and must never be published.
- **Only CI publishes.** On every PR and every push to `main`, `pnpm vrt:ci` (`reg-suit run`) compares the capture against the screenshots published for the commit the branch forked from, publishes the branch's screenshots and an HTML report to the R2 bucket `bach-software-visual-regression`, and posts the status and report link on the PR. The `main` runs publish the baseline future branches compare against.
- **Approving the PR is approving the visual change.** An intended UI change needs no re-record step and no baseline commit: merging publishes the new screenshots as the baseline. A red visual check without an intended UI change is a real regression: fix the code, open the report before approving anything, and never hand-edit or delete captured images to silence it.
- **Local loop.** `pnpm ci:playwright:docker` captures, `pnpm vrt:compare` downloads the baseline and writes `.reg/index.html`. It needs read-only R2 credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) and `CLOUDFLARE_ACCOUNT_ID` in the environment; never use write credentials locally.
- **Data must be deterministic.** Pages render fixture data (the analytics endpoints are stubbed with constants), animations are disabled, fonts and images are awaited instead of sleeping, and legitimately dynamic elements are masked. Do not loosen `thresholdRate` to hide flakiness.

### Backend (.NET)

Clean architecture:
- `Bach.Software.Web` — ASP.NET Core minimal-API endpoints (`Endpoints/`) + DI setup.
- `Bach.Software.Application` — interfaces, models, validation (no infrastructure dependencies).
- `Bach.Software.Infrastructure` — Plausible Analytics integration.
- `Bach.Software.Core` — shared utilities.
- `Bach.Software.Tests` — xUnit tests.

Run backend tests: `dotnet test src/api/Bach.Software.sln`

### ESLint

Uses `@antfu/eslint-config` with `formatters: true` and `nuxt: true`. Key enforced rules:
- Semicolons required (`style/semi: error`).
- Vue props/event names in **camelCase** — NOT kebab-case (`vue/attribute-hyphenation: error`, `vue/v-on-event-hyphenation: error`).
- `src/api/**` and `src/app/services/backend/**` are excluded from linting.

### Deployment

- Frontend: Cloudflare Pages (`nitro preset: 'cloudflare-pages'`), with a Cloudflare D1 database bound as `DB`. Cache headers are in `route-rules.js`. Note: the CDN does not cache HTML (Cloudflare only caches by file extension), and that is intentional; prerendered pages are served as static assets at the edge instead, which is just as fast and always fresh after a deploy.

#### Static-vs-Worker routing on Cloudflare Pages (`_routes.json`)

Cloudflare Pages decides per URL whether to serve a static asset or invoke the Worker, based solely on the include/exclude rules in `dist/_routes.json`. There is no fallback: a URL not covered by an exclude rule always invokes the Worker, even when a prerendered file exists, and the Worker then re-renders the page with D1 queries on every request (roughly 400-700 ms instead of ~50 ms). Pages allows at most **100 rules total** and **100 characters per rule**. Nitro silently truncates its auto-generated list to fit the rule count (so pages can silently lose their static serving as the site grows) and does not check rule length at all (long blog post slugs produce rules that make wrangler reject the entire deployment).

Defenses in this repo:

- `nuxt.config.ts` (`nitro.cloudflare.pages.routes.exclude`) collapses whole directories into single wildcard rules (`/_ipx/*`, `/ico/*`, etc.) so all page routes fit.
- `scripts/verify-cf-routes.mjs` runs after every `pnpm build` / `pnpm generate`. It is a read-only verifier: it inspects `dist/_routes.json` and the prerendered output but never modifies the generated file. It **fails the build** when any rule exceeds 100 characters, when the total number of rules exceeds 100, or when a prerendered HTML page is not covered by an exclude rule. Over-long post URLs are the durable fix's responsibility, not the script's: shorten them by adding a `slug` field to the post's YAML frontmatter so the generated route stays under the 100-character limit. A warning about uncovered `_payload.json` files is acceptable (client-side navigation prefetches; they still work via the Worker).

**When `verify-cf-routes` fails**, in order of preference:

1. Add or widen wildcard rules in `nuxt.config.ts` for directories that contain no page routes (check the script output for which routes fell off; only use trailing-splat patterns like `/dir/*`).
2. Free up rule slots by reducing loose files in the build output root (each individual file costs one rule).
3. Structural fix when wildcards run out: migrate from Cloudflare Pages to a Cloudflare Worker with static assets (Nitro preset `cloudflare_module` with `assets` in `wrangler.toml`). Workers check the uploaded asset manifest first on every request and only invoke the Worker script when no asset matches, which is exactly the "prerendered first, Worker as fallback" model this site assumes; `_routes.json` and its 100-rule limit do not exist there. Caveat before migrating: the PR preview mechanism (`<N>-merge.bach-software.pages.dev` via `wrangler pages deploy --branch=<N>/merge`) is a Pages feature; Workers branch aliases were still "coming soon" as of mid-2026, so the preview workflow in `20-build-deploy-playwright.yml` needs rethinking as part of that migration.
- Backend: Docker image built and deployed to AKS via `40-build-deploy-aks.yml`; local configuration comes from `.env.local` (generated by `pnpm dev-setup`) and `appsettings.json`.
- CI/CD: GitHub Actions — `10-quality-assurance.yml` (lint, typecheck, unit tests, backend tests, danger, SonarQube, Trivy scan), `20-build-deploy-playwright.yml` (build + Playwright E2E), `40-build-deploy-aks.yml` (backend image build + AKS deploy).
