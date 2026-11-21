---
id: ST-09
type: story
feature: FEAT-001
status: done
approved_by: "auto (delegated by feature approval)"
pr: ""
---

# Story: data-testid naming convention, rollout and lint (FE-07)

## Decided without the maintainer (research)

Settled from research during story prep, not reviewed by the maintainer. Override any of these freely.

- Finding 1 (AC5) → lint accepts the row-container exception `<context>-row-<key>` alongside the three-part form
- Finding 2 (edge case 3) → in a `v-for` the key goes on the container id or per-instance `baseDataTestid`, never on each inner control
- Finding 3 (AC4) → every pre-existing non-conforming id is renamed (AuthorInformation's four, the `.storybook` and page-test leftovers), not only MessageBar's
- Finding 4 (AC2) → rollout stays scoped to the components the Playwright specs and component tests need; PROJECT.md records the full coverage rule verbatim, lint enforces shape going forward (feature scope, not a variant)
- Finding 5 (AC3) → selector conversion stays scoped to `src/app/tests/playwright/`; component tests and the head/XML metadata selectors stay as-is (feature scope)

## Functional
### User story
As Jeroen (the maintainer), I want one data-testid convention that the E2E specs and lint both follow, so that tests select elements through stable, predictable ids instead of text, CSS classes or DOM position, and new ids cannot drift from the convention.

### Acceptance criteria
1. Given `specs/PROJECT.md`, then it records the FE-07 convention exactly as the pack standard (`/Users/jeroenbach/Source/claude-plugins/plugins/spec/standards/vue/FE-07 data-testid naming and usage.md`) defines it: attribute `data-testid`, lowercase kebab-case `<context>-<purpose>-<elementtype>`, the standard's fixed elementtype list, the coverage rules (interactive elements, test scopes, asserted values; no blanket tagging), scoped uniqueness, and the `baseDataTestid` prop pattern defaulting to the component's own kebab-case name. No custom variant is introduced (decision 4).
2. Given reusable components that the Playwright specs or component tests need to target, then each exposes a `baseDataTestid` prop defaulting to its own kebab-case name and derives its inner ids from it, so a page can scope ids per use; Vue props stay camelCase per the project rule.

   > **PROPOSED (adversarial review, finding 4) — rollout breadth.** The standard's coverage rule is "add one to every interactive element" and decision 4 says to follow the coverage rules exactly; AC1 records that rule verbatim into `specs/PROJECT.md`. But AC2 and edge case 1 roll ids out only to the test-needed subset (`ColorModeSwitcher`, `MessageBar`, `MessageBarOutlet`, `AuthorInformation`), leaving other interactive elements untagged (header nav links, `LanguageSwitcher`, `SearchButton`, `SearchModal`, `ShareOn`, `BlogPostPagination`, `BlogPostFilter`, `TableOfContents`, `CodeGroup`, `PageReadProgress`). The lint enforces id *shape*, not *presence*, so a partial rollout stays lint-clean. Proposed resolution: either tag every interactive element per the standard's coverage rule, or keep the rollout scoped and record it explicitly.

   DECIDED (research): the rollout stays scoped to the reusable components the Playwright specs and component tests need (`ColorModeSwitcher`, `MessageBar`, `MessageBarOutlet`, `AuthorInformation`, plus any component whose id a converted selector needs) together with every pre-existing non-conforming id (AC4). The remaining interactive elements (header nav links, `LanguageSwitcher`, `SearchButton`, `SearchModal`, `ShareOn`, `BlogPostPagination`, `BlogPostFilter`, `TableOfContents`, `CodeGroup`, `PageReadProgress`) stay untagged in this story. This records no variant: `specs/PROJECT.md` still carries the standard's coverage rule verbatim (AC1), and the lint enforces id shape going forward.
   Why: the approved feature spec scopes area 7 to "roll it through the existing Playwright specs (`src/app/tests/playwright/`)" plus the reusable components, with the lint enforcing the convention "going forward" (FEAT-001 Scope area 8, Architecture area 7). It does not ask one story to retroactively tag every interactive element in the app, and the standard itself warns against blanket-tagging ("Blanket-tagging every element in the template produces ids nobody maintains ... is what eventually discredits the pattern"). Decision 4 governs the shape of the recorded convention, not a one-story full-app sweep, so following the feature's scope is not a narrowed coverage policy recorded as a variant.
   Sources: FEAT-001 Scope area 8 and Architecture area 7 (rollout scoped to the Playwright specs and reusable components); FE-07 standard, Coverage section; decision 4.
3. Given the existing specs in `src/app/tests/playwright/` (`components.spec.ts`, `pages.spec.ts`, `metadata.spec.ts`, `open-graph-protocol.spec.ts`, `sitemap.xml.spec.ts`, `playwright-fixtures.ts`), then every selector that targets interactive elements, test scopes or asserted values uses `getByTestId(...)` with a convention-conformant id, and no spec relies on a CSS class or text selector where a test id is required by the coverage rules.

   > **PROPOSED (adversarial review, finding 5) — component-test selectors.** The standard's "In tests" rule is unqualified: "Selecting by CSS class, visible text content or DOM position is not permitted" in any test, and decision 4 says follow it exactly. AC3 scopes the conversion to `src/app/tests/playwright/` only, leaving the component tests that select by tag/class/text/position (`SearchModal`, `LikeButton`, `CurriculumVitaeTable`, `TableOfContents`, `BlogPostPagination`, `AppHeader`, `SearchButton`, `BlogPost`, per the QA plan) unconverted. Proposed resolution: either extend AC3 to cover the component tests, or record the deferral explicitly. (The `<head>`/JSON-LD/sitemap-XML selectors in `metadata.spec.ts`, `open-graph-protocol.spec.ts`, `sitemap.xml.spec.ts` are correctly exempt: they are document metadata, not component template output.)

   DECIDED (research): AC3's selector conversion stays scoped to `src/app/tests/playwright/`, as the approved feature spec defines the rollout. The component tests that select by tag/class/text/position (`SearchModal`, `LikeButton`, `CurriculumVitaeTable`, `TableOfContents`, `BlogPostPagination`, `AppHeader`, `SearchButton`, `BlogPost`) are not converted in this story and stay listed under "Knowingly left uncovered or unconverted". The `<head>`/JSON-LD/sitemap-XML selectors in `metadata.spec.ts`, `open-graph-protocol.spec.ts` and `sitemap.xml.spec.ts` remain exempt: they target document metadata, not component template output, so the standard's "in tests" rule does not reach them.
   Why: the approved feature spec scopes area 7's test conversion to "the existing Playwright specs (`src/app/tests/playwright/`)" (FEAT-001 Scope area 8, Architecture area 7). Converting every component test would first require tagging the elements those tests touch, i.e. the full-app rollout the feature did not include (see finding 4), which is too large for one reviewable story. The feature's scope, not taste, settles this.
   Sources: FEAT-001 Scope area 8 and Architecture area 7; FE-07 standard, "In tests" and Coverage sections.
4. Given the current tree, then every pre-existing `data-testid` that does not follow the convention is renamed and its test selectors updated: `MessageBar`'s reference ids (`message-bar`, `message-bar-close`, `message-bar-content`, added in ST-05) become the convention form (for example `message-bar-close-button`), `AuthorInformation.vue`'s four ids (`author-information`, `author-name`, `author-url`, `author-role`, none ending in a permitted elementtype) are renamed, and the non-`.vue` leftovers (`component-story-wrapper` in `.storybook/preview.ts` and the stubs `blog-post`, `like-button`, `blog-posts` in the two nuxt page tests) are renamed. Any id left over from retired components no longer exists, and a repo-wide scan (`rg -o 'data-testid[^>]*' src/app`) finds no non-conforming id.

   > **PROPOSED (adversarial review, finding 3).** AC4 names only MessageBar, but the real tree already carries non-conforming ids beyond it: `AuthorInformation.vue` has `author-information`, `author-name`, `author-url`, `author-role` (none ends in a permitted elementtype, verified in the component), plus the non-`.vue` leftovers `component-story-wrapper` in `.storybook/preview.ts` and the stubs `blog-post`, `like-button`, `blog-posts` in the two nuxt page tests. AC7 requires `pnpm lint:fix` clean on the real tree, which the `.vue` ids cannot satisfy until renamed, so AC4 as scoped is internally inconsistent with AC7. Rewrite: "every pre-existing `data-testid` that does not follow the convention is renamed, including `AuthorInformation`'s four ids and the non-`.vue` leftovers (`.storybook/preview.ts` and the two page-test stubs), and their test selectors are updated; a repo-wide scan (`rg -o 'data-testid[^>]*' src/app`) finds no non-conforming id."

   DECIDED (research): adopt the broadened AC4 above. AuthorInformation's four ids and the non-`.vue` leftovers are renamed, not only MessageBar's.
   Why: AC7 requires `pnpm lint:fix` clean on the real tree, and the lint (AC5) rejects ids that do not end in a permitted elementtype, so AuthorInformation's four `.vue` ids cannot pass until renamed; the narrow AC4 was internally inconsistent with AC7. The FE-07 standard governs every id in the tree, not only MessageBar's.
   Sources: FE-07 standard (Pattern, Formatting, Coverage); this story's AC5 and AC7; AuthorInformation.vue's four ids and the non-`.vue` leftovers verified in the tree (QA plan "Facts from the current tree").
5. Given `eslint.config.js`, then a lint selector enforces the convention on `data-testid` attributes in `.vue` templates, accepting (a) static ids of shape `<context>-<purpose>-<elementtype>` ending in a permitted elementtype and (b) the row-container exception where the id is `<context>-row-<key>` (static, e.g. `reports-row-a3f9`, or a template literal whose static part ends in `-<elementtype>-` followed by the key expression, e.g. `` `${baseDataTestid}-row-${key}` ``); controls and values inside a row keep the plain `...-<elementtype>` form. A throwaway element with `data-testid="BadName"` or a non-conforming shape is reported by `pnpm lint`, while the real tree is clean under `pnpm lint:fix`.

   > **PROPOSED (adversarial review, finding 1).** "Ending in a permitted elementtype" rejects the standard's own documented row-container form `<context>-row-<key>` (`reports-row-a3f9`), where the elementtype `row` is in the middle and the key is last, and it contradicts this story's own lint-matrix which accepts `reports-row-a3f9` and `` `${baseDataTestid}-row-${key}` ``. Decision 4 forbids a custom variant, so the AC must match the standard. Rewrite: the lint accepts (a) static ids of shape `<context>-<purpose>-<elementtype>` ending in a permitted type, and (b) the row-container exception: an id whose shape is `<context>-row-<key>` (static or a template literal whose static part is `...-<elementtype>-` followed by the key expression). Controls and values inside a row keep the plain `...-<elementtype>` form.

   DECIDED (research): adopt the rewritten AC5 above. The lint accepts the three-part form and the `<context>-row-<key>` row-container exception (static and the `` `${baseDataTestid}-row-${key}` `` template-literal form); inner controls keep the plain `...-<elementtype>` form.
   Why: the FE-07 standard documents the row container as `<context>-row-<key>` with the key last ("the container id is `<context>-row-<key>` ... the key is the final part"), so a lint that insists every id end in a permitted elementtype would reject the standard's own form and contradict this story's lint matrix. Decision 4 says follow the standard exactly and forbids a custom variant.
   Sources: FE-07 standard, "Repeated rows and list items" exception (`reports-row-a3f9`); decision 4; this story's lint matrix in the QA plan.
6. Given duplicate ids within one scope, then the convention's scoped-uniqueness rule is demonstrated: two instances of a reusable component on one page are distinguishable through different `baseDataTestid` values in a test.
7. Given `pnpm lint:fix`, `pnpm ci:typecheck`, `pnpm ci:test` and `pnpm playwright:docker`, then all pass; adding attributes does not change any rendered pixel, so no visual baseline changes.
8. Given `specs/enforcement.md` and `CLAUDE.md`, then the FE-07 row moves off Review only/Open and CLAUDE.md links the convention to `specs/PROJECT.md`.

### Edge cases
- Ids must not be added blanket-style to every element; only what the coverage rules require (a lint rule that bans non-conforming ids does not require ids everywhere).
- Re-verify the component list against the then-current tree (retired components are gone, MessageBar exists, SearchModal/SearchButton interfaces settled by ST-08).
- In a `v-for`, put the key on the container id (`<context>-row-<key>`) or on the per-instance `baseDataTestid`, never on each inner control's purpose part; tests scope through the container. Suffix the element itself with the key only in the rare case where there is no container to carry an id. Scoped uniqueness holds under this reading.

  > **PROPOSED (adversarial review, finding 2).** This contradicts the standard, which says the opposite: "Controls and values inside the row keep the plain three-part id. Never suffix them." The key goes on the row container (`<context>-row-<key>`) or, for a repeated reusable component, on its per-instance `baseDataTestid` (the standard's `welcome-card`/`news-card` override pattern), never on each inner control's purpose part. Decision 4 requires following the standard exactly. Rewrite: "in a `v-for`, put the key on the container id or on the per-instance `baseDataTestid`, never on each inner control; tests scope through the container. Suffix the element itself with the key only in the rare case where there is no container to carry an id." Scoped uniqueness holds under this reading.

  DECIDED (research): adopt the rewritten edge case above. The key goes on the container id or the per-instance `baseDataTestid`, never on each inner control's purpose part.
  Why: the FE-07 standard states the exact inverse of the original edge case ("Controls and values inside the row keep the plain three-part id. Never suffix them."), putting the key on the row container or, for a repeated reusable component, on its per-instance `baseDataTestid`. Decision 4 says follow the standard exactly.
  Sources: FE-07 standard, "Repeated rows and list items" and "Reusable components" (`welcome-card`/`news-card`); decision 4.
- Storybook-rendered components keep working with the default `baseDataTestid`.

### Out of scope
- Rewriting test logic beyond swapping selectors; adding new test scenarios.
- Changing visual baselines or capture mechanics (ST-10).

## Design reference
No visual change.

## Architecture reference
Implements area 7 (FE-07), decision 4, and the data-testid note in Public surface impact. Files and areas: `specs/PROJECT.md` (convention), the reusable components under `src/app/components/` that need ids, `src/app/components/MessageBar.vue` (and tests), `src/app/tests/playwright/*.ts`, `eslint.config.js`, `CLAUDE.md`, `specs/enforcement.md`, and `specs/components.md` only if a component's props gain `baseDataTestid` (record it in the affected entries).

Dependencies: ST-06 (retired components gone, MessageBar settled), ST-05 (MessageBar exists), ST-08 (component interfaces final). Sequenced before ST-10 so the capture rewrite in ST-10 operates on already converted specs. No release bookkeeping.

## QA plan

Planned against the tree as read at QA time (ST-01 to ST-08 not yet applied: `AlertBar`/`NotificationMessage` still exist, `MessageBar` does not, `SearchModal`/`SearchButton` still have their old interfaces). The developer re-verifies every file named here against the then-current tree (edge case 2). Test names follow the repo style: `describe('<componentInCamelCase>')` with `it('should ...')`, never mentioning specs, stories or ACs (CLAUDE.md).

### Facts from the current tree that shape the plan

- Pre-existing ids do exist, contrary to the feature spec's Public surface note ("no pre-existing ids break"). In `src/app/components/AuthorInformation.vue`: `author-information`, `author-name`, `author-url`, `author-role` (no permitted elementtype, so the new lint will fail on the real tree until renamed; AC4 names only MessageBar). In non-`.vue` files the lint does not see: `component-story-wrapper` (`src/app/.storybook/preview.ts`, no consumer found), and the stubs `blog-post`, `like-button`, `blog-posts` plus their `find('[data-testid="..."]')` calls in `src/app/tests/nuxt/idSlugPage.nuxt.test.ts` and `pathSegmentsPage.nuxt.test.ts`.
- The only element-targeting selector in `src/app/tests/playwright/` is `page.getByTitle('Switch color mode').first()` in `pages.spec.ts`. `components.spec.ts` and `playwright-fixtures.ts` have no element selectors (they build story URLs and screenshot). `metadata.spec.ts` and `open-graph-protocol.spec.ts` query `<head>` (`script[type="application/ld+json"]`, `link[rel=...]`, `meta[...]`); `sitemap.xml.spec.ts` matches raw XML text. None is an interactive element, test scope or rendered value, and none is a class/text/position selector.
- `ColorModeSwitcher`'s button sits inside `<ClientOnly>`; the `pages.spec.ts` wait relies on it appearing only after hydration. The id must therefore be on the inner `AppButton`, not on the SSR-rendered wrapper `div`, or the hydration wait (and the screenshots behind it) changes meaning.
- `title="Switch color mode"` is translated by ST-08 (FE-08). After that, `getByTitle('Switch color mode')` can no longer match on the `nl` and `de` page tests (`about-page-nl`, `about-page-de`). Converting the wait to a test id removes the dependency on copy; the developer confirms at the start whether ST-08 already patched it.
- `AppHeader` renders `SearchButton` through the `searchButton` slot twice (desktop nav and mobile bar, both always in the DOM, one CSS-hidden), and `LanguageSwitcher`/`ColorModeSwitcher` once in the nav and once in the mobile `Dialog`. The Headless UI `Dialog` renders into `document.body`, outside a VTU wrapper. Duplicate default ids inside one page scope are therefore a live risk, not a theoretical one.
- `playwright.config.ts` does not set `testIdAttribute` (default `data-testid`, as the standard requires). The Vitest `unit` project only includes `components/`, `composables/`, `contexts/`, `utils/`; `tests/nuxt/` is included in the `nuxt` project only.

### Decisions carried into this plan (settled during story prep; see the DECIDED blocks on the ACs)

1. **AC5 row exception: settled.** The standard's repeated-rows form is `<context>-row-<key>` (`reports-row-a3f9`): the elementtype is in the middle and the key is last, so a lint that requires every id to end in a permitted elementtype would reject it. AC5 now accepts (a) `<context>-<purpose>-<elementtype>` ending in a permitted type, and (b) the row-container exception, static and the `` `${baseDataTestid}-row-${key}` `` template-literal form. Decided by the standard plus decision 4 (DECIDED block on AC5).
2. **`v-for` key placement: settled.** The standard says controls in a repeated structure keep the plain id and the container carries `<context>-row-<key>` (tests scope through the container); a per-instance `baseDataTestid` that contains the key, as `MessageBarOutlet` needs, is allowed by the standard's reusable-component section. Edge case 3 now matches. The plan asserts uniqueness within the scope, which holds under this reading. Decided by the standard plus decision 4 (DECIDED block on edge case 3).
3. **Rollout breadth: settled (scoped).** Required set = `ColorModeSwitcher`, `MessageBar`, `MessageBarOutlet`, `AuthorInformation`, plus any component whose id a converted selector needs, plus the pre-existing non-conforming ids (AC4). The remaining interactive elements (header navigation links, `LanguageSwitcher`, `SearchButton`, `SearchModal`, `ShareOn`, `BlogPostPagination`, `BlogPostFilter`, `TableOfContents`, `CodeGroup`, `PageReadProgress`) stay untagged in this story. This is the feature's own rollout scope (FEAT-001 Scope area 8, Architecture area 7), not a variant in `specs/PROJECT.md`; the lint enforces id shape going forward. Decided by the approved feature spec (DECIDED block on AC2).
4. **Component tests left unconverted: settled.** `SearchModal`, `LikeButton`, `CurriculumVitaeTable`, `TableOfContents`, `BlogPostPagination`, `AppHeader`, `SearchButton`, `BlogPost` select by tag/class/text/position; AC3's conversion is scoped to `src/app/tests/playwright/` per the feature. They stay unchanged and listed under "knowingly left" below. Decided by the approved feature spec (DECIDED block on AC3).
5. **AC3 wording and head metadata: settled.** "Every selector that targets interactive elements, test scopes or asserted values" excludes document metadata (`<head>` tags, JSON-LD scripts, raw sitemap XML), which are not component template output; `metadata.spec.ts`, `open-graph-protocol.spec.ts` and `sitemap.xml.spec.ts` are exempt. No exemption text goes into `specs/PROJECT.md` (decision 4: no variant). Decided by the standard and the feature (DECIDED block on AC3).
6. **AC4 breadth: settled.** Every pre-existing `data-testid` that does not follow the convention is renamed, including `AuthorInformation`'s four ids and the non-`.vue` leftovers (`preview.ts`, the two page-test stubs); a repo-wide scan finds no non-conforming id. Decided by the standard plus AC7's lint-clean gate (DECIDED block on AC4).
7. **Lint minimum shape — developer's call, recorded in Implementation notes.** The plan assumes two segments minimum (context plus elementtype, e.g. `like-button` accepted, bare `button` rejected); the three-part ideal stays a review judgment. Also proposed (not in AC5): report the variant attributes the standard forbids (`data-test`, `data-cy`, `data-qa`). Both are decisions the developer records in Implementation notes.

### Acceptance criterion to test mapping

| AC | Test or check | Kind |
|---|---|---|
| 1 | Checklist review of `specs/PROJECT.md` against the pack standard (attribute `data-testid`; `<context>-<purpose>-<elementtype>`; all 13 element types: button, input, link, checkbox, radio, select, table, icon, value, row, card, panel, modal; coverage do/do-not rules; scoped uniqueness; `baseDataTestid` defaulting to the kebab-case component name; production attributes kept; no custom variant). Scripted aid: `rg -c` for each of the 13 type words inside the new section, and `rg 'data-test\b\|data-cy\|data-qa'` finds no recommendation of a variant | Manual review plus scripted check |
| 2 | Per reusable component in the required set, in its `.nuxt.test.ts`: `should use the kebab-case component name as the default id base`, `should derive every inner id from baseDataTestid when overridden`, `should leave no id with the default base after an override`. Uses the new helper below | Component |
| 3 | (a) Scripted scan: `rg -n "getByTitle\|getByText\|getByRole\|getByLabel\|getByPlaceholder\|getByAltText\|\.nth\(\|\.first\(\)\|\.last\(\)\|locator\('[.#]" src/app/tests/playwright/*.ts` returns nothing outside the three exempt specs (Flag 5). (b) The `pages.spec.ts` wait uses `getByTestId` with the color mode switcher id and still waits with `state: 'attached'`. (c) `pnpm playwright:docker` green | Scripted check plus E2E |
| 4 | `MessageBar` component test (see below) asserts the renamed ids exist and the three reference ids (`message-bar`, `message-bar-close`, `message-bar-content`) do not. Repo scan: `rg -o "data-testid[^>]*" src/app` listed and every value checked against the convention (covers `AuthorInformation`, `preview.ts`, stubs; Flag 6). `rg "NotificationMessage\|AlertBar\|NotificationContainer" src/app` returns nothing id-related | Component plus scripted check |
| 5 | Lint matrix test (below), with the manual CLI fallback; real tree clean under `pnpm lint:fix` and `git diff` shows `lint:fix` changed no id | Unit (node env) plus lint gate |
| 6 | `colorModeSwitcher › should keep two instances distinguishable through different bases` and, in `AppHeader.nuxt.test.ts`, `should expose desktop and mobile menu switchers under different ids` (menu opened, query through `document.body`) | Component |
| 7 | Gates below; `git status` after `pnpm playwright:docker` shows no modified or new file under `src/app/tests/playwright/*-snapshots/` | Gates |
| 8 | `rg "FE-07" specs/enforcement.md` shows a row that is neither `Open` nor `Review only`; `rg "specs/PROJECT.md" CLAUDE.md` finds the convention link; link target section exists | Scripted check |

### Test detail

**New test utility** `src/app/tests/support/dataTestid.ts` (location to align with where ST-08 puts builders): `collectTestIds(root: Element): string[]` (the root's own id plus all descendants, searching `document.body` when a component teleports), `permittedElementTypes` (the 13 types, the single list the tests share), `expectConventionalTestIds(ids, base?)` (lowercase kebab-case, last word permitted unless the id is a `-row-<key>` container, all start with `base-` when given), `expectUniqueWithinScope(scope: Element)` (no id repeated inside one scope). Existing fixtures reused: `mountSuspended`/`mount`, the story args pattern from `LikeButton.nuxt.test.ts`, `playwright-fixtures.ts` unchanged.

**`MessageBar.nuxt.test.ts` (extends the file added by the error-surfacing story):**
- `should expose the close button under the convention id` (`message-bar-close-button`, or the developer's chosen conformant form; the assertion states the final names).
- `should not expose the retired reference ids`.
- `should derive its ids from a custom baseDataTestid`.
- `should still emit close when the renamed close button is clicked`.
- `MessageBarOutlet`: `should give two simultaneous messages distinct ids` (add two messages, run `expectUniqueWithinScope` on the outlet) and `should dismiss only the message whose close button was clicked`. These cover the `v-for` edge case.

**`ColorModeSwitcher.nuxt.test.ts` (new file; component has no test today):**
- `should render the toggle button with the default id` after `ClientOnly` has resolved (await mount and flush), asserting the id is on the `<button>`, not on the wrapper `div`.
- `should emit the next color mode when the toggle button is found by id` (system to dark, dark to light, light to system).
- `should keep two instances distinguishable through different bases` (wrapper template with two instances, click the second by its id, only that instance's handler fires).

**`AuthorInformation.nuxt.test.ts` (new file):** conformant ids for container, name link, LinkedIn link and role value; overriding the base renames all four; with `fullName` unset or `linkedIn` unset the corresponding id is absent; a list of two instances with different bases passes `expectUniqueWithinScope`. Plus, in `BlogPostSummary` or its page test if one exists, that a list of summaries does not render duplicate author ids in one scope (Flag 2).

**`AppHeader.nuxt.test.ts` (existing, only if AppHeader overrides bases):** the AC6 test above; the three existing text-based tests stay untouched (Flag 4).

**Lint matrix `src/app/tests/lint/dataTestidLint.test.ts`** (`// @vitest-environment node`, ESLint Node API `lintText` with `filePath` under a real folder so the project config applies; needs `src/app/tests/lint/**/*.test.ts` added to the `unit` project include in `vitest.config.ts`, a file the Architecture reference does not list, so the developer records it as an addition). Cases:
- Accepted: `color-mode-switcher-toggle-button`, `search-keyword-input`, `side-menu-import-link`, `order-details-select-all-checkbox`, `user-profile-country-select`, `order-details-deadline-value`, one id per remaining permitted type (iterate `permittedElementTypes` so list drift between helper and lint fails), `reports-row-a3f9`, `` :data-testid="`${baseDataTestid}-close-button`" ``, `` :data-testid="`${baseDataTestid}-row-${key}`" ``, `like-button`.
- Rejected, each reported by `vue/no-restricted-syntax` with a message that names `data-testid`: `BadName`, `bad_name-button`, `userProfileSubmit`, `btn-navbar-save`, `navbar-save-btn`, `order-details-export` (no type), `Order-Details-Export-Button`, `order details-button`, `export-button-` (trailing hyphen), `button` (no context), empty value, valueless attribute, `` `${base}-export` `` (dynamic, no type).
- Where the rule applies: the same bad element reported when the file is under `src/app/components/`, `src/app/pages/`, `src/app/contexts/`, `src/app/layouts/`, `src/app/.storybook/mocks/` and `src/app/examples/` (guards against a later flat-config block redefining `vue/no-restricted-syntax`, which replaces rather than merges).
- Existing rules intact: in the same lint run, `style="color:red"` and `:style="x"` are still reported (FE-09 selectors were not displaced by the new array entry), and `data-testid` is not flagged by `vue/attribute-hyphenation`.
- Not covered by the lint, by design: `.ts` story render templates, test stubs, `h()` render functions. Covered instead by the repo scan under AC4.
- Manual fallback if the ESLint-in-Vitest setup proves unworkable: `printf '<template><div data-testid="BadName" /></template>' | pnpm exec eslint --stdin --stdin-filename src/app/components/Throwaway.vue` must exit non-zero, and the same with `color-mode-switcher-toggle-button` must exit zero; record the run in Implementation notes.

**Existing nuxt page tests (`idSlugPage`, `pathSegmentsPage`):** stub ids renamed to conformant values and the `find('[data-testid="..."]')` calls updated; the tests must pass unchanged in behaviour (Flag 6).

### UI states

No new UI states and no visual change. The states the id work touches must still render with default ids in Storybook: `ColorModeSwitcher` (system, light, dark icons), `LikeButton` default and liked (untouched, regression guard), and `MessageBar` once ST-11 adds its stories (default base). Empty/error/loading states belong to other slices; this slice adds attributes only.

### Stack-specific regression classes

- Reactivity and render counts: the `baseDataTestid` default is a destructured prop default (FE-11 lint form, no `withDefaults`); the test overriding the base after mount (`setProps`) asserts ids update, guarding against a non-reactive capture of the default.
- Attribute fallthrough: components with a fragment or `Teleport` root must not rely on `data-testid` fallthrough (Vue warns). The component tests spy on `console.warn` for the multi-root components that gain ids and assert no "Extraneous non-props attributes" warning.
- Async/hydration: the `ClientOnly` placement above, covered by the component test and by the three `pages.spec.ts` projects staying green.
- Teleported content: `Dialog`, `MessageBar` teleport and `MessageBarOutlet` render outside the wrapper; tests query through `document.body`.

### Environment quirks

`TZ=Europe/Amsterdam` is baked into `pnpm test`/`pnpm ci:test`; for a single file use `TZ=Europe/Amsterdam npx vitest run <file>`. `pnpm playwright:docker` needs Docker/colima and must never be run with an update flag or by hand-editing baselines. `vitest.config.ts` thresholds use `autoUpdate: true`, so check `git diff vitest.config.ts` after `pnpm ci:test` and keep only the intended include addition. `.claude/hooks/block-snapshot-image-edits.sh` stays active.

### Coverage

Gate: not below the baseline (`pnpm ci:test` coverage output, Codecov on the PR). New default-valued props add branches; each is hit by the default-base and override tests above. Knowingly outside coverage (not in the `include` list): `eslint.config.js`, `src/app/tests/support/dataTestid.ts`, the lint matrix test, `playwright/*.ts`, `.storybook/preview.ts`. The existing components that stay untagged (Flag 3) are unchanged, so their coverage does not move.

### Regression risk

- `pages.spec.ts` (every page and language project): the wait selector changes. Guarded by the full Playwright run; a throwaway local spec (not committed) that loads `/`, `/nl/content/30-over` and `/de/content/30-uber-mich` and asserts the new id is attached is a fast pre-check outside Docker.
- `AuthorInformation` consumers `BlogPost` and `BlogPostSummary` (stories `blogpost--default`, list pages): renamed ids must not leave a duplicate in one scope; baselines `blogpost--default-*` must stay byte-identical.
- `AppHeader.nuxt.test.ts` and `AppHeaderContext.nuxt.test.ts`: both changed by ST-06 and ST-08; the AC6 additions must be written against the final prop and slot surface, including the doubled `searchButton` slot.
- `idSlugPage` and `pathSegmentsPage` nuxt tests: stub rename only.
- Other stories of this feature: ST-10 rewrites the capture helper in `pages.spec.ts` and must keep the id-based hydration wait; ST-11 stories render components with default bases and need no args; ST-07 and others also edit `eslint.config.js`, so the lint matrix test is the guard against a clobbered selector array.
- Existing guards: the component and page tests above, `components.spec.ts` and `pages.spec.ts` visual tests, `pnpm lint:fix`, `pnpm ci:typecheck` (prop types, `components.md` has no typecheck).

### Quality gates for this story

`pnpm lint:fix` clean (real tree has no non-conforming id), `pnpm ci:typecheck` clean, `pnpm ci:test` passes with coverage not decreased, `pnpm playwright:docker` passes with no baseline file changed, `dotnet test` not required (no `src/api/` change). Doc deliverables: `specs/PROJECT.md` (convention), `CLAUDE.md` (link to it, no spec ids), `specs/enforcement.md` (FE-07 row, plus a note that lint covers shape only and coverage stays review), `specs/components.md` (every component that gains `baseDataTestid`; scripted check: `rg -l baseDataTestid src/app/components` equals the set of entries in `specs/components.md` that mention it).

### Manual verification checklist (not automatable)

1. Review `specs/PROJECT.md` section against the pack standard line by line (AC1).
2. On `https://pr-<PR-number>.bach.software`, open devtools and confirm `[data-testid]` attributes are present in the production build on the header switcher and on a post page (AuthorInformation), i.e. nothing strips them.
3. On the preview, open the mobile menu at a narrow width and confirm the mobile switchers carry ids different from the desktop ones (`document.querySelectorAll('[data-testid]')`, no duplicates inside the dialog).
4. Header, a post page and the about page in light and dark mode look identical to `main` (no visual change expected; the baselines are the real check).
5. Storybook (`pnpm storybook`): `ColorModeSwitcher`, `LikeButton`, `AuthorInformation`-using stories render with default ids.

### Knowingly left uncovered or unconverted

Component tests that select by tag, class, text or position (Flag 4); interactive elements without ids (Flag 3); `.ts` story/stub templates beyond the renames above; the `<head>`/XML specs (Flag 5); any id whose dynamic expression the lint cannot statically analyse (a bare identifier binding is neither accepted nor rejected by shape, and is left to review).

## Adversarial review

STORY mode (lite): blockers and consistency with the approved feature design (decision 4 binding: follow FE-07 exactly). ACs are testable and mapped in the QA plan, and the ST-05/ST-06/ST-08 dependencies are explicit. Findings below are routed as `PROPOSED (adversarial review)` edits on the relevant AC or edge case; findings 4 and 5 are genuine decisions the reviewer cannot settle. Verified against the FE-07 standard and the current tree (`AuthorInformation.vue`'s four ids confirmed directly).

1. **(should-fix, routed → AC5)** AC5's "ending in a permitted elementtype" rejects the standard's own row-container form `<context>-row-<key>` and contradicts the story's own lint-matrix, which accepts `reports-row-a3f9`. Decision 4 forbids a custom variant. The standard settles it; AC5 rewritten to accept the row exception alongside the three-part form.

2. **(should-fix, routed → edge case 3)** Edge case 3 ("index or key in the id's purpose part" for `v-for` controls) is the exact inverse of the standard: "Controls and values inside the row keep the plain three-part id. Never suffix them." The key belongs on the row container or the per-instance `baseDataTestid`. Rewritten to match.

3. **(should-fix, routed → AC4)** AC4 renames only MessageBar, but the real tree already has non-conforming ids (`AuthorInformation`'s four, plus `.storybook/preview.ts` and two page-test stubs) that AC7's lint-clean gate cannot pass until renamed. The QA plan already tests `AuthorInformation`, so AC4's wording lagged the plan. Broadened to "every pre-existing non-conforming id is renamed; a repo-wide scan finds none."

4. **(blocker, OPEN → AC2)** The story rolls ids out only to a test-needed subset, leaving most interactive elements (`LanguageSwitcher`, `SearchButton`, nav links, `ShareOn`, pagination, filter, etc.) untagged, while AC1 records the standard's "tag every interactive element" coverage rule verbatim into `specs/PROJECT.md` and decision 4 says follow it exactly. The lint checks shape, not presence, so a partial rollout is lint-clean but leaves the codebase non-compliant with its own just-recorded convention, inside a standards-alignment feature. The maintainer must either expand the rollout to every interactive element or explicitly record a staged deviation (decision 4 currently forbids a narrowed coverage policy in PROJECT.md). Not a reviewer call.

   Resolved by research (story prep): the approved feature spec scopes the rollout to the Playwright specs and reusable components (FEAT-001 Scope area 8, Architecture area 7), so this is the feature's scope, not a PROJECT.md variant. See the DECIDED block on AC2.

5. **(should-fix, OPEN → AC3)** The standard forbids class/text/position selectors in *any* test, but AC3 converts only `src/app/tests/playwright/`, leaving the listed component tests (`SearchModal`, `LikeButton`, `CurriculumVitaeTable`, `TableOfContents`, `BlogPostPagination`, `AppHeader`, `SearchButton`, `BlogPost`) unconverted. Either extend AC3 to cover them or record the deferral explicitly (and widen finding 4's set). Not a reviewer call. The `<head>`/JSON-LD/sitemap-XML selectors are correctly exempt.

   Resolved by research (story prep): the approved feature spec scopes the test conversion to `src/app/tests/playwright/` (FEAT-001 Scope area 8, Architecture area 7); the component tests stay unconverted as a knowingly-left item. See the DECIDED block on AC3.

The reviewer set `awaiting-discussion` because findings 4 and 5 read as open decisions on rollout breadth and component-test selectors. Both were then settled by research against the approved feature spec (its area 7/8 rollout scope) and the FE-07 standard, recorded as `DECIDED (research)` on AC2 and AC3; findings 1 to 3 were adopted as `PROPOSED` edits with their own `DECIDED (research)` entries. Nothing remains open.

## Implementation notes
Developer notes (deviations and calls, none of which change the feature design):

- **Lint shape.** Selectors on `vue/no-restricted-syntax` in `eslint.config.js` (appended to the existing inline-style entries, so they apply to every `.vue` file including `.storybook/mocks` and `examples`). A static id must be lowercase kebab-case with at least two segments and end in one of the 13 types (so `like-button` passes, bare `button` fails); `<context>-row-<key>` is accepted; a bound template literal must end its static tail in `-<type>` or be `...-row-${key}`; a bound string literal follows the static rule; a bare identifier binding is not analysed. `data-test`, `data-cy` and `data-qa` (static and bound) are reported as well. Proven by `src/app/tests/lint/dataTestidLint.test.ts` (51 cases: accepted, rejected, the six folders, FE-09 selectors intact, no `attribute-hyphenation` hit) plus a throwaway `.vue` file linted from the CLI, deleted again. `vitest.config.ts` only gained the `src/app/tests/lint/**` include in the `unit` project (not in the Architecture reference); coverage `autoUpdate` thresholds were restored to their previous values after the coverage run.
- **Helper location.** The shared id helpers are in `src/app/tests/helpers/dataTestid.ts` (where ST-08 put the other helpers), not `tests/support/`.
- **Rollout.** Beyond the required set (`ColorModeSwitcher`, `MessageBar`, `MessageBarOutlet`, `AuthorInformation`) the converted Playwright selectors needed ids on `LanguageSwitcher`, `CodeGroup` (copy button) and `PageReadProgress` (toggle plus its bar), and `BlogPostSummary` became the `<base>-row-<post id>` container so the repeated author ids stay unique per row. `AppHeader` overrides the switcher bases (`desktop-menu-*`, `mobile-menu-*`). Store-driven bars get `message-bar-<messageId>` as base in `app.vue` (and in the test harness); Playwright matches them with `messageBarCardTestid` (`/^message-bar-\d+-card$/`) because the id is not predictable. The post id used as row key is the content id (`posts_en/1.md`), which is not strictly kebab-case; it is the stable key the content layer offers.
- **Ids chosen.** MessageBar `-card`, `-content-value`, `-close-button`; outlet `-main-panel`, `-sticky-panel`, `-fixed-panel`; AuthorInformation `-card`, `-name-link`, `-linkedin-link`, `-role-value`; switchers `-toggle-button`. Renamed leftovers: `component-story-panel`, `blog-post-card`, `blog-post-like-button`, `blog-posts-panel`.
- **Playwright specs.** The scan covers `apiErrors.spec.ts` and `messages.spec.ts` too (added by earlier stories). `waitForHeaderHydration` now waits for `desktop-menu-color-mode-switcher-toggle-button` with `state: 'attached'` and no longer reads the locale files. The language switcher button has no box of its own, so `messages.spec.ts` triggers it with `dispatchEvent('click')` instead of a pointer click on a flag.
- **Checks.** `pnpm lint:fix` clean, `pnpm ci:typecheck` clean, `pnpm ci:test` 54 files and 571 tests passed (coverage 85.6 statements, 80.96 branches, 84.7 functions, 85.66 lines, above the recorded thresholds), `pnpm playwright:docker` 110 passed and 80 skipped; no baseline image was added or modified (the only snapshot changes in the tree are the retired-component deletions from the notification migration). `dotnet test` not run (no `src/api/` change). Repo scan `rg -o 'data-testid[^>]*' src/app` finds only conforming ids.
- **Not changed.** Component tests that select by tag, class or text (listed under "Knowingly left") and the head/XML specs. Interactive elements outside the required set stay untagged, as decided.

## Verification report
Verdict: **pass-with-notes**.

### Checks (run by the verifier)

| Check | Result |
|---|---|
| `pnpm lint:fix` | clean, no output |
| `pnpm ci:typecheck` | clean |
| `pnpm ci:test` with `--coverage` | 54 files, 571 tests passed. Coverage 85.6 statements, 80.96 branches, 84.7 functions, 85.66 lines (matches the developer's numbers). vitest `autoUpdate` rewrote the thresholds; restored to the pre-run file exactly |
| `pnpm playwright:docker` run 1 | 110 passed, 80 skipped, 0 flaky |
| `pnpm playwright:docker` run 2 | 110 passed, 80 skipped, 0 flaky |
| Baselines | `git status` for `*-snapshots/` identical before and after both runs (only the earlier retired-component deletions); nothing regenerated |

`vitest.config.ts` diff against `HEAD`: the `src/app/tests/lint/**` include is ST-09's. The `src/app/types/**` coverage include, the `errors/` and `types/` test includes and the raised thresholds (84.83/80.63/82.82/84.91, all below the measured values) come from earlier stories of the feature, not ST-09. No ST-09 threshold drift.

### Acceptance criteria

| AC | Result | Evidence |
|---|---|---|
| 1 | pass | `specs/PROJECT.md` "data-testid convention" compared bullet by bullet with FE-07: attribute `data-testid` and default `testIdAttribute`, `<context>-<purpose>-<elementtype>`, all 13 element types, last-word rule, do/do-not coverage lists, scoped uniqueness, `baseDataTestid` defaulting to the kebab-case name with per-instance override, `<context>-row-<key>` with plain inner ids, index only for position tests, production builds keep attributes. Variants are only named as forbidden. No custom variant |
| 2 | pass | `baseDataTestid` (camelCase, destructured default equal to the kebab-case component name) on ColorModeSwitcher, MessageBar, MessageBarOutlet, AuthorInformation, plus LanguageSwitcher, CodeGroup, PageReadProgress, BlogPostSummary. Default and override tests in the component tests, including `setProps` reactivity |
| 3 | pass | Scan of `src/app/tests/playwright/*.ts` for getByTitle/Text/Role/Label, `.nth/.first/.last`, class locators: only the exempt `<head>` and JSON-LD locators in `metadata.spec.ts` and `open-graph-protocol.spec.ts` remain. `pages.spec.ts` waits for `desktop-menu-color-mode-switcher-toggle-button` with `state: 'attached'`; `messages.spec.ts` and `apiErrors.spec.ts` use `getByTestId` only |
| 4 | pass | `rg -o 'data-testid[^>]*' src/app` plus a scan of `:data-testid` bindings: every id conforms. `MessageBar` ids are `-card`, `-content-value`, `-close-button`; the retired reference ids are asserted absent. `AuthorInformation` ids, `component-story-panel` (`.storybook/preview.ts`), `blog-post-card`, `blog-post-like-button`, `blog-posts-panel` (page-test stubs) are conformant |
| 5 | pass | Verified with throwaway stdin lint runs, no files created. Reported: `BadName`, `order-details-export`, `export-button-`, empty and valueless attribute, `` `${b}-export` ``, `data-test`. Accepted: `color-mode-switcher-toggle-button`, `like-button`, `reports-row-a3f9`, `` `${b}-row-${k}` ``, `` `${b}-close-button` ``, bare identifier binding. `class`, `title`, `id`, `data-other`, `aria-label` with CamelCase values are not flagged (shape enforced only on `data-testid`). `style` is still reported by the FE-09 selector (not displaced). The 51-case matrix in `src/app/tests/lint/dataTestidLint.test.ts` passes in `ci:test`. Repo state unchanged afterwards |
| 6 | pass | `colorModeSwitcher should keep two instances distinguishable through different bases`, `AppHeader should expose desktop and mobile menu switchers under different ids`, `authorInformation should stay unique within a list of instances that use different bases`, `MessageBarOutlet should give two simultaneous messages distinct ids` |
| 7 | pass | See the checks table; no baseline changed |
| 8 | pass | `specs/enforcement.md` FE-07 row is "Enforced - lint (shape) + review" with the scope limits stated; `CLAUDE.md` bullet links to `specs/PROJECT.md` ("data-testid convention") without spec ids |

### Compliance

- `specs/components.md`: the eight components that define `baseDataTestid` (AuthorInformation, BlogPostSummary, ColorModeSwitcher, LanguageSwitcher, MessageBar, MessageBarOutlet, CodeGroup, PageReadProgress) each record it; AppHeader only passes values. Set matches.
- No spec, story, AC or finding references in code comments or test names (only the pre-existing standard ids such as `FE-07` in lint messages, the style already used for FE-09). No inline styles or `:style`, no kebab-case Vue props. `testIdAttribute` untouched.
- Release and documentation obligations: none beyond `specs/components.md` (profile).

### Judgement of deviations

- Extra ids on LanguageSwitcher, CodeGroup, PageReadProgress and BlogPostSummary: within the decided scope ("any component whose id a converted selector needs"); each is consumed by a converted spec or by the author-id uniqueness test. Not scope creep.
- `dispatchEvent('click')` on the language switcher: it does not hide a regression in what the test proves (the click handler and notice are still exercised), but it bypasses Playwright's actionability and hit-target checks. The cause is real and pre-existing: the button is `absolute` with only absolutely positioned flag children, so it has no box of its own. Note, not a failure; a sized button would let the test click normally.
- `src/app/tests/lint/**` include: required for the lint matrix test, recorded in the notes, no threshold drift from it.

### Notes (non-blocking)

1. `CodeGroup` keeps its default base, so a post with several code groups (posts 1, 2, 4, 5) renders `code-group-copy-button` more than once on one page. The Playwright test uses post 3 (one group), so strict mode passes. If a test ever targets those posts it must scope per group or set a base per instance.
2. `BlogPostSummary`'s row key is the content id (`posts_en/1.md`), not strictly kebab-case. The standard allows the entity's stable business key as the row key and the lint accepts the template form, so this conforms in practice. A slug-based key would be tidier.
3. The remaining untagged interactive elements and the unconverted component-test selectors stay as decided ("Knowingly left uncovered or unconverted").
