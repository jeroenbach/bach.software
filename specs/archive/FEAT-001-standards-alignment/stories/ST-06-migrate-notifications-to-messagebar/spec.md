---
id: ST-06
type: story
feature: FEAT-001
status: done
approved_by: "auto (delegated by feature approval)"
pr: ""
---

# Story: Move existing notifications onto MessageBar and retire the old notification stack

## Decided without the maintainer (research)

Settled from research during story prep, not reviewed by the maintainer. Override any of these freely.

- Third consumer `PageReadProgress` → rendered as `<MessageBar fixed>` (teleport on, slot content), keeping its floating position and live values
- Toast durations → keep 3000 ms and 4000 ms; ST-05 widens `closeIn` to `number` (ST-05 AC 15 is a hard dependency of this story)
- AR-1 → `PageReadProgress` is `<MessageBar fixed>` with teleport on, not in place (adopted, replaces the earlier in-place choice)
- AR-2 → AC 1 and AC 2 name the kept 3000 ms and 4000 ms durations and the ST-05 dependency
- AR-3 → "a dismissed message is removed" becomes "no longer rendered and flagged closed" (AC 6)
- AR-4 → the stale-reference search covers `README.md`, `docs/design/tokens.css` and `specs/components.md` (AC 5, AC 7)

## Functional
### User story
As a site visitor, I want the code-copy confirmation, the AI-translated-language notice and the reading-progress panel to keep working exactly as before, so that nothing visible is lost while the site moves to a single, translated message infrastructure; and as Jeroen, I want the old, duplicate notification components removed so there is one way to show a message.

### Acceptance criteria
1. Given `src/app/components/content/CodeGroup.vue`, when a visitor copies a code block, then the confirmation appears as a `MessageBar` via `useMessageStore` (`addSuccess`) with the same text and the same auto-dismiss behaviour as today, including the 3000 ms duration (`closeIn: 3000`). This needs ST-05's widening of `closeIn` to `number` (ST-05 AC 15); the reference's duration union does not admit 3000.
2. Given `src/app/contexts/AppHeaderContext.vue`, when the language notice for AI-translated content applies (`languageAiTranslated`), then it appears as a `MessageBar` via `useMessageStore` (`addInfo`) with the same text, trigger conditions and 4000 ms auto-dismiss (`closeIn: 4000`) as today (same ST-05 dependency).
3. Given `src/app/components/content/PageReadProgress.vue`, then it no longer imports `NotificationMessage`; its info panel (word count, reading time, time progress, scroll progress, reading stage) is rendered as `<MessageBar fixed>` (info severity, default teleport on, panel content in the default slot, not through `useMessageStore`), so it keeps the same content, the same floating top-right toast position and the live reading-progress values, and the same open/close button behaviour. See the flagged discrepancy below.
4. Given `src/app/components/AppHeader.vue`, then it no longer has a `notifications?` prop, no `Notification` type import, and no `NotificationContainer`/`NotificationMessage` markup; `AppHeader.nuxt.test.ts`, its story and `AppHeaderContext.vue` are updated accordingly.
5. Given the repository, then `AlertBar.vue`, `AlertBarContainer.vue`, `NotificationMessage.vue`, `NotificationContainer.vue`, `useNotificationStore.ts` and `useNotification.nuxt.test.ts` are deleted, together with `AlertBar.stories.ts`, `NotificationMessage.stories.ts`, their entries in `src/app/tests/playwright/components.spec.ts`, and their committed baseline PNGs under `src/app/tests/playwright/components.spec.ts-snapshots/`; a search for `useNotificationStore`, `AlertBar`, `NotificationMessage` and `NotificationContainer` across the whole repo (`src/`, `README.md`, `docs/`, `specs/components.md`; excluding `node_modules` and the `specs/FEAT-001-*` spec folder) returns nothing. That includes the stale `README.md` code sample (the `useNotificationStore` composable example and the `AppHeaderContext` example passing `:notifications`), which is rewritten to the `useMessageStore` pattern, and the `docs/design/tokens.css` comment naming `AlertBar` and `NotificationMessage`, which is reworded to name `MessageBar`. The locale key `notification.error.unknown` (only used by the deleted `addError`) is also gone from `en.json`, `nl.json` and `de.json`.
6. Given the replaced behaviour, then tests exist for each migrated consumer (copy confirmation is added on copy, the AI-translated notice is added when applicable, and a dismissed message is no longer rendered and is flagged closed in the store, which is how the reference store dismisses), replacing the deleted `useNotification.nuxt.test.ts` coverage; coverage does not decrease vs. `main`.
7. Given `specs/components.md`, then AlertBar, AlertBarContainer, NotificationMessage and NotificationContainer are removed, the AppHeader entry drops `notifications?`, the AppHeaderContext entry no longer says it fetches notifications (navigation only, plus color mode and language wiring), and `useNotificationStore` no longer appears.
8. Given `pnpm lint:fix`, `pnpm ci:typecheck`, `pnpm ci:test` and `pnpm playwright:docker`, then all are clean and the remaining visual baselines are unchanged (only the retired components' baselines are deleted, none regenerated).

### Edge cases
- Any existing visual or E2E coverage of `PageReadProgress` still passes, and the panel stays a floating top-right toast (not moved into the article flow) while its values keep updating live as the visitor scrolls and reads.
- The panel (a directly rendered `<MessageBar fixed>`) and the store-driven copy and language toasts share the same app-root `fixed` outlet, as they share `NotificationContainer` today; they stack without overlapping or being lost.
- A toast shown while the header's mobile menu is open still appears above the content (z-order and position equal to today's behaviour).
- Messages added before the outlet is mounted are not lost.

### Out of scope
- `MessageBar` stories (ST-11) and translation of remaining hardcoded strings (ST-08).
- Adding new message types or persistence behaviour beyond what the two consumers already do.

## Design reference
No prototype. `MessageBar` already adopts the existing alert look (ST-05); no visual delta, including for `PageReadProgress`, which stays a floating top-right toast through `<MessageBar fixed>`. Text of the copy and language toasts moves from the bold title to the message body (the `description` the store takes); the visitor-facing look is confirmed in the manual check (item 2).

## Architecture reference
Implements the migration and retirement part of area 1b (ADR 1b-A, decision 8, decision 10). Files and areas:
- Modified: `src/app/components/content/CodeGroup.vue`, `src/app/contexts/AppHeaderContext.vue`, `src/app/components/AppHeader.vue` (+ `AppHeader.nuxt.test.ts`, `AppHeader.stories.ts`), `src/app/components/content/PageReadProgress.vue`, `src/app/tests/playwright/components.spec.ts`, `specs/components.md`, `README.md` (the `useNotificationStore` and `:notifications` code samples), `docs/design/tokens.css` (the AlertBar/NotificationMessage comment), `src/app/locales/{en,nl,de}.json` (orphan `notification.error.unknown` dropped by `i18n-extract`).
- Deleted: `src/app/components/{AlertBar,AlertBarContainer,NotificationMessage,NotificationContainer}.vue`, `src/app/components/{AlertBar,NotificationMessage}.stories.ts`, `src/app/composables/useNotificationStore.ts`, `src/app/composables/useNotification.nuxt.test.ts`, and the retired components' PNGs in `src/app/tests/playwright/components.spec.ts-snapshots/`.

FLAGGED DISCREPANCY (architecture assumption does not match the tree): the spec states `CodeGroup.vue` and `AppHeaderContext.vue` are the only two consumers of the old notification stack. A search of the current tree also finds `src/app/components/content/PageReadProgress.vue`, which imports and renders `NotificationMessage` directly (static info panel, not store-driven), and `AppHeader.vue`, which renders `NotificationContainer` and `NotificationMessage` itself. `NotificationMessage` cannot be deleted until `PageReadProgress` stops using it. Resolved from research (see the DECIDED below): the panel is rendered with `<MessageBar fixed>` (info severity, teleport on, panel content in the default slot, non-store) so the look, the floating position and the live values are preserved. Alternatives considered: keep the panel as its own small element with the alert classes, or move it onto `useMessageStore` as a persisted info message (rejected: the store captures its description once, while the panel shows live values).

DECIDED (research, corrected after adversarial review): Render the `PageReadProgress` panel with `<MessageBar fixed>` (info severity, default teleport on, panel content in the default slot), not in place and not through `useMessageStore`.
Why: today the panel teleports into the notification container and floats top-right, and the approved feature promises no visitor-visible change, so it must stay a floating toast. A store message would capture its description once, but the panel shows live reading-progress values; slot content stays reactive across a teleport, so a directly rendered `MessageBar` keeps both the position and the live values. The earlier in-place choice moved the panel into the article flow and was wrong.
Alternative: a small standalone element with the alert classes. Reversing is a local edit to one component.
Sources: `standards/vue/examples/FE-19/MessageBar.vue` (`fixed` prop, default slot), `src/app/components/content/PageReadProgress.vue`, `src/app/components/NotificationMessage.vue`.

DECIDED (research): The consumers keep today's auto-dismiss durations (`CodeGroup` 3000 ms, `AppHeaderContext` 4000 ms), so ST-05 widens the adapted store's `closeIn` type from the reference's fixed duration union to `number`.
Why: the approved feature says both toasts keep their behaviour, the old store accepted any number, and the reference union (0, 2000, 5000, 10000) is a typing detail of the reference rather than a contract. Accepting 5000 would change a visible duration the feature says stays the same.
Alternative: accept the reference's 5000 ms for both. Reversing is a one-line change per consumer plus the test constants.
Sources: `src/app/components/content/CodeGroup.vue`, `src/app/contexts/AppHeaderContext.vue`, `src/app/composables/useNotificationStore.ts`, `standards/vue/examples/FE-19/useMessageStore.ts`.

> **PROPOSED (adversarial review) — render the panel with `<MessageBar fixed>` (teleport on, slot content), not in place (finding 1).** Verified against the tree: `PageReadProgress.vue` renders `NotificationMessage` with the default `disableTeleport = false`, so today the panel teleports into `NotificationContainer` (`fixed inset-0 z-50 ... items-end`) and floats top-right, sharing the exact container the copy/language toasts use (`notification="main"`). The in-place (`teleport` off) choice renders the panel inline in the article body: a visitor-visible position change (and loss of the rounded floating toast shape), which contradicts the approved feature's "No other visitor-facing behavior changes" and "disappear without any visitor-visible loss". The rationale above conflates two independent axes: the store-vs-slot question (slot content is correct, to keep live values) and the teleport question (position). A `<MessageBar fixed>` with the default `teleport` on keeps the slot reactive across the teleport (live values preserved) and lands in the app-root `fixed` outlet, reproducing today's floating top-right position. The two migrated toasts already set `fixed: true` (via the store's `transient`), so they teleport to the same `fixed` outlet; the panel reusing it matches today exactly (they already share `NotificationContainer`). Dependency note to carry: ST-05's app-root `MessageBarOutlet` must position the `fixed` outlet like the retired `NotificationContainer` (fixed top-right, cleared below the shrunk header via the mapped header-height offset). Amend AC3 and the "no visual delta" line to match, and flip the mapped test "should render the panel in place, not teleported" to assert the fixed/teleported placement with reactive values.

DECIDED (research): Adopted as proposed; AC 3, the edge cases, the "no visual delta" line and the QA plan now say `<MessageBar fixed>`, and the in-place test is flipped.
Why: verified in the tree: `PageReadProgress.vue` renders `NotificationMessage` (default `disableTeleport = false`, `NotificationMessage.vue` lines 14 and 61), which teleports to `[notification='main']` inside `NotificationContainer`, the same container the copy and language toasts use; so the panel floats top-right today and the approved feature promises no visitor-visible change. The reference `MessageBar` has `fixed` and a default slot, and routes `fixed` bars to the `fixed` outlet, which reproduces that. This contradicts no `DECIDED (maintainer)` entry; it corrects an earlier research decision.
Alternative: a standalone element with the alert classes; reversing is a local edit to one component.
Sources: `src/app/components/content/PageReadProgress.vue`, `src/app/components/NotificationMessage.vue`, `src/app/components/NotificationContainer.vue`, `standards/vue/examples/FE-19/MessageBar.vue` (`fixed` prop, outlet selection), feature spec Functional overview.

Dependencies: ST-05 (MessageBar infrastructure and app-root outlet must exist; the app-root `fixed` outlet must be positioned like the retired `NotificationContainer`, fixed top-right and cleared below the shrunk header, since `--app-header-height` is not defined in this project and the header exposes `--headerHeight`/`--reduceHeaderHeight`; ST-05's manual check M7 verifies this, and if the offset is still unmapped when this story starts, it is mapped in the outlet here before the panel relies on it; and the hard dependency on ST-05 AC 15, the widening of the store's `closeIn` to `number`, without which the 3000 ms and 4000 ms durations do not typecheck). Ordered after ST-05 and before ST-07, ST-08, ST-09, ST-10 and ST-11 so those re-verify against the final tree and so the retired baselines are deleted from git rather than moved to object storage by ST-10. No release bookkeeping. Documentation: `specs/components.md` Removed deltas and the AppHeader prop change are carried here (the Added deltas are carried by ST-05).

## QA plan

Planned against the current tree plus the ST-05 reference (`MessageBar`, `MessageBarOutlet`, `MessageBarContext`, `useMessageStore` do not exist in `src/` yet; ST-05 is a dependency). Conventions followed: Vitest `nuxt` project for anything touching `useI18n`/Nuxt (`*.nuxt.test.ts`), `describe('<lowerCamelName>')` plus `it('should ...')`, assert behaviour (store contents, rendered text, DOM presence), never markup snapshots, no spec ids in test names or comments. Tests that read messages use the real `useMessageStore` and reset it in `beforeEach` via `clearAll()`; the pinia import path is `~/composables/destructiblePinia` as it is now (ST-07 renames it and fixes imports).

### Findings on the acceptance criteria (rewrite proposals, flagged for the maintainer)

1. **(resolved) Auto-dismiss durations cannot stay "the same" with the reference store as written.** Today `CodeGroup` closes in 3000 ms and the language notice in 4000 ms. The reference `MessageDuration`/`MessageDurationValue` only allows 0, 2000, 5000, 10000, so `addSuccess(text, { closeIn: 3000 })` does not typecheck. Decided (research, above): the consumers keep 3000 and 4000, and ST-05 widens `closeIn` to `number` (ST-05 AC 15). AC 1 and AC 2 say so. The tests below assert exactly 3000 and 4000.
2. **(resolved) AC6 "a dismissed message is removed" is not literally true for the reference store.** `close(id)` sets `closed = true` and leaves the entry in `messages`; only `clearInstance` removes entries. AC 6 now reads "no longer rendered and flagged closed"; tests assert both.
3. **Persistence differs from today.** `addSuccess`/`addInfo` set `persist: true`, so the toast now survives the unmount of the component that added it, while the old store cleared it on unmount. Treated as an accepted improvement (a copy toast should not vanish on navigation); pinned by a test so it is a conscious choice. If the maintainer wants the old behaviour, the consumers pass `persist: false`.
4. **AC4 asks to update `AppHeader.nuxt.test.ts` and `AppHeader.stories.ts`, but neither references `notifications` today.** Nothing to change there beyond keeping them green; the removal is proven by typecheck plus the new "renders no notification host" test.
5. **(resolved) AC5/AC7 search scope was too narrow.** Stale references also exist in `README.md` (lines 141 to 175, a `useNotificationStore` code sample and the `:notifications` binding), `docs/design/tokens.css` (line 44 comment naming AlertBar and NotificationMessage), and `specs/components.md` (line 58 AppHeader `notifications?`, line 211 AppHeaderContext "fetches navigation/notifications"). AC 5 and AC 7 now cover the whole repo outside `specs/FEAT-001-*` and `node_modules`, and require the README sample and the tokens comment to be updated. Also `notification.error.unknown` (only used by the deleted `addError`) becomes an orphan locale key in `en`, `nl`, `de`; `pnpm dev`/`i18n-extract` drops it, so it is checked (AC 5).
6. **(resolved) PageReadProgress must keep its floating position.** Today `NotificationMessage` is used there with teleport on, so the panel floats top-right as a fixed toast, with the rounded toast shadow (a non-fixed `MessageBar` is flat with a left border, so `fixed` is also what keeps the look). Decided (research, above): `<MessageBar fixed>` with the default teleport keeps the exact position and live values (slot content stays reactive across a teleport). The plan tests the fixed, teleported placement with reactive values and records the position check as a manual comparison against `main`.
7. **The mobile-menu z-order edge case needs a baseline measurement first.** The old container lives inside `<header class="sticky z-20">` (a stacking context) while the headless-ui dialog portals to `body` at `z-50`, so today a toast may already sit below the open menu. The expected result is "equal to today", so the verifier records the behaviour on `main` before judging. The new outlet is a root sibling at `z-50` and its top offset uses `--app-header-height`, which this project does not define (the header exposes `--headerHeight`/`--reduceHeaderHeight`); the offset must be mapped (ST-05 manual check M7; see Dependencies), and the old container's `pt-[var(--reduceHeaderHeight)]` offset (toast clears the shrunk header) must be matched. Verified manually (layout is not measurable in happy-dom).
8. **Messages-before-outlet edge case has a real failure path in the reference.** `MessageBar` reads `currentOutlets()` once at setup; if a bar is set up before any outlet registered, `main` is undefined and the teleport target stays `[data-message-outlet='undefined']`. `addMessage` awaits one tick, which hides this in practice, but a test pins it (see unit tests).

### Acceptance criteria to test mapping

| AC | Test | Kind | File (new or changed) |
|---|---|---|---|
| 1 | `codeGroup` `should add a success message with the copied text when the copy button is clicked`; `should add the message with a closeIn of 3000`; `should pass the active tab code to the clipboard`; `should keep the message after the code group unmounts` | component (nuxt) | new `src/app/components/content/CodeGroup.nuxt.test.ts` |
| 1 (timing) | `copy toast disappears on its own` (click copy, expect `getByRole('alert')` visible with the text, then hidden within closeIn plus margin) | E2E, chromium only | new `src/app/tests/playwright/messages.spec.ts` |
| 2 | `appHeaderContext` `should add an info message when the language changes to a non default language`; `should not add a message when the language changes to the default language`; `should add the message only after the locale switch completed`; `should use a closeIn of 4000` | context (nuxt) | extend `src/app/contexts/AppHeaderContext.nuxt.test.ts` |
| 2 (integration) | `language notice appears after switching to nl and not after switching back to en` | E2E, chromium only | `messages.spec.ts` |
| 3 | `pageReadProgress` `should show no panel until the button is clicked`; `should show word count, reading time, time progress, scroll progress and reading stage when opened`; `should hide the panel when the button is clicked again`; `should render the panel as a fixed message teleported into the fixed outlet` (found in the harness's fixed outlet, not inside the mounted wrapper); `should add nothing to the message store`; `should update the panel when the tracked values change` (live values, the reason for rendering the content through the slot); `should no longer import NotificationMessage` is covered by the AC5 search gate | component (nuxt) | new `src/app/components/content/PageReadProgress.nuxt.test.ts` (mock `useReadProgressTracking` with refs) |
| 3 (position) | the panel floats top-right below the shrunk header, same as `main` (record on `main` first) | manual | checklist item 6 |
| 3 (open/close) | click the panel itself, then click the button: panel behaves exactly as on `main` (record on `main` first; click-dismiss leaves `showProgress` true, so the next button click toggles to hidden and the one after reopens) | manual | checklist |
| 4 | `appHeader` `should not render a notification host or alert`; existing three tests stay green unchanged; prop removal proven by `pnpm ci:typecheck` (a leftover `notifications` binding in `AppHeaderContext.vue` fails vue-tsc) | component (nuxt) + typecheck | `AppHeader.nuxt.test.ts` |
| 4 (story) | `AppHeader.stories.ts` unchanged and still builds; `header--default` baseline unchanged | visual | `components.spec.ts` (existing entry) |
| 5 | repo search returns nothing (see gate commands below), including `README.md` and `docs/design/tokens.css`; file deletions confirmed; the 10 retired PNGs deleted: `alert--default-{chromium,firefox,webkit,Mobile-Chrome,Mobile-Safari}.png` and `notificationmessage--default-{chromium,firefox,webkit,Mobile-Chrome,Mobile-Safari}.png`; both ids removed from the `components.spec.ts` array (`alert--default`, `notificationmessage--default`); no orphan `notification.error.unknown` key | static gate | n/a |
| 6 | the CodeGroup, AppHeaderContext and PageReadProgress tests above, plus the dismissal tests: `messageBar harness` `should stop rendering a message once it is closed and flag it closed` and `should not lose a message added before the outlet mounted` | context/integration (nuxt) | new `src/app/tests/helpers/messageBarHarness.ts` (reuse ST-05's harness if it already added one) used by the three test files; the generic store behaviours (add, persist, clear on unmount, per-instance isolation) that `useNotification.nuxt.test.ts` covered are owned by ST-05's `useMessageStore` tests and must exist before this story deletes the old file |
| 7 | `specs/components.md` edits checked by search and by reading the diff: four entries removed, AppHeader line drops `notifications?`, AppHeaderContext line no longer says notifications, `useNotificationStore` absent, `PageReadProgress` entry description still true | doc gate | n/a |
| 8 | `pnpm lint:fix`, `pnpm ci:typecheck`, `pnpm ci:test`, `pnpm playwright:docker`; after the Playwright run `git status` under `src/app/tests/playwright/` shows only the 10 deletions (no modified, no new PNG, no `test-results` diff images) | pipeline | n/a |

### Unit and component test detail

- **Harness (new fixture).** A small mount helper that renders `MessageBarContext` wrapping one `MessageBarOutlet` and a `v-for` of `MessageBar` over `useMessageStore().messages`, mirroring the app root, so tests assert what the visitor would see (`[role="alert"]` text) and not only store state. Lives in `src/app/tests/helpers/` and is shared with ST-05's tests if they already created one.
- **Existing fixtures reused:** `mountSuspended`, `mockNuxtImport` (`useContentNavigationContext`, and `useI18n` only if the real catalog is not loaded in the nuxt project), the `AppHeaderContext` mock pattern already in `AppHeaderContext.nuxt.test.ts`, `setActivePinia(createPinia())` as in the deleted test.
- **CodeGroup:** mock `useClipboard` from `@vueuse/core` (spy `copy`, `isSupported` true) because the real clipboard is unavailable in happy-dom; the default slot is supplied as vnodes carrying `code` and `filename` props. The copy button sits inside `ClientOnly`, so wait for it with `vi.waitFor`. `addMessage` awaits a tick, so flush before asserting. The empty-code guard in `copy()` is unreachable through the UI (the button is hidden without code); cover it through `wrapper.vm.copy('')` asserting no message and no clipboard call, otherwise it is a knowingly uncovered branch.
- **AppHeaderContext:** emit `update:language` from the `AppHeader` component and await the real `setLocale` (or a spy on the i18n instance if lazy locale loading is slow); assert the message text equals the `notifications.info.languageAiTranslated` English copy. Ordering test: the message must not exist before `setLocale` resolves.
- **Auto-dismiss in unit tests:** `useAnimate` depends on the Web Animations API, which happy-dom does not provide, so the countdown is not unit-testable. Unit tests assert the `closeIn` stored on the message; real timing is covered by the E2E test and the manual list.
- **Messages before outlet:** add a message from a sibling that sets up before the outlet registers and assert it still renders after mount; if the target stays `undefined` this is a defect to fix in the ST-05 adaptation or here.

### UI states (from the feature states policy)

Slice is a notification surface, so the assertions are by severity and lifecycle, not data states:
- Success (copy) and info (language notice): shown, auto-dismissed, dismissed by click, dismissed by close button, hover pause (manual).
- Info panel (reading progress): closed (initial), open, open with changing values. No loading, empty or error state applies; the translated `errors.*` buckets belong to ST-05.
- Light and dark mode for all three consumers (manual, plus the existing header baseline).

### Stack-specific regression classes

- Reactivity: the destructured `useMessageStore` result must stay reactive (the reason for `defineDestructibleStore`). Test: add through one `useMessageStore()` instance, read `messages` through another and through the harness, and expect the rendered bar to appear without a manual refresh. Reading-progress panel must update from refs (live values test).
- Render counts: the panel's `MessageBar` registers with the context registry on setup; test that opening and closing the panel repeatedly leaves no stale registered message (outlet registry does not grow), by asserting a single `[role="alert"]` in the fixed outlet after open, close, open.
- Async: `addMessage` awaits a tick; tests await before asserting. No cancellation concerns in this slice.
- Teleport and SSR: statically generated pages now contain the outlet; verified by the post-`pnpm generate` checks in the manual list (no hydration mismatch warnings, no leftover `notification="main"` or `alert-bar` attributes in `dist` HTML).

### New E2E spec (no screenshots, so no baselines)

`src/app/tests/playwright/messages.spec.ts`, chromium only (pattern already used by the language tests in `pages.spec.ts`), selectors by role and visible text since test ids arrive with ST-09 (ST-09 then converts them). Cases: copy toast on a post with a code block (appears, then disappears), language notice after switching to `nl` and none when returning to `en`, reading-progress panel opens and closes on the post that uses it (the English `posts/3` content) and shows as a floating alert. The panel has no E2E or visual coverage today (`pages.spec.ts` only visits post 2), so this closes the "existing coverage still passes" edge case, which is otherwise vacuous. Flakiness risk: clipboard permission differs per browser, hence chromium only; the toast is added regardless of clipboard success (the `copy` call is not awaited), so no permission grant is needed for the assertion.

### Coverage

- Gate: `pnpm ci:test` coverage at or above the `main` baseline (`vitest.config.ts` thresholds currently 69.11/66.52/64.87/69.18 with `autoUpdate`; expect the file to be rewritten if numbers rise, which is acceptable, but a drop fails).
- Expectation: deleting `AlertBar`, `AlertBarContainer`, `NotificationMessage`, `NotificationContainer` removes uncovered code from the denominator (they were only visually tested), while deleting `useNotificationStore.ts` removes well-covered code, so the net is near neutral. The new CodeGroup, PageReadProgress and AppHeaderContext tests add covered lines, tipping it positive. Verify with the coverage text report, not by assumption.
- Knowingly uncovered: the `useAnimate` countdown and teleport layout (happy-dom limits, covered by E2E and manual), and the empty-code guard in `copy()` if the `wrapper.vm` call is not used.

### Environment and tooling quirks

- Run unit tests with `TZ=Europe/Amsterdam` (baked into `pnpm test`/`pnpm ci:test`); single files: `TZ=Europe/Amsterdam npx vitest run <file>`.
- Do not regenerate or hand-edit any baseline. Retired PNGs are deleted only; the `block-snapshot-image-edits.sh` hook blocks `Write|Edit` on them, not shell deletion, so use plain `rm` (the interactive-git hook blocks `git rm`/staging in an interactive session, and staging is the maintainer's anyway). The remaining baselines must verify unchanged in the jammy container (`pnpm playwright:docker`); if Docker is unavailable, push and use the CI path, never `--update-snapshots`.
- `node_modules` must be installed before any run (`pnpm install`). Run `pnpm dev` once so i18n-extract resyncs locale files (orphan key removal) before typecheck.

### Gate commands for the static criteria

- AC5 search (should print nothing): search `src/`, `README.md`, `docs/`, `specs/components.md` for `useNotificationStore|AlertBar|NotificationMessage|NotificationContainer|alert-bar|notification="main"|notificationmessage|alert--default`.
- File checks: the six source files, two stories, one test file and ten PNGs are gone; `components.spec.ts` array no longer lists the two ids.
- Locale check: `notification.error.unknown` absent from `en.json`, `nl.json`, `de.json`; `notifications.info.languageAiTranslated` and the `pageReadProgress.*` keys still present in all three.
- `AppHeader.vue`: no `Notification` import, no `notifications` prop or default, no `NotificationContainer`/`NotificationMessage` markup, no `pt-[var(--reduceHeaderHeight)]` leftover.

### Regression risk

- **Touched flows:** every page (outlet now in the app root HTML), the header (markup removed), code blocks in all posts, language switching, the post using `PageReadProgress`.
- **Other stories:** ST-05 (must have shipped the outlet in `app.vue`, the `~/` aliases, the numeric `closeIn` typing (ST-05 AC 15, hard dependency) and the header-offset variable before this story starts); ST-07 (renames the `destructiblePinia` import used by the new tests, so rename-only diffs touch them); ST-08 (edits `AppHeader.vue` hardcoded strings, same file as this story's prop removal, so order and re-verify); ST-09 (converts selectors and `data-testid`s on `MessageBar`, including this story's E2E selectors); ST-10 (relies on the 10 PNGs being deleted here, not moved to object storage); ST-11 (adds the `MessageBar` stories; nothing here adds one).
- **Guarding tests today:** `AppHeader.nuxt.test.ts`, `AppHeaderContext.nuxt.test.ts`, `useReadProgressTracking.nuxt.test.ts`, `useReadProgress.nuxt.test.ts`; visual guards `header--default` and `pages.spec.ts` (about, portfolio, post 2, nl and de about). No test guards CodeGroup or PageReadProgress today, hence the new ones.
- **Visual risk:** the empty outlet `div`s must not add layout height or gap to pages (the root is `flex flex-col`); `maxDiffPixels: 1000` would hide small shifts, so the manual check compares the top of the page against `main`.

### Manual verification checklist (light and dark mode, desktop and mobile widths)

1. Record `main` behaviour first for items 2 to 6 (screenshots of position, offset, stacking) so "same as before" is measurable.
2. Copy a code block: toast appears top-right below the (possibly shrunk, scrolled) header with the same text, auto-dismisses after the decided duration, pauses on hover, closes on click and on the close button; the text now renders as the message body rather than a bold title (confirm acceptable).
3. Switch language to nl and de: AI-translated notice shows with the same text and duration; switching to en shows nothing.
4. Open the mobile menu and trigger a toast (copy cannot be clicked behind the dialog, so switch language from the menu): compare stacking and visibility with `main`.
5. Two toasts at once (copy twice quickly, copy then language switch): they stack without overlapping or being lost.
6. Reading-progress panel on the English, Dutch and German versions of post 3: button label, open and close, all five lines present, values change while scrolling and reading, look in both color modes, and confirm the panel is still the floating top-right toast, same position and shadow as on `main` (recorded in item 1), with values updating live.
7. `pnpm generate` then `pnpm preview`: no hydration warnings in the browser console, no `alert-bar` or `notification="main"` in the built HTML, Cloudflare route check (`verify-cf-routes`) still passes.
8. Storybook (`pnpm storybook`): header story renders, no story errors, no AlertBar or NotificationMessage entries left in the sidebar.
9. Cloudflare Pages PR preview: repeat items 2, 3 and 6 on `https://pr-<PR-number>.bach.software`.

## Adversarial review
Lite, story level: blockers first, then the flagged items confirmed or settled.

1. **(blocker) The DECIDED in-place `PageReadProgress` render moves the panel and contradicts the approved feature's no-visible-loss promise.** Verified: `PageReadProgress.vue` uses `NotificationMessage` with the default `disableTeleport = false`, so the panel teleports into `NotificationContainer` and floats top-right today; the DECIDED in-place (`teleport` off) render puts it inline in the article body. The approved feature states "No other visitor-facing behavior changes" and that the retired components "disappear without any visitor-visible loss", so this is a silent local override of an approved, binding statement, not a free story-level choice. Routed: PROPOSED (adversarial review) edit on the DECIDED (research) block above, switching to `<MessageBar fixed>` (teleport on, slot content) which preserves both the floating top-right position and the live reactive values, with the ST-05 fixed-outlet positioning dependency spelled out. QA finding 6 already surfaced this for the maintainer but the story still plans/tests the in-place behaviour; this elevates it to a blocker and gives a concrete fix.

   DECIDED (research): Resolved by adopting the PROPOSED edit above; AC 3, the edge cases, the design reference and the QA plan now describe `<MessageBar fixed>`. No stale in-place or teleport-off text remains for `PageReadProgress`.

2. **(should-fix) AC1/AC2 "same auto-dismiss behaviour as today" is not satisfiable with the ST-05 store as written.** Verified: `CodeGroup.vue` uses `closeIn: 3000`, `AppHeaderContext.vue` uses `closeIn: 4000`, but the reference `MessageDurationValue` only admits `0 | 2000 | 5000 | 10000`, so neither call typechecks. QA finding 1 already routes a proposed AC1/AC2 rewrite, but the actual value decision (widen `closeIn` to `number`/add 3000+4000, vs accept 5000) is still open and, if 3000/4000 are kept, requires a type change in ST-05 (a dependency, outside this story's listed files). Needs a maintainer decision recorded before implementation; the dependency on ST-05 for this must be made explicit.

   DECIDED (research): Keep 3000 ms and 4000 ms; ST-05 widens `closeIn` to `number` (ST-05 AC 15), recorded as a hard dependency in AC 1, AC 2 and Dependencies.
   Why: the approved feature says both toasts keep their behaviour, and the reference union is a typing detail of the reference, not a contract (see the DECIDED under the flagged discrepancy). No `DECIDED (maintainer)` entry is touched.
   Sources: `src/app/components/content/CodeGroup.vue`, `src/app/contexts/AppHeaderContext.vue`, `standards/vue/examples/FE-19/useMessageStore.ts`, feature spec Functional overview.

3. **(settled) AC6 "a dismissed message is removed" does not match the reference.** Confirmed: `close(id)` sets `closed = true` and leaves the entry in `messages`; only `clearInstance`/`clearAll` remove entries. QA finding 2 already rewrites AC6 to "no longer rendered and flagged closed" and the mapping tests both. No further edit needed.

4. **(settled) Stale references outside `src/` are correctly identified and complete.** Confirmed each: `README.md` lines 141 and 161-162 (`useNotificationStore` sample), `docs/design/tokens.css` line 44 (AlertBar/NotificationMessage comment), `specs/components.md` line 58 (AppHeader `notifications?`) and line 211 (AppHeaderContext "fetches navigation/notifications"), plus the `AlertBar`/`NotificationContainer`/`NotificationMessage` entries. QA finding 5 and the gate commands cover all of them, including the orphan `notification.error.unknown` locale key. Settled, and now carried by AC 5 and AC 7.

5. **(nit) Copy/language text moves from bold title to body.** `CodeGroup`/`AppHeaderContext` pass the text as the notification `title` today (bold); `addSuccess`/`addInfo` take it as `description` (body). QA manual item 2 already flags this as "confirm acceptable"; no action beyond that confirmation.

Status: both the blocker (finding 1) and the value decision (finding 2) are decided from research above; nothing is open, so the story stays at `awaiting-approval`.

## Implementation notes
Filled by developer during implementation: deviations from plan and why. Deviations that affect the feature design/architecture are also propagated to the feature spec.

- Migrated `CodeGroup` (`addSuccess`, `closeIn: 3000`), `AppHeaderContext` (`addInfo`, `closeIn: 4000`, handler renamed `setLocaleAndShowMessage`) and `PageReadProgress` (`<MessageBar severity="info" fixed>` with the panel in the default slot). `AppHeader` lost the `notifications` prop, the `Notification` import and both notification markup blocks.
- Deleted the four components, two stories, `useNotificationStore.ts`, `useNotification.nuxt.test.ts`, the two ids in `components.spec.ts` and the ten retired baseline PNGs (plain `rm`, nothing blocked). No other baseline was touched. `notification.error.unknown` was already gone (removed with `addError` earlier), so no locale edit was needed.
- Deviation (outlet CSS, permitted by the Dependencies section): the fixed outlet in `MessageBarOutlet.vue` used `top-16 right-4 w-96 p-1`, which did not match the retired `NotificationContainer` (top offset `0.65 * headerHeight`, right padding 1.5rem, cards up to `max-w-md`). Changed to `top-[calc(var(--headerHeight)*0.65)] right-6 w-[calc(100%-3rem)] max-w-md` so the toasts and the panel sit where they did on `main`. `--reduceHeaderHeight` is only defined on `header`, so the outlet derives it from `--headerHeight`. The sticky outlet is unchanged. Manual check M7/item 6 should still compare against `main`.
- Deviation (test fixture): the nuxt test project cannot read `~/locales/en.json` through the `translate` helper (it returns the key), so the new nuxt tests resolve copy through `useNuxtApp().$i18n.t`. The shared mount helper is new: `src/app/tests/helpers/messageBarHarness.ts`; ST-05 had no mount harness for messages.
- Dismissal tests live in `src/app/tests/nuxt/messageDismissal.nuxt.test.ts` (closed flag plus not rendered; message added by a sibling that sets up before the outlet still renders). The harness turns the `Transition` stub off so the close emit fires.
- New E2E `src/app/tests/playwright/messages.spec.ts` (chromium only). The language switcher button has no box of its own (flags are absolutely positioned) and its title follows the active language, so the spec clicks the flag svg found through a title regex.
- Persistence change (QA finding 3) accepted as planned: copy and language toasts now survive the unmount of the adding component.
- `vitest.config.ts` coverage thresholds were rewritten by `autoUpdate` on the coverage run (all files 84.52 / 79.68 / 82.75 / 84.62, above the baseline). Untracked `src/app/.nuxtrc` was not created by this story.
- Check results: `pnpm lint:fix` clean, `pnpm ci:typecheck` clean, `pnpm ci:test` 49 files / 456 tests passing, `pnpm playwright:docker` (jammy container) 110 passed, 80 skipped, no baseline modified or added (git shows only the 10 deletions). One earlier full run had a webkit `responsiveimage--default` screenshot flake ("two consecutive stable screenshots", unrelated to this slice); it passed on rerun and in the next full run. Not run: manual checklist (items 1 to 9), Storybook sidebar check, `pnpm generate`/`preview` hydration check (built `dist` contains no `alert-bar` or `notification="main"`), PR preview.

## Verification report

**Verdict: pass-with-notes.**

### Checks
- `pnpm lint:fix`: clean. `pnpm ci:typecheck`: clean.
- `pnpm ci:test`: 49 files, 456 tests passed. Coverage (`ci:test:coverage`) 84.52 / 79.68 / 82.75 / 84.62 (statements/branches/functions/lines), at or above the thresholds in `vitest.config.ts`, which are above the `main` baseline of 69.11 / 66.52 / 64.87 / 69.18 (the denominator also grew via earlier stories' `types/**` include).
- `pnpm playwright:docker` (jammy): 110 passed, 80 skipped. Re-run once more with `pnpm ci:playwright:docker`: 110 passed, 80 skipped. The webkit `responsiveimage--default` flake did not reproduce in two runs. `git status` under `src/app/tests/playwright/` shows only the 10 PNG deletions plus the `components.spec.ts` edit; no baseline modified or added.

### Acceptance criteria
| AC | Result | Evidence |
|---|---|---|
| 1 | pass | `CodeGroup.vue` uses `addSuccess(t('Copied to clipboard!'), { closeIn: 3000 })`; `closeIn?: number` in `useMessageStore.ts`; `CodeGroup.nuxt.test.ts` (closeIn 3000, copy, persist); in the built site two copy toasts appeared and were gone after 3.6 s while the panel stayed |
| 2 | pass | `AppHeaderContext.vue` `addInfo(..., { closeIn: 4000 })` only for non-default locale after `setLocale`; tests in `AppHeaderContext.nuxt.test.ts`; E2E `messages.spec.ts` passed |
| 3 | pass | `PageReadProgress.vue` is `<MessageBar severity="info" fixed>` with slot content, no store; built site: alert at top 52 px (0.65 x 80 px header), right 24 px, 448 px wide, both light and dark, values live (scroll progress 64.6/67.1% after scrolling) |
| 4 | pass | `AppHeader.vue` diff: no `notifications` prop, no `Notification` import, no container/message markup; typecheck clean; "should not render a notification host or alert" test |
| 5 | pass | repo search (`src`, `README.md`, `docs`, `specs/components.md`) for the four names plus `alert-bar`, `notification="main"`, `notificationmessage`, `alert--default` returns nothing; six source files, two stories, test file deleted; 10 PNGs deleted; both ids gone from `components.spec.ts`; `notification.error.unknown` absent in en/nl/de; README sample and `tokens.css` comment rewritten; `dist` has no `alert-bar` or `notification="main"` |
| 6 | pass | `CodeGroup.nuxt.test.ts`, `PageReadProgress.nuxt.test.ts`, `AppHeaderContext.nuxt.test.ts`, `messageDismissal.nuxt.test.ts` (closed flag, not rendered, message added before outlet mounts still renders); coverage not decreased |
| 7 | pass | `specs/components.md` diff read: four entries removed, AppHeader drops `notifications?`, AppHeaderContext line updated, `useNotificationStore` absent, MessageBar entries added |
| 8 | pass | see Checks |

Edge cases: toasts and the panel share the fixed outlet and stack with a 12 px gap without overlap (screenshot with panel plus two copy toasts); messages before outlet mount covered by test; mobile menu: a toast raised from the open menu sits behind the dialog (`elementFromPoint` is not the alert), consistent with `main` by CSS (old container lived in the `z-20` header, below the `z-50` dialog; new outlet is `z-50` earlier in the DOM than the dialog portal). Not measured on a `main` build.

### Deviation judgment (fixed outlet CSS)
Accepted. `MessageBarOutlet.vue` fixed outlet is `top-[calc(var(--headerHeight)*0.65)] right-6 w-[calc(100%-3rem)] max-w-md`; the retired container was `fixed inset-0 z-50 p-6` with `pt-[var(--reduceHeaderHeight)]` (0.65 x headerHeight) and cards `max-w-md`. Measured values match (top 52, right 24, width 448). Classes only; no `:style` or `style=` in any touched file.

### Notes (non-blocking)
1. Visual delta inherited from ST-05's alert look: info and success bars are now `bg-blue-50`/`bg-green-50` in light mode where the old toasts and the panel were `bg-white`. Maintainer to confirm acceptable (the spec's item 2 confirmation).
2. Stack gap is 12 px (`mb-3`) vs about 16 px before (`gap-3` plus `mb-1`).
3. Manual checklist items not run by the verifier: nl/de panel text, hover pause, Storybook sidebar, Cloudflare PR preview (item 9). `src/app/.nuxtrc` is untracked and not from this story.
4. No spec ids found in code or test names. No release or documentation obligation beyond `components.md`, which is fulfilled.
