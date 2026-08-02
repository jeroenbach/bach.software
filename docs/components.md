# Component inventory

This file is a living registry. The developer agent MUST update it when adding or modifying shared components. The ui-designer and architect agents MUST consult it before proposing anything new.

Shared presentational components live in `src/app/components/` (props in, emits out, no side effects — see CLAUDE.md). Smart components and composables live in `src/app/contexts/` and are listed at the bottom. Nuxt Content MDC components live in `src/app/components/content/`.

## AlertBar
- **Location:** components/AlertBar.vue
- **Purpose:** Dismissible inline alert banner that teleports into the `AlertBarContainer` placeholder.
- **Props / variants:** extends `Notification` (severity: `success` | `error` | `warning` | `info`, message); `title?`, `disableTeleport?`. Emits `close`. Slots: `left` (icon override), default.
- **Used for:** Page-level status messages (success/error/warning/info) below the header.

## AlertBarContainer
- **Location:** components/AlertBarContainer.vue
- **Purpose:** Teleport target (`alert-bar="main"`) where AlertBar instances render, with `aria-live="assertive"`.
- **Props / variants:** none.
- **Used for:** Mounted once in the layout to host alert bars.

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
- **Props / variants:** `border?`, `navigation?: NavigationItem[]`, `notifications?`, `colorMode?`, `language?`. Emits `update:colorMode`, `update:language`.
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
- **Props / variants:** `fullName?`, `role?`, `imageUrl?`, `homePage?`, `linkedIn?`. Slots: `topLine`, `bottomLine`.
- **Used for:** Blog post header and post summaries.

## BlogPost
- **Location:** components/BlogPost.vue
- **Purpose:** Full blog post article: title, author, read stats, share buttons, rendered content.
- **Props / variants:** `post?: BlogPost` (undefined while loading), `baseUrl: string`, `pageReads?: PageReads`.
- **Used for:** Blog post detail page.

## BlogPostSummary
- **Location:** components/BlogPostSummary.vue
- **Purpose:** Post card for list views: image, date, title, excerpt, author.
- **Props / variants:** `post: BlogPostSummary`.
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
- **Purpose:** Cycles color mode system → dark → light with animated icon swap (client-only).
- **Props / variants:** `colorMode?: 'light' | 'dark' | 'system'` (default `system`). Emits `update:colorMode`.
- **Used for:** Header color mode toggle.

## CurriculumVitaeTable
- **Location:** components/CurriculumVitaeTable.vue
- **Purpose:** CV timeline: date column plus title/company, markdown description, and technology chips per entry.
- **Props / variants:** `curriculumVitae?: CurriculumVitaeItem[]`.
- **Used for:** The CV/resume page.

## LanguageSwitcher
- **Location:** components/LanguageSwitcher.vue
- **Purpose:** Locale dropdown for the three supported locales.
- **Props / variants:** `language?: LocalesCode` (default is the default locale). Emits `update:language`.
- **Used for:** Header language selection.

## NotificationContainer
- **Location:** components/NotificationContainer.vue
- **Purpose:** Fixed, full-screen teleport target (`notification="main"`) for toast notifications, with `aria-live="assertive"`.
- **Props / variants:** none.
- **Used for:** Mounted once in the layout to host NotificationMessage toasts.

## NotificationMessage
- **Location:** components/NotificationMessage.vue
- **Purpose:** Toast notification that teleports into NotificationContainer.
- **Props / variants:** extends `Notification` (severity, title, message); `disableTeleport?`.
- **Used for:** Transient feedback messages.

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

## ShareOn
- **Location:** components/ShareOn.vue
- **Purpose:** Row of round social share buttons (X, LinkedIn, WhatsApp, Email) with prefilled share URLs.
- **Props / variants:** `url: string`, `text?`, `icons?: Icon[]` (defaults to all four).
- **Used for:** Sharing blog posts.

## Content components (MDC, global in markdown)

## CodeGroup
- **Location:** components/content/CodeGroup.vue
- **Purpose:** Tabbed group of code blocks inside markdown content.
- **Props / variants:** used as `::code-group` MDC block.
- **Used for:** Multi-language / multi-file code samples in posts.

## PageReadProgress
- **Location:** components/content/PageReadProgress.vue
- **Purpose:** Reading progress indicator for content pages.
- **Props / variants:** used from markdown content.
- **Used for:** Blog posts.

## PostImage
- **Location:** components/content/PostImage.vue
- **Purpose:** Image component for markdown posts (wraps responsive image behavior for content).
- **Props / variants:** used as MDC component in posts.
- **Used for:** Images inside post markdown.

## Context layer (smart components/composables, `src/app/contexts/`)

Not presentational; listed for orientation. All data fetching and shared state belongs here (see CLAUDE.md).

- **AppHeaderContext.vue** — fetches navigation/notifications, wires color mode and language state into AppHeader.
- **AppFooterContext.vue** — provides footer data to AppFooter.
- **useAuthorsContext.ts** — queries `authors_{locale}` collections.
- **useBlogPostsContext.ts** — queries `posts_{locale}`, joins author data into posts.
- **useContentNavigationContext.ts** — builds navigation from content.
- **usePageReadsContext.ts** — fetches page read statistics from the backend API.
- **usePagesContext.ts** — queries `pages_{locale}` collections.
