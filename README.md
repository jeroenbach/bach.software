# Bach.Software

Bach.Software is a personal blog and portfolio website that showcases modern web development practices. It's built with a hybrid architecture combining:

- **Frontend**: Nuxt 3 + Vue 3 + TypeScript for a fast, interactive user experience
- **Backend**: .NET 9 Azure Functions for serverless API functionality
- **Content**: Markdown-based blog posts with rich frontmatter
- **Deployment**: Static site generation with Azure Static Web Apps

## 🚀 Quick Start for Developers

### Prerequisites

- **Node.js** v18+
- **pnpm** v9+: use [nvm](https://nodejs.org/en/download) to install node v22 and pnpm v9. To install pnpm v9, execute `corepack use pnpm@latest-9`
- **.NET 9** (for backend development): install [dotnet](https://dotnet.microsoft.com/en-us/download)
- **Azure Functions Core Tools** (for local API development): install [azure functions core tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=macos%2Cisolated-process%2Cnode-v4%2Cpython-v2%2Chttp-trigger%2Ccontainer-apps&pivots=programming-language-csharp)

### Getting Started

```bash
# Clone and install dependencies
pnpm install

# Setup local environment variables
pnpm dev-setup

# Start development servers
pnpm dev              # Frontend (Nuxt)
pnpm dev:api          # Backend (.NET Azure Functions)

# Run tests
pnpm test             # Unit tests
pnpm playwright       # E2E tests

# Build and deploy
pnpm generate         # Generate static site
```

## 🧩 Architecture Overview

### Technology Stack

| What                   | Technology               | Why We Chose It                                            |
| ---------------------- | ------------------------ | ---------------------------------------------------------- |
| **Frontend Framework** | Nuxt 3 + Vue 3           | Excellent DX, SSG capabilities, Vue ecosystem              |
| **Language**           | TypeScript               | Type safety, better IDE support, fewer runtime errors      |
| **Styling**            | TailwindCSS              | Utility-first, consistent design system, great performance |
| **UI Components**      | PrimeVue + Custom        | Minimal usage, mostly custom implementations               |
| **Content**            | Nuxt Content             | Git-based CMS, markdown with Vue components                |
| **State Management**   | Pinia                    | Vue-native, TypeScript-first, great devtools               |
| **Testing**            | Vitest + Playwright      | Fast unit tests, reliable E2E testing                      |
| **Backend**            | .NET 9 + Azure Functions | Familiar stack, serverless benefits, excellent tooling     |

## 📁 Project Structure

```
bach.software/
├── src/app/                    # 🎨 Frontend Application
│   ├── components/            # 🧩 Reusable UI components
│   ├── contexts/              # 🔗 Data providers & business logic
│   ├── composables/           # 🪝 Vue composition functions
│   ├── content/               # 📝 Markdown blog posts & pages
│   ├── pages/                 # 🌐 Route-based page components
│   ├── types/                 # 📋 TypeScript type definitions
│   └── utils/                 # 🛠️ Helper functions
│
├── src/api/                   # ⚡ Backend API (.NET)
│   ├── Bach.Software.API/     # 🚀 Azure Functions & endpoints
│   ├── Bach.Software.Application/  # 💼 Business logic
│   ├── Bach.Software.Infrastructure/ # 🔌 External services
│   └── Bach.Software.Tests/   # 🧪 Backend tests
│
├── tests/                     # 🎭 E2E tests
├── docs/                      # 📚 Documentation
└── package.json               # 📦 Dependencies & scripts
```

## 🎯 Key Architectural Patterns

### 1. Context/Presentational Component Pattern

This is our **most important pattern** - it keeps components clean and testable.

#### Presentational Components (`src/app/components/`)

- **Pure UI components** that only care about display
- Receive data via props, communicate via events
- No external dependencies (no router, stores, APIs)
- Easy to test and document in Storybook

```vue
<!-- ✅ Good: BlogPost.vue -->
<script lang="ts" setup>
interface Props {
  post?: BlogPost;
  baseUrl: string;
}
defineProps<Props>();
</script>

<template>
  <article v-if="post">
    <h1>{{ post.title }}</h1>
    <ContentRenderer :value="post" />
  </article>
</template>
```

#### Context Components (`src/app/contexts/`)

- **Smart components** that handle business logic
- Fetch data, manage state, handle routing
- Provide data to presentational components
- Handle all external dependencies

```vue
<!-- ✅ Good: AppHeaderContext.vue -->
<script setup lang="ts">
// Context handles external dependencies
const { notifications } = useNotificationStore();
const { data: navigation } = await useContentNavigationContext();
const colorMode = useColorMode();
</script>

<template>
  <AppHeader
    :navigation="navigation"
    :notifications="notifications"
    :color-mode="colorMode.preference"
    @update:color-mode="colorMode.preference = $event"
  />
</template>
```

### 2. Composable Functions Pattern

We use Vue 3 composables for reusable business logic:

```typescript
// useNotificationStore.ts - Component-scoped notifications
export const useNotificationStore = () => {
  const notifications = ref<Notification[]>([]);

  const add = (
    severity: "info" | "warning" | "error" | "success",
    title: string,
  ) => {
    notifications.value.push({ severity, title });
  };

  // Auto-cleanup when component unmounts
  tryOnUnmounted(() => (notifications.value = []));

  return { notifications: readonly(notifications), add };
};
```

### 3. Content Management with Nuxt Content

Blog posts are written in Markdown with rich frontmatter:

```markdown
---
title: "My Awesome Blog Post"
description: "This post covers advanced Vue.js patterns"
authorName: jeroenbach
datePublished: 2024-10-19T10:10:00
category: Vue.js
keywords: [vue, typescript, patterns]
draft: false
---

# Hello World

This is a blog post with **markdown** formatting!
```

### 4. Type-Safe Development

Everything is strongly typed with TypeScript:

```typescript
// BlogPost.ts - Well-defined interfaces
export interface BlogPost extends BlogPostSummary {
  body: MarkdownRoot & {
    toc?: Toc;
  };
}

export interface BlogPostSummary extends Metadata {
  category?: string;
  keywords?: string[];
  authorName: string;
  author: Author;
  readingTime?: ReadingTime;
}
```

## 🛠️ Development Workflow

### Git Workflow

- **Main branch**: Production-ready code
- **Feature branches**: `feature/description-of-feature`
- **Commit messages**: Clear, descriptive messages
- **Pull requests**: Required for all changes, include tests and documentation

## 🧪 Testing Strategy

We use a comprehensive testing pyramid:

### Unit Tests (Vitest)

```bash
pnpm test              # Run in watch mode
pnpm ci:test           # Run once for CI
```

- Test composables and utility functions
- Test component logic in isolation
- Fast feedback during development

### Component Tests (Vitest + Vue Test Utils)

```typescript
// Test component behavior
describe("BlogPost", () => {
  it("should render post content", async () => {
    const wrapper = await mountSuspended(BlogPost, {
      props: { post: mockBlogPost, baseUrl: "https://example.com" },
    });

    expect(wrapper.find("h1").text()).toBe(mockBlogPost.title);
  });
});
```

### E2E Tests (Playwright)

```bash
pnpm playwright        # Run E2E tests
```

- Test complete user journeys
- Cross-browser compatibility
- Real user interactions

We also do screenshot testing for visual regressions. As the ci pipeline runs ubuntu, we included a ci:playwright:docker command
to run the tests in a docker container with the same environment as the ci pipeline. This way the screenshots don't have any font or layout discrepancies.

You can install colima to run docker lockally on macOS.

```bash
brew install colima docker docker-compose
colima start
```

From here you can run the playwright tests in docker with:

```bash
pnpm ci:playwright:docker
``` 

And update the snapshots with:

```bash
pnpm ci:playwright:docker:update
```

### Component Documentation (Storybook)

```bash
pnpm storybook         # Start Storybook dev server
```

- Visual component documentation
- Interactive component playground
- Regression testing for UI changes

## 📝 Content Management

### Writing Blog Posts

1. **Create markdown file** in `src/app/content/en/posts/`
2. **Add frontmatter** with required metadata
3. **Write content** using standard Markdown
4. **Add images** to `src/app/assets/images/posts/[post-number]/`
5. **Preview locally** with `pnpm dev`

### Content Structure

- **Posts**: `src/app/content/en/posts/[number].md`
- **Pages**: `src/app/content/en/pages/[name].md`
- **Authors**: `src/app/content/en/authors/[username].yaml`

## 🚀 Deployment

The site uses Azure Static Web Apps with automatic deployment:

1. **Push to main** triggers automatic deployment
2. **Build process**: i18n extraction → Nuxt generate → Storybook build
3. **Static files** deployed to CDN
4. **Azure Functions** handle API requests

## 📚 Additional Resources

- **Vue 3 Documentation**: https://vuejs.org/
- **Nuxt 3 Documentation**: https://nuxt.com/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **TailwindCSS Documentation**: https://tailwindcss.com/docs
- **Vitest Documentation**: https://vitest.dev/
- **Playwright Documentation**: https://playwright.dev/
