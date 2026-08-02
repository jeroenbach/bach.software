# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
pnpm install

# Setup local environment variables (interactive — creates .env.local and local.settings.json)
pnpm dev-setup

# Development
pnpm dev           # Frontend (also runs i18n-extract automatically)
pnpm dev:api       # Backend .NET Azure Functions (cd src/api/Bach.Software.API && dotnet watch start)

# Testing
pnpm test          # Vitest unit tests — watch mode
pnpm ci:test       # Vitest unit tests — single run
pnpm playwright    # E2E tests (Playwright)

# A single test file (examples):
TZ=Europe/Amsterdam npx vitest run src/app/composables/useStopWatch.test.ts
TZ=Europe/Amsterdam npx vitest run src/app/components/ResponsiveImage.test.nuxt.ts

# Code quality
pnpm lint          # ESLint
pnpm lint:fix      # ESLint with auto-fix
pnpm check         # Lint + typecheck

# Build
pnpm generate      # Static site generation (for production / Cloudflare Pages)
pnpm preview       # Preview generated site locally

# Storybook
pnpm storybook     # Start Storybook dev server on port 6006

# Screenshot / visual regression tests (requires Docker/colima on macOS)
pnpm playwright:docker             # Build the site, then run Playwright in Docker (matches CI environment)
pnpm playwright:docker:update      # Build the site, then update snapshots in Docker
pnpm ci:playwright:docker          # Run Playwright in Docker without building first (assumes an existing build)
pnpm ci:playwright:docker:update   # Update snapshots in Docker without building first
```

> **Important**: `pnpm dev` and `pnpm generate` both auto-run `i18n-extract` first. If translations are out of sync you'll see TypeScript errors — run `pnpm dev` once to re-sync.

## Writing Style

- **Never use em dashes (—)** in any text you write: content, copy, descriptions, PR text, etc. Rephrase the sentence or use a comma, colon, or parentheses instead.

## Workflow — Before Finishing Any Change

When completing any code change (feature, fix, refactor):

0. **Verify `node_modules` is actually installed before running any of the steps below** (e.g. `ls node_modules | head`) — don't assume it is. Fresh/sandboxed checkouts can start with an empty `node_modules`, and tools like bare `npx eslint`/`npx tsc` will then fail with confusing module-not-found errors (e.g. `Cannot find package '@antfu/eslint-config'`) that look unrelated to the real cause. If it's missing or empty, run `pnpm install` first.
1. **Run all pipeline checks locally** and fix every error before pushing:
   ```bash
   pnpm lint:fix       # must be clean (auto-fixes what it can)
   pnpm ci:typecheck   # must be clean
   pnpm ci:test        # must pass; coverage must not decrease vs. main
   pnpm playwright:docker   # builds the site, then runs E2E + visual regression tests in Docker (requires Docker/colima)
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

   **Always surface the Cloudflare Pages preview URL when you report a PR — not just the GitHub PR URL.** The URL is not posted as a commit status or bot comment; it is printed by the `Deploy Job` step of `20-build-deploy-playwright.yml` in the `cloudflare/wrangler-action` output (`✨ Deployment alias URL: ...`). Retrieve it from that job's logs once the Deploy Job succeeds. The deploy aliases PRs with `--branch=pr-<PR-number>`, so the **stable preview URL for a PR is `https://pr-<PR-number>.bach.software`** (e.g. PR #1 → `https://pr-1.bach.software`). It always points at the latest deploy of that PR. Include this URL in your reply to the user and in the PR description, and when a change touches specific pages, link directly to them on the preview host (e.g. `.../products`).

## Remembering Instructions

Whenever the user says "remember this" (or similar) about an instruction or preference, add it to this CLAUDE.md file in the appropriate section (create one if needed). Keep CLAUDE.md as one single file — do not split it into partials.

## Interactive vs Autonomous Sessions

- **Working together (interactive session)**: only make the changes — do **not** commit or push; the user handles git themselves.
- **Working autonomously (e.g. GitHub Actions, scheduled agents, or when explicitly asked to finish a task end-to-end)**: follow the full workflow above, including commits, screenshots, and the PR.

## Architecture

This is a hybrid static site with two independent layers:

- **Frontend** (`src/app/`) — Nuxt 4 + Vue 3 + TypeScript, statically generated and deployed to Cloudflare Pages.
- **Backend** (`src/api/`) — .NET 9 Azure Functions, deployed separately as a serverless API.

The frontend communicates with the backend via `NUXT_PUBLIC_API_BASE` (defaults to `http://localhost:7071` in dev). The backend client in `src/app/services/backend/` is generated by [Kiota](https://learn.microsoft.com/en-us/openapi/kiota) from the OpenAPI spec — regenerate it with `kiota generate` when the API changes (see `src/app/services/backend/README.md`).

### Routing

There are only two page files that handle all content:

- `src/app/pages/[[segment1]]/[id]-[[slug]].vue` — resolves both blog posts and pages using `postsPaths`/`pagesPaths` maps from `locales.config.ts`.
- `src/app/pages/[...pathSegments].vue` — catch-all, handles lists and other routes.

The `segment1` part of the URL (`/posts/`, `/articles/`, `/content/`, etc.) is locale-specific and defined in `locales.config.ts`. The router uses it to distinguish between a post and a page.

### Internationalisation (i18n)

Five locales: `en` (default/catchall), `fr`, `nl`, `de`, `es`. Strategy is `prefix_except_default` — English URLs have no prefix, others have `/fr/`, `/nl/`, etc.

Content is duplicated per locale in `src/app/content/{locale}/`. Nuxt Content collections are generated dynamically in `content.config.ts` as `posts_{locale}`, `pages_{locale}`, and `authors_{locale}`. Always use the locale-specific collection name (e.g. `queryCollection('posts_en')`).

i18n translation keys live in `src/app/locales/*.json`. Run `pnpm i18n-extract` (or just `pnpm dev`) to add/remove keys automatically after adding `$t('key')` calls.

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

Alternate URLs across locales are derived at build-time via the `/api/content-urls` server route and cached with `useAsyncData('content-urls', ...)`.

### Testing

Two Vitest project configurations in `vitest.config.ts`:

- **`unit`** (`happy-dom`) — for components, composables, and utils. Test files: `*.test.ts` / `*.spec.ts`.
- **`nuxt`** (full Nuxt environment via `@nuxt/test-utils`) — for anything that needs Nuxt runtime (routing, i18n, `useHead`, etc.). Test files must end in `*.nuxt.test.ts` / `*.nuxt.spec.ts`.

Always use `TZ=Europe/Amsterdam` when running tests (dates are timezone-sensitive). This is baked into the `pnpm test` and `pnpm ci:test` scripts.

Playwright E2E tests are in `src/app/tests/playwright/`. Visual snapshot tests use Docker for reproducibility across OS environments (see `pnpm ci:playwright:docker`).

### Backend (.NET)

Clean architecture:
- `Bach.Software.API` — Azure Functions entry points + DI setup.
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

- Frontend: Cloudflare Pages (`nitro preset: 'cloudflare-pages'`), with a Cloudflare D1 database bound as `DB`. Cache rules are in `route-rules.js`: CDN caches for 24 h, browsers always revalidate.
- Backend: Azure Functions, configured via `local.settings.json` (generated by `pnpm dev-setup`).
- CI/CD: GitHub Actions — `10-quality-assurance.yml` (lint, typecheck, unit tests, backend tests, Trivy scan), `20-build-deploy-playwright.yml` (build + Playwright E2E).
