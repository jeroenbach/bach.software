# Component inventory

This file is a living registry. The developer agent MUST update it when adding or modifying shared components. The ui-designer and architect agents MUST consult it before proposing anything new.

Shared presentational components live in `src/app/components/` (props in, emits out, no side effects — see CLAUDE.md). Smart components and composables live in `src/app/contexts/` and are listed at the bottom. Nuxt Content MDC components live in `src/app/components/content/`.

## App404
- **Location:** components/App404.vue
- **Purpose:** Localized 404 page content, a thin wrapper around `AppError`.
- **Props / variants:** none (uses i18n keys internally).
- **Used for:** Not-found routes and missing content.

## AppBackground
- **Location:** components/AppBackground.vue
- **Purpose:** Page background wrapper that sets background and default text colors including dark mode.
- **Props / variants:** `background?: 'white' | 'gray'` (default `white`).
- **Used for:** Root wrapper in app.vue; per-page gray background via app.config.ts.

## AppButton
- **Location:** components/AppButton.vue
- **Purpose:** Minimal unstyled button wrapper (cursor + click emit).
- **Props / variants:** none; emits `click`. Default slot.
- **Used for:** Icon buttons like ColorModeSwitcher and mobile menu toggles.

## AppChip
- **Location:** components/AppChip.vue
- **Purpose:** Small rounded-full pill label.
- **Props / variants:** none; default slot; appearance composed by parent (see ChipLink).
- **Used for:** Technology tags, category labels.

## AppError
- **Location:** components/AppError.vue
- **Purpose:** Large error screen (big title, subtitle, description, back link) that also sets SEO meta.
- **Props / variants:** `title?`, `subTitle?`, `description?`, `linkText?`, `linkLocation?`.
- **Used for:** 404 and generic error pages (error.vue, App404).

## AppFooter
- **Location:** components/AppFooter.vue
- **Purpose:** Site footer with about text, avatar, and social links; supports a short variant.
- **Props / variants:** `title?`, `short?`, `linkedInUrl?`, `githubUrl?`, `imgSrc?`, `imgAlt?`, `backgroundColor?: 'white' | 'gray'`. Slot: `about`.
- **Used for:** Global footer, mounted via AppFooterContext.

## AppHeader
- **Location:** components/AppHeader.vue
- **Purpose:** Sticky site header with logo, navigation, mobile menu, color mode and language switchers; shrinks on scroll.
- **Props / variants:** `border?`, `navigation?: NavigationItem[]`, `colorMode?`, `language?`. Emits `update:colorMode`, `update:language`. Slots: `searchButton`, `searchModal`. Labels (navigation landmark, menu toggle, close menu) are translated.
- **Used for:** Global navigation, mounted via AppHeaderContext.

## AppHero
- **Location:** components/AppHero.vue
- **Purpose:** Hero section with intro line (accent color), title, subtitle, prose text, and round profile image.
- **Props / variants:** `intro?`, `title?`, `subTitle?`, `text?`, `imgSrc?`, `imgAlt?`. Default slot for prose body.
- **Used for:** Home page and landing sections.

## AppIcon
- **Location:** components/AppIcon.vue
- **Purpose:** Inline SVG brand icons.
- **Props / variants:** `icon: 'X' | 'Linkedin' | 'Whatsapp' | 'Email' | 'GitHub'`.
- **Used for:** ShareOn buttons and footer social links.

## AppImage
- **Location:** components/AppImage.vue
- **Purpose:** Thin wrapper around NuxtImg.
- **Props / variants:** `src?`, `alt?`, `width?`, `height?`, `sizes?`, `class?`, `loading?: 'lazy' | 'eager'`.
- **Used for:** Simple images like the header logo; prefer ResponsiveImage for content images.

## AppLink
- **Location:** components/AppLink.vue
- **Purpose:** Locale-aware link (NuxtLinkLocale) with gradient text color variants; renders a span when `to` is empty.
- **Props / variants:** `to?`, `text?`, `color?: 'gray' | 'blue' | 'default'`, `target?`, `title?`, `ariaLabel?` (sets `rel="noopener"` for `_blank`).
- **Used for:** All internal and external links.

## AppMarkdown
- **Location:** components/AppMarkdown.vue
- **Purpose:** Renders a markdown string to HTML (v-html) with list bullets restored.
- **Props / variants:** `text?: string`.
- **Used for:** Markdown fields inside structured data, e.g. CV descriptions.

## AppProse
- **Location:** components/AppProse.vue
- **Purpose:** Typography wrapper applying the project prose style (`prose prose-custom max-w-prose dark:prose-invert lg:prose-lg`).
- **Props / variants:** none; default slot.
- **Used for:** All long-form content: blog posts, hero text, page content.

## AppTransition
- **Location:** components/AppTransition.vue
- **Purpose:** Named Vue transition wrapper with predefined animations.
- **Props / variants:** `name: 'slide-up'`.
- **Used for:** Icon swaps like ColorModeSwitcher.

## AuthorInformation
- **Location:** components/AuthorInformation.vue
- **Purpose:** Author byline: avatar, linked name, LinkedIn, role/metadata line.
- **Props / variants:** `fullName?`, `role?`, `imageUrl?`, `homePage?`, `linkedIn?`, `baseDataTestid?` (default `author-information`; ids `-card`, `-name-link`, `-linkedin-link`, `-role-value`). Slots: `topLine`, `bottomLine`.
- **Used for:** Blog post header and post summaries.

## BlogPost
- **Location:** components/BlogPost.vue
- **Purpose:** Full blog post article: title, author, read stats, share buttons, rendered content.
- **Props / variants:** `post?: BlogPost` (undefined while loading), `baseUrl: string`, `reads?: PostReads` (view model `{ readCount?: number }` from `types/PostReads.ts`, mapped from the API's `PageReads` by `toPostReads` in `utils/postReadsUtil.ts`; the read count is hidden when absent or zero), `likes?: number | null`, `hasLiked?: boolean`. Emits `like`. Slot: `tableOfContents`.
- **Used for:** Blog post detail page.

## BlogPostSummary
- **Location:** components/BlogPostSummary.vue
- **Purpose:** Post card for list views: image, date, title, excerpt, author.
- **Props / variants:** `post: BlogPostSummary`, `baseDataTestid?` (default `blog-post-summary`; the article is the row container `<base>-row-<post id>`, so the author ids inside stay unique per row).
- **Used for:** Blog listing pages.

## BlogPosts
- **Location:** components/BlogPosts.vue
- **Purpose:** Grid/list layout wrapper for post summaries with top border.
- **Props / variants:** none; default slot.
- **Used for:** Wrapping a list of BlogPostSummary items.

## ChipLink
- **Location:** components/ChipLink.vue
- **Purpose:** AppChip wrapped in AppLink with the standard gray gradient chip styling.
- **Props / variants:** same props as AppLink (`to`, `text`, `target`, ...). Default slot.
- **Used for:** Clickable tags, e.g. technology chips in the CV linking to related posts.

## ColorModeSwitcher
- **Location:** components/ColorModeSwitcher.vue
- **Purpose:** Cycles color mode system → dark → light with animated icon swap (client-only); the button title is translated.
- **Props / variants:** `colorMode?: 'light' | 'dark' | 'system'` (default `system`), `baseDataTestid?` (default `color-mode-switcher`; the toggle is `<base>-toggle-button`). Emits `update:colorMode`.
- **Used for:** Header color mode toggle.

## CurriculumVitaeTable
- **Location:** components/CurriculumVitaeTable.vue
- **Purpose:** CV timeline: date column plus title/company, markdown description, and technology chips per entry.
- **Props / variants:** `curriculumVitae?: CurriculumVitaeItem[]`.
- **Used for:** The CV/resume page.

## LanguageSwitcher
- **Location:** components/LanguageSwitcher.vue
- **Purpose:** Locale dropdown for the three supported locales.
- **Props / variants:** `language?: LocalesCode` (default is the default locale), `baseDataTestid?` (default `language-switcher`; the toggle is `<base>-toggle-button`). Emits `update:language`.
- **Used for:** Header language selection.

## MessageBar
- **Location:** components/MessageBar.vue
- **Purpose:** Dismissible message bar in the site's alert look (light and dark) that teleports into the active `MessageBarOutlet`; optional auto-close countdown that pauses on hover.
- **Props / variants:** `severity?: 'success' | 'error' | 'warning' | 'info'` (default `error`), `description?`, `details?: { label?, values, indent? }[]` (one line per field), `closeIn?: number` (ms), `sticky?`, `fixed?` (floating card, top right; success and info float on a white card, error and warning stay tinted), `isClosable?`, `closeOnClick?`, `closed?`, `teleport?` (render in place when false), `baseDataTestid?` (default `message-bar`; ids `-card`, `-content-value`, `-close-button`). Emits `close`, `click`. Slot: default. Close button label via `$t('messageBar.close')`.
- **Used for:** Every user-visible message from `useMessageStore`, rendered once at the app root, including the copy confirmation, the language notice and the reading-progress panel.

## MessageBarOutlet
- **Location:** components/MessageBarOutlet.vue
- **Purpose:** Placeholder with three teleport targets (in-flow, sticky, fixed) that `MessageBar`s render into; the most recently mounted outlet receives new messages. Registers itself through the `messageBarRegistry` provided by `MessageBarContext` (`components/messageBarRegistry.ts`).
- **Props / variants:** `baseDataTestid?` (default `message-bar-outlet`; the three targets are `-main-panel`, `-sticky-panel`, `-fixed-panel`).
- **Used for:** Mounted once at the app root below the header; mount another inside a modal so its messages appear in the modal.

## PageContent
- **Location:** components/PageContent.vue
- **Purpose:** Standard page gutter wrapper (`px-4 lg:px-6`) with centered inner container; passes attrs to the inner div.
- **Props / variants:** none; default slot.
- **Used for:** Consistent horizontal padding for page sections and the footer.

## PortfolioGrid
- **Location:** components/PortfolioGrid.vue
- **Purpose:** Full-width gray band with a responsive card grid of portfolio items (hover dims siblings).
- **Props / variants:** `portfolio?: PortfolioItem[]` (items carry title, description, image, link, and grid placement classes).
- **Used for:** Portfolio section on the home/CV page.

## ResponsiveImage
- **Location:** components/ResponsiveImage.vue
- **Purpose:** Responsive image with per-breakpoint sizing (`partOfScreen*` fractions) and per-breakpoint aspect ratios; optional caption. The default choice for content images.
- **Props / variants:** `src?`, `alt?`, `caption?`, `partOfScreen`/`partOfScreenExtraSmall`…`partOfScreen2ExtraLarge` (fraction of viewport width per breakpoint), `aspectRatio`/`aspectRatioExtraSmall`…`aspectRatio2ExtraLarge`.
- **Used for:** Blog post images, avatars, portfolio images.

## SearchButton
- **Location:** components/SearchButton.vue
- **Purpose:** Header icon button that opens the search; its title shows the keyboard shortcut (⌘K on macOS, Ctrl+K elsewhere).
- **Props / variants:** none; emits `open` (not `click`).
- **Used for:** Default `searchButton` slot content of AppHeader; AppHeaderContext listens to `open`.

## SearchModal
- **Location:** components/SearchModal.vue
- **Purpose:** Search dialog with a query input, ranked results with sub-results and keyboard navigation (↑/↓/Enter), plus loading, unavailable and no-results messages.
- **Props / variants:** `open: boolean`, `query: string`, `results?: SearchResult[]`, `status?: 'idle' | 'loading' | 'unavailable'` (default `idle`; results win over any status message). Emits `update:query`, `close`.
- **Used for:** Site search, mounted via AppHeaderContext in the AppHeader `searchModal` slot; state comes from `useSearchContext`.

## ShareOn
- **Location:** components/ShareOn.vue
- **Purpose:** Row of round social share buttons (X, LinkedIn, WhatsApp, Email) with prefilled share URLs.
- **Props / variants:** `url: string`, `text?`, `icons?: Icon[]` (defaults to all four).
- **Used for:** Sharing blog posts.

## Content components (MDC, global in markdown)

## CodeGroup
- **Location:** components/content/CodeGroup.vue
- **Purpose:** Tabbed group of code blocks inside markdown content.
- **Props / variants:** used as `::code-group` MDC block; `baseDataTestid?` (default `code-group`; the copy button is `<base>-copy-button`; the root carries `<base>-row-<generated key>` so several groups in one post stay addressable).
- **Used for:** Multi-language / multi-file code samples in posts.

## PageReadProgress
- **Location:** components/content/PageReadProgress.vue
- **Purpose:** Reading progress indicator for content pages; the open panel is a directly rendered `<MessageBar fixed>` so it floats top-right with live values.
- **Props / variants:** `wordCount`, `readingTime`, `baseDataTestid?` (default `page-read-progress`; the toggle is `<base>-toggle-button`, its bar uses `<base>-message-bar`); used from markdown content.
- **Used for:** Blog posts.

## PostImage
- **Location:** components/content/PostImage.vue
- **Purpose:** Image component for markdown posts (wraps responsive image behavior for content).
- **Props / variants:** used as MDC component in posts.
- **Used for:** Images inside post markdown.

## Context layer (smart components/composables, `src/app/contexts/`)

Not presentational; listed for orientation. All data fetching and shared state belongs here (see CLAUDE.md).

- **AppHeaderContext.vue** — fetches navigation, wires color mode and language state into AppHeader and adds the AI-translated language notice through the message store.
- **AppFooterContext.vue** — provides footer data to AppFooter.
- **MessageBarContext.vue** — mounted once at the app root; tracks the active `MessageBarOutlet` and provides the placement registry to `MessageBar`/`MessageBarOutlet` (slot prop `hasMessagesInRootOutlet`).
- **useMessageStore** (`composables/useMessageStore.ts`) — instance-scoped message store (error, info, warning, success, grouping, `addOnce`, numeric `closeIn`); messages are removed when the adding component unmounts unless persisted. Rendered store-driven at the app root.
- **useApiState** / **useApiErrorReporter** (`composables/`) — wrap every backend call: errors are translated (`errors.<code>`, 502/503 to `errors.unavailable`, validation as one line per field) and reported to the message store.
- **useAuthorsContext.ts** — queries `authors_{locale}` collections.
- **useSearchContext.ts** — pagefind-backed search: query, results and a single `status` (`idle | loading | unavailable`, where `unavailable` is sticky for the session).
- **useBlogPostsContext.ts** — queries `posts_{locale}`, joins author data into posts.
- **useContentNavigationContext.ts** — builds navigation from content.
- **usePageReadsContext.ts** — fetches page read statistics from the backend API; failures surface through `useMessageStore`.
- **usePageLikesContext.ts** — fetches the like count and fires the like event; failures surface through `useMessageStore`.
- **usePagesContext.ts** — queries `pages_{locale}` collections.
