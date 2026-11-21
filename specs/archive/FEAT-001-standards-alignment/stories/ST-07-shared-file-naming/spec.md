---
id: ST-07
type: story
feature: FEAT-001
status: done
approved_by: "auto (delegated by feature approval)"
pr: ""
---

# Story: Shared file naming, Util suffix for utils and use prefix for composables (FE-05)

## Decided without the maintainer (research)

Settled from research during adversarial review, not reviewed by the maintainer. Override any of these freely.

- AC8 → the FE-05 row moves off `Review only`, and the FE-20 row path and the "Not wired this run" FE-05 bullet are cleaned up in the same edit

## Functional
### User story
As Jeroen (the maintainer), I want shared utility files and composables to follow one naming convention that lint enforces, so that I can tell what a shared file is from its name and new files cannot drift from the convention.

### Acceptance criteria
1. Given every `.ts` file in `src/app/utils/` (re-measure: the spec says about 14, the current tree shows `checks`, `date`, `divideArray`, `markdown`, `mergeReplace`, `queryCollectionExtensions`, `screen`, `test`, `toDictionary`, `toMap`, `uniqueBy`, `yaml` and possibly more), then each non-test file is renamed to carry the `Util` suffix (for example `date.ts` to `dateUtil.ts`, `test.ts` to `testUtil.ts`), and its co-located `*.test.ts` file is renamed to match (for example `toMap.test.ts` to `toMapUtil.test.ts`).
2. Given `src/app/composables/destructiblePinia.ts` and `refReactiveDefault.ts` (and their `*.test.ts` files), then they are renamed to `use*` names (for example `useDestructiblePinia.ts` and `useRefReactiveDefault.ts`), keeping a single import path for the destructible-store wrapper.
3. Given the renames, then every import site, auto-import reference, test, Storybook file and config referencing the old paths is updated, and no exported symbol, signature or behaviour changes: the diff outside file moves is limited to import paths and the eslint allow-list below.
4. Given `eslint.config.js`, then the four FE-20 allow-path occurrences that name `destructiblePinia.ts` point to the renamed file and the FE-20 rule still passes.
5. Given `eslint.config.js`, then a filename-case (or equivalent per-folder naming) rule is wired scoped to `src/app/utils/` (must end in `Util`, camelCase, `.test`/`.nuxt.test` variants allowed) and `src/app/composables/` (must start with `use`), and it applies to nothing else (components, contexts, types, pages are untouched).
6. Given a deliberately misnamed throwaway file in each scoped folder (for example `src/app/utils/foo.ts`, `src/app/composables/foo.ts`), then `pnpm lint` reports an error; given the real tree, `pnpm lint:fix` is clean.
7. Given `pnpm ci:typecheck`, `pnpm ci:test` and `pnpm playwright:docker`, then all pass with no baseline regenerated and coverage unchanged.
8. Given `specs/enforcement.md` and `CLAUDE.md`, then the FE-05 row (currently `Review only`) moves to Enforced with lint and a pointer to `eslint.config.js`; the FE-20 row's text naming `src/app/composables/destructiblePinia.ts` is updated to the renamed path; the FE-05 bullet under "Not wired this run" is removed; and CLAUDE.md records the naming convention.

   > **PROPOSED (adversarial review) — AC8 must also clean up the two other stale spots the rename leaves behind.** The FE-05 row is currently `Review only` (not `Open`), so reword to "moves off `Review only`". Two further edits that the rename makes mandatory but AC8 omits: (a) `specs/enforcement.md`'s FE-20 row text names `src/app/composables/destructiblePinia.ts`, which the rename makes stale, so it must be updated to the renamed path; (b) the "Not wired this run" section's FE-05 bullet ("a per-folder `unicorn/filename-case` convention (needs the convention defined first)") becomes false once the rule is wired and must be removed. Confirmed both spots exist (`specs/enforcement.md` FE-20 row and the "Not wired this run" FE-05 bullet). The QA plan already verifies both (mapping row 8 and the manual checklist), so this only aligns the AC with the plan.

DECIDED (research): AC8. Reword AC8 so the FE-05 row moves off `Review only` to Enforced, the FE-20 row's `destructiblePinia.ts` path is updated to the renamed file, and the FE-05 bullet under "Not wired this run" is removed.
Why: `specs/enforcement.md` lists FE-05 as `Review only` (not `Open`), hardcodes `src/app/composables/destructiblePinia.ts` in the FE-20 row, and lists FE-05 as unwired ("a per-folder `unicorn/filename-case` convention"); the rename and the new lint rule make all three stale, and the QA plan already verifies them. This contradicts no Decision log entry (entry 5 only fixes the lint scope to `utils/` and `composables/`).
Sources: `specs/enforcement.md` (FE-05 row, FE-20 row, "Not wired this run" section), `eslint.config.js`, FEAT-001 Decision log entry 5.

### Edge cases
- Nuxt auto-imports derive from exported names, not file names, so no call sites should need edits beyond explicit path imports; verify with typecheck.
- The files added by ST-05 (`useApiState`, `useApiErrorReporter`, `useMessageStore`) already match the `use*` rule and must pass the new lint rule.
- Files in `src/app/composables/` that are test helpers or non-`use*` by nature (if any) are found by the lint run and either renamed or explicitly exempted with a note in Implementation notes.

### Out of scope
- Any behaviour change, refactor or content edit. This story is rename-only and is kept separate from behaviour changes by design (constraints section).
- Folders other than `utils/` and `composables/` (decision 5), including `src/app/types/`.

## Design reference
No visual change.

## Architecture reference
Implements area 5 (FE-05) and decision 5. Files and areas: all files in `src/app/utils/` and the two named composables in `src/app/composables/` plus their import sites across `src/app/` (components, contexts, pages, composables, tests, stories); `eslint.config.js`; `CLAUDE.md`; `specs/enforcement.md`. Standard: `/Users/jeroenbach/Source/claude-plugins/plugins/spec/standards/vue/FE-05 Shared file naming.md`. Public surface: none in `specs/components.md` (utils and composables are not inventoried).

Dependencies: ST-06 (keeps the rename after the error vertical, so the files ST-05 and ST-06 add or delete are renamed once and the final tree is renamed in one pass). Independent of the backend stories. Blocks nothing hard; ST-08, ST-09 and ST-11 work against the renamed paths. No release bookkeeping.

## QA plan

This is a rename-only story, so the safety net is the existing suite plus the type checker and lint; no new unit or component tests are written for renamed code (no behaviour changes, no new logic). The one new piece of logic is the lint rule, which is verified by negative and positive lint runs (AC6). Baseline measured against the current tree; ST-05 and ST-06 will have added and deleted files by the time this runs, so the developer re-measures first (see Environment and ordering).

### Acceptance criteria to test mapping

| AC | Verification | Kind | Concrete check |
|---|---|---|---|
| 1 | Every non-test `src/app/utils/*.ts` ends in `Util.ts`; every co-located test mirrors it and `.test.ts` stays the suffix | Manual (scripted listing) + lint | List `src/app/utils/`; no file lacks the `Util` suffix; the filename rule (AC5) enforces it. Current tree: 14 source files (`checks`, `date`, `divideArray`, `markdown`, `mergeReplace`, `queryCollectionExtensions`, `screen`, `test`, `toDictionary`, `toMap`, `toc`, `uniqueBy`, `url`, `yaml`) and 6 tests (`divideArray`, `mergeReplace`, `toDictionary`, `toMap`, `toc`, `url`). `toc` and `url` are missing from the story's example list but are in scope |
| 1 | Renamed tests still run and pass | Existing unit tests | `divideArrayUtil.test.ts`, `mergeReplaceUtil.test.ts`, `toDictionaryUtil.test.ts`, `toMapUtil.test.ts`, `tocUtil.test.ts`, `urlUtil.test.ts` run in the `unit` project via the unchanged `src/app/utils/**/*.{test,spec}` include glob. Compare the executed test count before and after: it must be identical |
| 2 | `useDestructiblePinia.ts` and `useRefReactiveDefault.ts` plus their tests renamed | Existing unit tests | `useDestructiblePinia.test.ts` and `useRefReactiveDefault.test.ts` run in `unit` and pass with the same test count. One import path for the wrapper: grep shows zero references to `destructiblePinia` outside the renamed file and its history |
| 2 | Exported symbols unchanged (`defineDestructibleStore`, `createPinia`, `setActivePinia`, `refReactiveDefault`, `cloneFnJSONExtended`, and every util export) | `pnpm ci:typecheck` + review of `git diff -M` | Typecheck fails on any renamed/dropped export. The diff review confirms only path strings and the lint config changed |
| 3 | No stale path anywhere | Grep + typecheck + full test run | Repo-wide grep (excluding `node_modules`, `.nuxt`, `specs/`) for each old module path returns nothing. Known explicit import sites to confirm updated: `nuxt.config.ts` (`./src/app/utils/screen`), `locales.config.ts` (`toMap`, `url`), `src/app/contexts/useSearchContext.ts`, `useBlogPostsContext.ts`, `src/app/composables/useMetadata.ts`, `components/LikeButton.vue`, `BlogPost.vue`, `AppMarkdown.vue`, `AppFooter.stories.ts`, `ResponsiveImage.nuxt.test.ts` (`~/utils/test`), the util tests' own `@/utils/*` and `./toc` imports, `examples/post2/example2/Child.vue` (`~/composables/refReactiveDefault`), and the composable tests' `./destructiblePinia` and `./refReactiveDefault` imports. Notification files (`useNotificationStore.ts`, `useNotification.nuxt.test.ts`) are deleted by ST-06, so re-grep rather than trust this list |
| 3 | Rename-only diff | Manual review | `git diff -M --stat` shows renames (similarity near 100 percent) plus modified lines limited to import specifiers, `eslint.config.js`, `CLAUDE.md`, `specs/enforcement.md`. Any other changed line is a deviation to record in Implementation notes |
| 3 | Nuxt auto-imports and Storybook auto-imports unaffected | `pnpm ci:typecheck`, `nuxt` Vitest project, Storybook render via Playwright | Auto-imports key off exported names, not filenames. `src/app/.storybook/vite.config.ts` auto-imports `./utils` and `./composables` by directory, so the Storybook build (exercised by `components.spec.ts`) is the check that the rename did not break it |
| 3 | `src/app/server/utils/contentUrls.ts` is untouched | Review | It is a Nitro server util, outside the scoped folders; confirm it is neither renamed nor flagged by the new rule |
| 4 | All four `destructiblePinia.ts` occurrences in `eslint.config.js` updated (the allow-path `files:` entry plus the three FE-20 messages at the root block, contexts block and components block) and FE-20 still passes | Lint, negative + positive | Positive: `pnpm lint:fix` clean on the real tree (the wrapper file itself still imports `pinia` without error). Negative: lint stdin as a throwaway path, `echo "import { defineStore } from 'pinia';" \| npx eslint --stdin --stdin-filename src/app/components/Foo.vue` (use a `.ts` file under `src/app/composables/` too) reports FE-20, and the same import lint-checked as `src/app/composables/useDestructiblePinia.ts` reports nothing. Grep `eslint.config.js` for `destructiblePinia` returns zero hits |
| 5 | Filename rule scoped only to `src/app/utils/` and `src/app/composables/` | Lint negative + positive, plus scope probes | See "Lint rule verification" below |
| 6 | Misnamed file in each scoped folder errors; real tree clean | Lint | See "Lint rule verification" below |
| 7 | `pnpm ci:typecheck`, `pnpm ci:test`, `pnpm playwright:docker` pass, no baseline regenerated, coverage unchanged | Quality gates | Run each gate; `git status` after `pnpm playwright:docker` shows no change under `src/app/tests/playwright/*-snapshots/`. Coverage: `pnpm ci:test` summary equals the pre-rename numbers (thresholds in `vitest.config.ts` use `autoUpdate`, so confirm `vitest.config.ts` is not rewritten with different numbers by the run; if it changes, the rename changed coverage and that is a finding) |
| 8 | `specs/enforcement.md` FE-05 row moves off `Review only`; FE-20 row path and the "Not wired this run" FE-05 bullet are cleaned up; `CLAUDE.md` records the convention | Manual review | Row reads Enforced with lint and a pointer to `eslint.config.js`. The "Not wired this run" bullet for FE-05 is removed. The FE-20 row's text naming `destructiblePinia.ts` is updated to the new path (AC8). `CLAUDE.md` gets a short convention note (utils end in `Util`, composables start with `use`, singular, tests mirror names with `.test.ts`) and contains no spec or story identifiers |

### Lint rule verification (AC5 and AC6)

Use stdin lint with a fake path so nothing needs to be created or cleaned up, and the snapshot and lint-fix hooks are not involved. All of these run from the repo root.

Must report an error (negative):
- `src/app/utils/foo.ts` (no `Util` suffix)
- `src/app/utils/fooUtils.ts` (plural, still must fail: the suffix is exactly `Util`)
- `src/app/utils/FooUtil.ts` and `src/app/utils/foo-util.ts` (not camelCase)
- `src/app/composables/foo.ts` (no `use` prefix)
- `src/app/composables/Foo.ts`, `src/app/composables/use-foo.ts` (not camelCase)

Must pass (positive):
- `src/app/utils/fooUtil.ts`, `src/app/utils/fooUtil.test.ts`, `src/app/utils/fooUtil.nuxt.test.ts`
- `src/app/composables/useFoo.ts`, `src/app/composables/useFoo.test.ts`, `src/app/composables/useFoo.nuxt.test.ts`
- `src/app/composables/useFooStore.ts` (store variant per the standard)

Must be untouched by the rule (scope probes): `src/app/components/foo.ts`, `src/app/contexts/foo.ts`, `src/app/types/foo.ts`, `src/app/pages/foo.ts`, `src/app/server/utils/foo.ts`, `src/app/server/utils/contentUrls.ts`. These prove the rule does not leak into other folders, including the similarly named Nitro `server/utils/`, so the rule glob must be anchored to `src/app/utils/` and not `**/utils/`.

Positive on the real tree: `pnpm lint:fix` exits 0 with no warnings attributable to the rule, which also proves ST-05's `useApiState`, `useApiErrorReporter`, `useMessageStore` and their tests pass. Ordering note: run the lint after the renames and after confirming the final file list, since ST-05 and ST-06 add and delete files in these folders.

### Risks the developer must resolve before writing the rule

- `unicorn/filename-case` only supports case styles (camelCase, kebabCase, ...) and an `ignore` list; it cannot require a `Util` suffix or a `use` prefix. AC5 says "or equivalent per-folder naming rule", so the plan accepts any mechanism that satisfies the matrix above (for example `eslint-plugin-check-file`'s `filename-naming-convention` with a per-folder regex, or an inline local plugin rule). If a new dev dependency is chosen, note the pnpm trust-policy check (see `specs/enforcement.md` supply-chain note) and record the choice in Implementation notes. Combining `unicorn/filename-case` for the case check with a second rule for the suffix is acceptable. The plan's pass/fail matrix, not the rule name, is the acceptance test.
- Whatever rule is used must treat `.test.ts` and `.nuxt.test.ts` as variants of the base name (so `toMapUtil.test.ts` passes) and must not let `fooUtil.test.ts` pass while `foo.test.ts` also passes. Add `foo.test.ts` under `src/app/utils/` to the negative list.
- antfu's config may already enable overlapping filename rules for some paths; confirm no pre-existing rule conflicts or double-reports.
- `src/app/utils/test.ts` becomes `testUtil.ts`. Its sibling pattern `*.test.ts` and `vitest.config.ts` globs are unaffected (the old name did not match the coverage-exclude glob either), but confirm `testUtil.ts` is still counted exactly as `test.ts` was in coverage.
- The standard says tests mirror names as `arrayUtil.tests.ts`; this project's convention is `.test.ts` (CLAUDE.md, `vitest.config.ts`, `dangerfile.ts`). The story keeps `.test.ts`; do not introduce `.tests.ts`, which no Vitest include glob would pick up. Recorded here so the reviewer does not flag the divergence.
- Singular rule from the standard: `checks` and `queryCollectionExtensions` are plural. The story's AC1 says only "carry the Util suffix", so `checksUtil.ts` and `queryCollectionExtensionsUtil.ts` satisfy it. Whether to singularize (`checkUtil.ts`, `queryCollectionExtensionUtil.ts`) is a decision for the adversarial review or maintainer, not for the developer to make silently. The lint rule must not enforce singularity (not required by AC5).

### Fixtures and test utilities

None new. Existing: the `unit` and `nuxt` Vitest projects, `src/app/utils/test.ts` (renamed `testUtil.ts`, consumed by `ResponsiveImage.nuxt.test.ts`), `src/app/tests/mocks/nuxt-imports.ts` (referenced by path from `vitest.config.ts`, not renamed). No Storybook story or visual-regression entry is added, changed or removed.

### UI states

Not applicable: no visual change and no UI slice. The only UI evidence is that the existing Storybook stories and Playwright visual regression still pass with unchanged baselines.

### Stack-specific regression classes

- Reactivity and store scoping: `defineDestructibleStore` is the FE-20 wrapper whose destructuring behaviour is the trouble spot. Its dedicated test (`useDestructiblePinia.test.ts`) and `useRefReactiveDefault.test.ts` must run unchanged and green after the rename; any skipped or silently unmatched test file (a rename that the include glob stops picking up) is a regression, hence the before/after executed-test-count comparison.
- Async cancellation, state migrations: not touched.

### Coverage

Gate unchanged. A pure rename must leave statements, branches, functions and lines identical. No code is knowingly left uncovered and none is added. The risk worth checking is a renamed test file dropping out of an include glob (it would lower coverage silently); the before/after test count and coverage comparison catches it.

### Environment and ordering

- Run on top of a finished ST-06 (dependency). Step 0 for the developer: re-list `src/app/utils/` and `src/app/composables/` and re-grep for old paths, because ST-05 adds `useApiState`, `useApiErrorReporter`, `useMessageStore` (already compliant) and ST-06 deletes `useNotificationStore.ts` and `useNotification.nuxt.test.ts`, so those must not be renamed or counted.
- `TZ=Europe/Amsterdam` for all Vitest runs (baked into `pnpm ci:test`).
- `pnpm playwright:docker` needs Docker/colima; if unavailable, rely on the PR pipeline's `20-build-deploy-playwright.yml` and say so. Never regenerate baselines; a visual diff here means a broken import, not a stale baseline.
- Use `git mv` semantics (or equivalent) so history follows the files; commit separately from any behaviour change per the feature constraints (the developer does not commit in an interactive session).
- `node_modules` must be installed before lint and typecheck (CLAUDE.md step 0).

### Regression risk

- Touched: every importer of the 14 utils and the two composables (components, contexts, composables, stories, tests, `nuxt.config.ts`, `locales.config.ts`, the example `Child.vue`) and `eslint.config.js` (FE-20 allow-path and messages, new filename rule).
- Highest-risk sites are the ones outside `src/app/` or outside ordinary `~/` imports: `nuxt.config.ts` and `locales.config.ts` import utils by relative path at config load, so a miss breaks `pnpm dev`, `pnpm generate` and every Vitest run rather than a single file. Verify with `pnpm ci:typecheck` and by confirming `pnpm generate` (or at least `nuxi prepare`) starts.
- Other stories: ST-08, ST-09 and ST-11 work against renamed paths and are downstream only. Existing tests that guard the touched code: the six util tests, the two composable tests, and every context and component test that imports a util transitively.
- The new lint rule can fail ST-08 to ST-11 if they add a misnamed file in the scoped folders; that is the intended guard.

### Manual verification checklist

- [ ] `git diff -M --stat` shows renames only plus import-path, `eslint.config.js`, `CLAUDE.md`, `specs/enforcement.md` edits; no logic line changed.
- [ ] Old-path grep (excluding `node_modules`, `.nuxt`, `specs/`) is empty for all 14 util names, `destructiblePinia` and `refReactiveDefault` module paths.
- [ ] Lint matrix above executed: every negative errors, every positive and scope probe passes.
- [ ] `pnpm lint:fix`, `pnpm ci:typecheck`, `pnpm ci:test` clean; executed test count and coverage equal to pre-rename.
- [ ] `pnpm playwright:docker` passes (or the PR pipeline is green) with no snapshot file changed.
- [ ] `specs/enforcement.md` FE-05 row, the "Not wired" FE-05 bullet and the FE-20 row path updated; `CLAUDE.md` convention note present and free of spec identifiers and em dashes.
- [ ] Any non-`use*` file found in `src/app/composables/` by the lint run is renamed or explicitly exempted with a note in Implementation notes (edge case 3).

### Findings and proposals

1. AC1 undercounts examples: the story lists the example files but omits `toc` and `url` (and their tests). Counts in the AC are marked "re-measure"; the plan uses the measured 14 plus 6 tests. No rewrite needed, but the implementer must not treat the example list as exhaustive.
2. AC5 names `filename-case` but that rule cannot express suffix or prefix requirements. Proposed wording, for the reviewer: "a per-folder filename rule enforces the pass/fail matrix in the QA plan's Lint rule verification section; mechanism is the developer's choice and is recorded in Implementation notes."
3. AC8 listed only the FE-05 row, but `specs/enforcement.md` also names `destructiblePinia.ts` in the FE-20 row and lists FE-05 under "Not wired this run". Adopted: AC8 now covers both so the ledger does not go stale.
4. Plural util names (`checks`, `queryCollectionExtensions`) versus the standard's singular rule is undecided. Flagged for the reviewer or maintainer; the plan is neutral and verifies only the `Util` suffix.

## Adversarial review
Lite, story level. Blockers-only lens: acceptance criteria testable and mapped, consistency with the approved feature design/architecture, explicit dependencies. Verified against the current `main` tree, `eslint.config.js`, `specs/enforcement.md`, and the FE-05 standard.

No blockers. Acceptance criteria are testable and each is mapped in the QA plan (AC5/AC6's lint rule carries an explicit pass/fail/scope-probe matrix; AC1 maps to the full measured file list; AC7 pins coverage and baseline). The dependency on ST-06 is explicit in the feature Stories table and the Architecture reference. The "or equivalent" lint mechanism is not a silent override: the approved feature architecture (Scope area 7) itself writes "`unicorn/filename-case` or equivalent".

Findings:

1. **(should-fix, routed as PROPOSED) AC8 is incomplete and mislabels the row state.** The rename leaves two other spots stale that AC8 does not name: the FE-20 row in `specs/enforcement.md` hardcodes `src/app/composables/destructiblePinia.ts`, and the "Not wired this run" section still lists FE-05 as unwired. The FE-05 row is also `Review only`, not `Open`. Confirmed all three against `specs/enforcement.md`. Routed as a `PROPOSED (adversarial review)` edit on AC8; the QA plan already verifies all three, so this only aligns the contract with the plan. Does not force discussion.

2. **(nit, confirmed fact) `unicorn/filename-case` cannot enforce the `Util` suffix or `use` prefix.** Verified against the rule's own docs: its options are casing styles (`case`/`cases`), `ignore`, and extension handling only; no suffix/prefix support. The QA planner's flag is correct, and it is already settled in-spec: AC5 reads "(or equivalent per-folder naming) rule" and the approved architecture says "or equivalent", so the developer must reach for `eslint-plugin-check-file` or a local rule and prove it against the QA matrix. No action needed. If a new dev dependency is added, it goes through the `pnpm` trust-policy exclusion the way `danger` did (QA plan already notes this).

3. **(nit) AC1's example list omits `toc` and `url` (and their tests).** Confirmed `toc.ts`/`toc.test.ts` and `url.ts`/`url.test.ts` exist. AC1's scope clause ("every `.ts` file in `src/app/utils/`", marked "re-measure") already covers them and the QA plan's AC-mapping lists all 14 sources + 6 tests and calls the omission out, so this is cosmetic. The implementer must treat the inline examples as non-exhaustive.

4. **(nit, settled by the approved architecture) Singularizing `checks`/`queryCollectionExtensions` is not in scope here.** FE-05 does require singular names, and `checks.ts` (a bag of boolean guards) and `queryCollectionExtensions.ts` (a single `whereNotDraft`) both read as plural. But the approved feature architecture (Scope area 5) scopes this story to adding the `Util` suffix (its own examples only suffix, e.g. `url.ts` → `urlUtil.ts`), and the story keeps the lint rule neutral on plurality. So `checksUtil.ts`/`queryCollectionExtensionsUtil.ts` is consistent with what the maintainer approved; singularizing would expand scope beyond the approved rename. If the maintainer wants FE-05-conformant singular names, that is a small separate naming decision, not a blocker to this rename-only story.

## Implementation notes
Filled by developer during implementation: deviations from plan and why. Deviations that affect the feature design/architecture are also propagated to the feature spec.

Renamed with plain `mv` (nothing staged). Re-measured first: 14 util sources plus 6 util tests (`checks`, `date`, `divideArray`, `markdown`, `mergeReplace`, `queryCollectionExtensions`, `screen`, `test`, `toDictionary`, `toMap`, `toc`, `uniqueBy`, `url`, `yaml`) became `*Util.ts` / `*Util.test.ts`; `destructiblePinia` and `refReactiveDefault` (and tests) became `useDestructiblePinia*` and `useRefReactiveDefault*`. Exported symbols are unchanged (`refReactiveDefault` keeps its name). `checks` and `queryCollectionExtensions` stay plural (`checksUtil.ts`, `queryCollectionExtensionsUtil.ts`), per the review.

Lint mechanism: no new dependency. A small local ESLint plugin (`shared-file-naming/filename-pattern`) is defined at the top of `eslint.config.js` and wired in two blocks scoped to `src/app/utils/**/*.ts` (`^[a-z][a-zA-Z0-9]*Util(\.(nuxt\.)?test)?\.ts$`) and `src/app/composables/**/*.ts` (`^use[A-Z][a-zA-Z0-9]*(\.(nuxt\.)?test)?\.ts$`), so the pnpm trust-policy handling was not needed. The full QA matrix was run through stdin lint: all 11 negatives flagged (including `fooUtils.ts`, `utils/foo.test.ts`, `composables/foo.test.ts`, `fooUtil.nuxt.ts`), all 7 positives clean, all 6 scope probes (components, contexts, types, pages, `server/utils/foo.ts`, `server/utils/contentUrls.ts`) untouched. FE-20 negative still fires for `components/FooBar.vue` and `composables/useOther.ts`, and the wrapper itself is clean. The four `destructiblePinia` occurrences in `eslint.config.js` now point to `useDestructiblePinia`. No non-`use*` composable needed an exemption.

Deviation: the three blog posts `src/app/content/{en,nl,de}/posts/5.md` link to `src/app/utils/toMap.test.ts` on GitHub; only the URL path was updated to `toMapUtil.test.ts` so the link does not break (link text left as is). Not a content rewrite.

Checks: `pnpm lint:fix` clean; `pnpm ci:typecheck` clean; `pnpm ci:test:coverage` 49 files / 456 tests before and after, coverage 84.52 / 79.68 / 82.75 / 84.62 before and after, `vitest.config.ts` not rewritten (`testUtil.ts` counted exactly as `test.ts` was); `pnpm playwright:docker` exit 0 (110 passed, 80 skipped), no snapshot file changed. `pnpm generate` was not run separately; the Playwright build covers it. `dotnet test` not run (no backend files touched).

Docs: `specs/enforcement.md` FE-05 row now Enforced (lint), FE-20 row path updated, FE-05 "Not wired" bullet removed; `CLAUDE.md` got a Shared file naming convention bullet.

## Verification report

Verdict: **pass-with-notes**. Nothing is open for the maintainer except linking the PR.

### Checks

| Gate | Result |
|---|---|
| `pnpm lint:fix` | exit 0, the working tree was byte-identical before and after (no autofix needed) |
| `pnpm ci:typecheck` | exit 0 |
| `pnpm ci:test` | 49 files, 456 tests passed, same as before the story |
| `pnpm ci:test:coverage` | 84.52 / 79.68 / 82.75 / 84.62, identical to before; `vitest.config.ts` not rewritten by the run |
| `pnpm playwright:docker` | exit 0: 109 passed, 1 flaky, 80 skipped (110 run, matches the developer). The flaky case is `responsiveimage--default` on webkit ("Failed to take two consecutive stable screenshots", image load timing); it passed on retry and is not related to a file rename. Snapshot status under `src/app/tests/playwright/*-snapshots/` is unchanged by the run, nothing regenerated |

### Acceptance criteria

| AC | Result | Evidence |
|---|---|---|
| 1 | Pass | `src/app/utils` holds 14 sources (`checksUtil`, `dateUtil`, `divideArrayUtil`, `markdownUtil`, `mergeReplaceUtil`, `queryCollectionExtensionsUtil`, `screenUtil`, `testUtil`, `toDictionaryUtil`, `toMapUtil`, `tocUtil`, `uniqueByUtil`, `urlUtil`, `yamlUtil`) and 6 tests, all `*Util.ts` / `*Util.test.ts`. Tests still run (456 count unchanged) |
| 2 | Pass | `useDestructiblePinia(.test).ts`, `useRefReactiveDefault(.test).ts`; every other composable is `use*`. `destructiblePinia` has zero references outside `specs/`; the symbol `refReactiveDefault` keeps its name |
| 3 | Pass | Content comparison against `git show HEAD:` for all 14 sources and 8 tests: the 14 sources and both composable sources are byte-identical; tests differ only in the import specifier line. Diff of importers (`nuxt.config.ts`, `locales.config.ts`, components, contexts, `useMetadata.ts`, `Child.vue`, stories, `ResponsiveImage.nuxt.test.ts`) shows only module-path changes. Repo-wide grep (excluding `node_modules`, `.nuxt`, `.output`, `specs/`) finds no old module path or `.test` file name. `server/utils/contentUrls.ts` untouched and not flagged by the rule |
| 4 | Pass | `eslint.config.js` has zero `destructiblePinia` hits and four `useDestructiblePinia` hits (allow-path `files:` plus three FE-20 messages). FE-20 still fires for `components/FooBar.vue`, `composables/useOther.ts` and `contexts/useX.ts` and does not for the wrapper |
| 5 | Pass | Local rule `shared-file-naming/filename-pattern`, no new dependency, wired only for `src/app/utils/**/*.ts` and `src/app/composables/**/*.ts` |
| 6 | Pass | Stdin matrix: all 11 negatives error (`foo`, `fooUtils`, `FooUtil`, `foo-util`, `utils/foo.test`, `fooUtil.nuxt`, `composables/foo`, `Foo`, `use-foo`, `composables/foo.test`, `usefoo`); all 7 positives clean (`.test` and `.nuxt.test` variants, `useFooStore`); scope probes (components, contexts, types, pages, `server/utils/foo.ts`, `server/utils/contentUrls.ts`) clean. Real throwaway files `utils/foo.ts` and `composables/foo.ts` made `pnpm lint` fail with the FE-05 message while `components/foo.ts` was not flagged; all three removed, tree hash identical to before. Real tree is clean |
| 7 | Pass | See Checks |
| 8 | Pass | `specs/enforcement.md`: FE-05 row Enforced (lint) with pointer to `eslint.config.js`; FE-20 row path is `useDestructiblePinia.ts`; the FE-05 "Not wired this run" bullet is gone. `CLAUDE.md` has the Shared file naming bullet, no spec identifiers, no em dashes |

### Deviation judged

`src/app/content/{en,nl,de}/posts/5.md`: the only changed line in each is the GitHub link URL `.../utils/toMap.test.ts` to `.../utils/toMapUtil.test.ts`; the surrounding text and the link label are untouched (verified with `git diff -U0`). This is a faithful path fix that keeps the link working, not a content change. Accepted.

### Notes (non-blocking)

- The new rule and its messages mention `FE-05`. That is the standard's identifier, consistent with the existing FE-20 messages, not a spec or story reference.
- `checksUtil` and `queryCollectionExtensionsUtil` stay plural, as settled in the adversarial review; the standard's singular rule is not enforced and remains a possible later maintainer decision.
- `.test.ts` is kept instead of the standard's `.tests.ts`, per the QA plan.
- The rule also applies to nested files under `utils/` and `composables/` (for example `utils/sub/foo.ts` errors), which is fine since none exist.
- No Kiota or other generated content changed by this story. `dotnet test` not required (no backend files touched by this story).
- Remember to link the PR in the frontmatter. ST-07 does not close the feature: ST-03 deletion, ST-08, ST-09 and ST-11 are separate.
