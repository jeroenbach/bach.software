# Bach.Software

Bach.Software is a personal blog and portfolio website that showcases modern web development practices. It's built with a hybrid architecture combining:

- **Frontend**: Nuxt 4 + Vue 3 + TypeScript for a fast, interactive user experience
- **Backend**: .NET 9 ASP.NET Core Web API running in Kubernetes (AKS)
- **Content**: Markdown-based blog posts with rich frontmatter
- **Deployment**: Static site generation for the frontend; containerised API deployed to AKS via Helm

## 🚀 Quick Start for Developers

### Prerequisites

- **Node.js** v18+
- **pnpm** v10+: use [nvm](https://nodejs.org/en/download) to install node v22 and pnpm v10. To install pnpm v10, execute `corepack use pnpm@latest-10`
- **.NET 9** (for backend development): install [dotnet](https://dotnet.microsoft.com/en-us/download)
- **Docker + Colima** _(optional, macOS — only needed for manual API deployment)_: `brew install colima docker`
- **kubectl + Helm** _(optional — only needed for manual deployment to AKS)_: `brew install kubectl helm`

### Getting Started

```bash
# Clone and install dependencies
pnpm install

# Setup local environment variables
pnpm dev-setup

# Start development servers
pnpm dev              # Frontend (Nuxt + i18n extract)
pnpm dev:api          # Backend (ASP.NET Core Web API on http://localhost:8080)

# Run the API in Docker locally
pnpm docker:api:build # Build Docker image (starts Colima automatically)
pnpm docker:api:run   # Run Docker image on port 8080 with .env.local

# Run tests
pnpm test             # Unit tests (watch mode)
pnpm ci:test          # Unit tests (single run, for CI)
pnpm playwright       # E2E tests

# Code quality
pnpm lint             # Lint
pnpm check            # Lint + typecheck

# Build and preview
pnpm generate         # Generate static site
pnpm preview          # Preview the generated site locally
```

## 🧩 Architecture Overview

### Technology Stack

| What                   | Technology               | Why We Chose It                                            |
| ---------------------- | ------------------------ | ---------------------------------------------------------- |
| **Frontend Framework** | Nuxt 4 + Vue 3           | Excellent DX, SSG capabilities, Vue ecosystem              |
| **Language**           | TypeScript               | Type safety, better IDE support, fewer runtime errors      |
| **Styling**            | TailwindCSS              | Utility-first, consistent design system, great performance |
| **UI Components**      | Element Plus + Custom    | Minimal usage, mostly custom implementations               |
| **Content**            | Nuxt Content             | Git-based CMS, markdown with Vue components                |
| **State Management**   | Pinia                    | Vue-native, TypeScript-first, great devtools               |
| **Testing**            | Vitest + Playwright      | Fast unit tests, reliable E2E testing                      |
| **Backend**            | .NET 9 + ASP.NET Core    | Familiar stack, containerised, runs on Kubernetes (AKS)    |
| **Infrastructure**     | Kubernetes + Helm        | Portable deployments, rolling updates, easy rollbacks      |

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
│   ├── Bach.Software.Web/     # 🚀 ASP.NET Core Web API & endpoints
│   ├── Bach.Software.Application/  # 💼 Business logic
│   ├── Bach.Software.Infrastructure/ # 🔌 External services (Plausible)
│   ├── Bach.Software.Tests/   # 🧪 Backend tests
│   ├── Dockerfile             # 🐳 Container image definition
│   ├── Makefile               # 🛠️ Build & deploy commands
│   └── version.txt            # 🔖 Current API version
│
├── k8s/                       # ☸️ Kubernetes / Helm chart
│   ├── Chart.yaml             # Chart metadata
│   ├── values.yaml            # Default Helm values
│   └── templates/             # Deployment, Service, Ingress, Secret
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

- **Main branch**: Production-ready code, auto-deploys on push
- **Feature branches**: `feature/description-of-feature`
- **Bug branches**: `bug/description-of-bug`
- **Pull requests**: Required for all changes — include tests and a description of what changed and why

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

We also do screenshot testing for visual regressions. Since the CI pipeline runs Ubuntu, we provide a `ci:playwright:docker` command that runs tests inside a Docker container matching the CI environment — this prevents font and layout discrepancies between your local machine and CI.

To run Docker locally on macOS, install colima:

```bash
brew install colima docker docker-compose
colima start
```

Then run the Playwright tests in Docker:

```bash
pnpm ci:playwright:docker
```

Or update the snapshots:

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
4. **Add images** to `src/app/public/images/posts/[post-number]/`
5. **Preview locally** with `pnpm dev`

### Content Structure

- **Posts**: `src/app/content/en/posts/[number].md`
- **Pages**: `src/app/content/en/pages/[name].md`
- **Authors**: `src/app/content/en/authors/[username].yaml`

## 🚀 Deployment

### Frontend (Static Site)

Pushing to `main` triggers automatic deployment via GitHub Actions:

1. i18n extraction → Nuxt generate → Storybook build
2. Static files deployed to CDN

### API (Kubernetes / AKS)

The API is containerised and deployed to AKS via Helm. CI/CD runs automatically on push to `main` when files under `src/api/**` or `k8s/**` change.

#### Manual deployment from your machine

The `package.json` scripts are the primary entry point; they delegate to `src/api/Makefile` under the hood.

| Command | What it does |
|---------|-------------|
| `pnpm deploy:api` | Full pipeline: build image → push to ACR → deploy to AKS |
| `pnpm deploy:api:push` | Push an already-built local image to ACR (skips Docker build) |
| `pnpm deploy:api:redeploy` | Re-deploy to AKS using the image already in ACR — no Docker required |
| `pnpm deploy:api:rollback` | Roll back to a specific image tag — prompts for `TAG` |

`deploy:api` and `docker:api:build/run` start Colima automatically if it isn't running.

##### Rollback example

```bash
# Roll back to a previously deployed image
make -C src/api rollback TAG=1.0.0-42
```

#### Makefile targets (`src/api/Makefile`)

You can also invoke the Makefile directly if you prefer.

| Target | What it does |
|--------|-------------|
| `make build` | Builds the Docker image for `linux/amd64` and tags it with `<version>-<BUILD_NUMBER>` and `latest`. Uses layer cache from ACR to speed up builds. |
| `make push-only` | Logs into ACR (`az acr login`) and pushes the locally-built image. Use this when the image is already built and you just want to publish it. |
| `make push` | `build` + `push-only` — the most common full build-and-publish flow. |
| `make deploy` | `push` + Helm deploy — builds, pushes, and deploys to AKS in one step. |
| `make redeploy` | `push-only` + Helm deploy — skips the local Docker build; useful when you only rebuilt the image with `make build` separately. |
| `make rollback TAG=<tag>` | Deploys an existing image tag already in ACR without building anything. Requires `TAG` (e.g. `1.0.0-42`). |

The Makefile reads `version.txt` for the version and falls back to `BUILD_NUMBER=local` when run outside CI. It also auto-loads `.env` from the repo root (via `-include ../../.env`) so `PLAUSIBLE_API_TOKEN` and `PLAUSIBLE_API_URL` are picked up automatically.

## 📚 Additional Resources

| Resource | URL |
| -------- | --- |
| Vue 3 | https://vuejs.org/ |
| Nuxt 4 | https://nuxt.com/ |
| TypeScript | https://www.typescriptlang.org/docs/ |
| TailwindCSS | https://tailwindcss.com/docs |
| Nuxt Content | https://content.nuxt.com/ |
| Pinia | https://pinia.vuejs.org/ |
| Vitest | https://vitest.dev/ |
| Playwright | https://playwright.dev/ |
| Azure Static Web Apps | https://learn.microsoft.com/en-us/azure/static-web-apps/ |
| ASP.NET Core Minimal APIs | https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis |
| Azure Kubernetes Service | https://learn.microsoft.com/en-us/azure/aks/ |
| Helm | https://helm.sh/docs/ |
