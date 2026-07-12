# Visual Testing Strategy: Playwright + Storybook

A guide to setting up automated visual regression testing for Vue 3 component libraries using Playwright and Storybook — entirely with free, open-source tooling in an on-premise Azure DevOps environment.

---

## Table of Contents

1. [Why Visual Regression Testing?](#1-why-visual-regression-testing)
2. [The Toolchain](#2-the-toolchain)
3. [How It Works](#3-how-it-works)
4. [Step-by-Step Setup Guide](#4-step-by-step-setup-guide)
   - [4.1 Install dependencies](#41-install-dependencies)
   - [4.2 Configure Storybook](#42-configure-storybook)
   - [4.3 Write component stories](#43-write-component-stories)
   - [4.4 Configure Playwright](#44-configure-playwright)
   - [4.5 Write visual tests](#45-write-visual-tests)
   - [4.6 Generate baseline snapshots](#46-generate-baseline-snapshots)
5. [Approving Visual Changes](#5-approving-visual-changes)
6. [Azure DevOps Pipeline](#6-azure-devops-pipeline)
7. [Key Patterns & Decisions](#7-key-patterns--decisions)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Why Visual Regression Testing?

Unit and integration tests verify that logic is correct, but they cannot tell you whether a component *looks* right. A CSS change that shifts a button by 4px, a font that fails to load, or a layout that breaks on mobile will all pass unit tests — and only get caught by visual regression testing.

Visual regression testing works by:
1. Taking a screenshot of a component or page the first time ("baseline snapshot")
2. Taking a new screenshot on every subsequent test run
3. Comparing pixel-by-pixel and failing if the difference exceeds a threshold

**What this gives you:**
- Catch unintended visual side-effects of code changes before they reach production
- Document what components are *supposed* to look like
- Cross-browser and cross-device coverage without manual QA
- Confidence when refactoring CSS, upgrading UI libraries, or changing shared components

**Why Storybook + Playwright** (and not a dedicated tool like Percy or Chromatic):
- Storybook is already widely adopted for component development and documentation
- Playwright is a free, open-source browser automation framework maintained by Microsoft
- No external SaaS dependency — everything runs on your own infrastructure
- Snapshots are stored in your git repository alongside the code

---

## 2. The Toolchain

All tools are **free and open source**. No paid services required.

| Tool | Version | Purpose |
|---|---|---|
| [Storybook](https://storybook.js.org/) | 10.x | Renders components in isolation, provides a stable URL per story |
| [@playwright/test](https://playwright.dev/) | 1.56.x | Browser automation and screenshot comparison |
| [http-server](https://github.com/http-party/http-server) | any | Serves the pre-built Storybook in CI |
| [Docker](https://www.docker.com/) | any | Consistent rendering environment across machines and CI |
| Microsoft Playwright Docker image | v1.56.0-jammy | Pre-configured Ubuntu container with all browsers pre-installed |

The Microsoft Playwright Docker image (`mcr.microsoft.com/playwright:v1.56.0-jammy`) is a free image from Microsoft Container Registry. It includes Chromium, Firefox, and WebKit with all their system dependencies, removing the need to install browsers manually in CI.

> **On rendering consistency:** Font rendering, subpixel anti-aliasing, and emoji rendering differ between operating systems. A screenshot taken on macOS will not match one taken on Linux — even for identical components. The solution is to always generate baseline snapshots inside the same Docker container used in CI. See [Section 5](#5-approving-visual-changes) and [Section 8](#8-troubleshooting) for details.

---

## 3. How It Works

The architecture has three layers:

```
┌─────────────────────────────────────────────────────────────┐
│  Storybook (port 6006)                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  /iframe.html?id=components-alert--default           │   │
│  │  /iframe.html?id=components-footer--default          │   │
│  │  /iframe.html?id=components-header--default          │   │
│  │  ...one URL per story, renders component in isolation │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────┘
                                │  Playwright navigates to each URL
                                ▼
┌─────────────────────────────────────────────────────────────┐
│  Playwright Test Runner                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  1. Navigate to story URL                            │   │
│  │  2. Take full-page screenshot                        │   │
│  │  3. Compare against stored PNG baseline              │   │
│  │  4. Fail if pixel difference > 1.5%                  │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────┘
                                │  Stores/compares
                                ▼
┌─────────────────────────────────────────────────────────────┐
│  Snapshot directory (committed to git)                       │
│  src/tests/playwright/components.spec.ts-snapshots/          │
│  ├── alert--default-chromium.png                             │
│  ├── alert--default-firefox.png                              │
│  ├── alert--default-webkit.png                               │
│  ├── alert--default-Mobile-Chrome.png                        │
│  └── alert--default-Mobile-Safari.png                        │
└─────────────────────────────────────────────────────────────┘
```

**In local development:** Both the app dev server and Storybook dev server start automatically when Playwright runs.

**In CI:** The app and Storybook are built first as static files, then served by `http-server`. This is faster and more reproducible than running dev servers in a pipeline.

---

## 4. Step-by-Step Setup Guide

### 4.1 Install Dependencies

```bash
# Storybook
npm install --save-dev storybook @storybook/vue3-vite @storybook/addon-a11y

# Playwright
npm install --save-dev @playwright/test playwright-core

# For serving the built Storybook in CI
npm install --save-dev http-server
```

Initialize Storybook (creates the `.storybook/` config directory):

```bash
npx storybook@latest init
```

### 4.2 Configure Storybook

The `.storybook/` directory contains three files that matter for visual testing.

**`.storybook/main.ts`** — tells Storybook where to find stories and which framework to use:

```typescript
import type { StorybookConfig } from '@storybook/vue3-vite';

const config: StorybookConfig = {
  stories: ['../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-a11y'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  staticDirs: ['../public'],
};

export default config;
```

**`.storybook/preview.ts`** — global decorators and mocks that apply to all stories. Register any global Vue plugins (router, i18n, etc.) and mock any external dependencies that are not available in the Storybook environment:

```typescript
import type { Preview } from '@storybook/vue3-vite';
import { setup } from '@storybook/vue3-vite';
import { createI18n } from 'vue-i18n';

setup((app) => {
  app.use(createI18n({ locale: 'en', messages: { en: {} } }));
});

const preview: Preview = {
  decorators: [
    (story) => ({
      components: { story },
      template: '<div style="padding: 1rem;"><story /></div>',
    }),
  ],
};

export default preview;
```

**Package scripts** — add these to `package.json`:

```json
{
  "scripts": {
    "storybook": "storybook dev --config-dir ./.storybook --port 6006 --no-open",
    "storybook:build": "storybook build -c ./.storybook -o ./dist-storybook",
    "serve:storybook": "npx http-server ./dist-storybook/ -p 6006",
    "playwright": "playwright test --config=playwright.config.ts",
    "ci:playwright": "playwright test --config=playwright.config.ci.ts",
    "ci:playwright:update": "playwright test --config=playwright.config.ci.ts --update-snapshots"
  }
}
```

`serve:storybook` uses `http-server` to serve the pre-built Storybook in CI — faster and more stable than running the dev server in a pipeline.

### 4.3 Write Component Stories

A story renders a component with fixed props, in isolation. Playwright navigates to each story's iframe URL and takes a screenshot.

Create a `ComponentName.stories.ts` file next to your component:

```typescript
// AlertBar.stories.ts
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import AlertBar from './AlertBar.vue';

const meta = {
  title: 'Components/Alert',
  component: AlertBar,
  args: {
    title: 'Alert title',
    description: 'Alert description',
  },
  render: args => ({
    components: { AlertBar },
    setup() { return { args }; },
    template: `
      <AlertBar v-bind="args" severity="info" />
      <AlertBar v-bind="args" severity="success" />
      <AlertBar v-bind="args" severity="warning" />
      <AlertBar v-bind="args" severity="error" />
    `,
  }),
} satisfies Meta<typeof AlertBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
```

The `title` field determines the story's URL. `Components/Alert` with export name `Default` becomes story ID `components-alert--default`, which maps to:

```
http://localhost:6006/iframe.html?id=components-alert--default&viewMode=story
```

This is the URL Playwright navigates to for the visual test.

**Story ID conventions:**
- `title: 'Components/My Component'` → prefix `components-my-component`
- Export name `Default` → suffix `--default`
- Full story ID: `components-my-component--default`

Verify the exact ID by opening local Storybook and copying the `id=` parameter from the URL.

### 4.4 Configure Playwright

Create two configuration files: one for local development and one for CI.

**`playwright.config.ts`** (local — single browser, starts dev servers automatically):

```typescript
import process from 'node:process';
import { defineConfig, devices } from '@playwright/test';

process.env.STORYBOOK_URL = 'http://localhost:6006';

export default defineConfig({
  testDir: './src/tests/playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // Starts both your app and Storybook automatically before tests run
    command: 'npm run dev & npm run storybook',
    url: 'http://localhost:3000/',
    reuseExistingServer: !process.env.CI,
  },
});
```

**`playwright.config.ci.ts`** (CI — multiple browsers, serves pre-built static files):

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests/playwright',
  fullyParallel: true,
  forbidOnly: true,
  retries: 1,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium',      use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',       use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',        use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    // Serves pre-built static output — much faster than dev servers in CI
    command: 'npm run serve & npm run serve:storybook',
    url: 'http://localhost:3000/',
    reuseExistingServer: false,
  },
});
```

### 4.5 Write Visual Tests

Create a custom fixture to share the Storybook URL across all component tests, overridable via environment variable:

**`src/tests/playwright/playwright-fixtures.ts`**:

```typescript
import process from 'node:process';
import { test as base } from '@playwright/test';

export { expect } from '@playwright/test';

interface ComponentFixture {
  storybookUrl: string;
}

export const test = base.extend<ComponentFixture>({
  storybookUrl: async ({ page: _ }, use) => {
    const url = process.env.STORYBOOK_URL || 'http://localhost:6006';
    await use(url);
  },
});
```

Create the visual test file. The pattern iterates over story IDs, navigates to each story's iframe URL, and compares a screenshot:

**`src/tests/playwright/components.spec.ts`**:

```typescript
import type { Page } from '@playwright/test';
import { expect, test } from './playwright-fixtures';

async function createScreenshot(page: Page) {
  const testInfo = test.info();
  // Strip OS-specific suffix so a single PNG file works on both
  // macOS (local Docker) and Linux (CI) without separate baseline sets.
  testInfo.snapshotSuffix = '';

  await expect(page).toHaveScreenshot(`${testInfo.title}.png`, {
    fullPage: true,
    maxDiffPixelRatio: 0.015, // Allow up to 1.5% pixel difference
  });
}

[
  'alert--default',
  'footer--default',
  'header--default',
  'button--default',
  'chip-link--default',
].forEach((story) => {
  test(`${story}`, async ({ page, storybookUrl }) => {
    await page.goto(
      `${storybookUrl}/iframe.html?globals=&id=components-${story}&viewMode=story`,
    );
    await createScreenshot(page);
  });
});
```

Each test name becomes the snapshot filename. Test `alert--default` produces `alert--default-chromium.png`, `alert--default-firefox.png`, etc.

### 4.6 Generate Baseline Snapshots

**Important:** Always generate baseline snapshots inside the Docker container, not from your local machine. This ensures the baselines match what CI will produce. See [Section 5](#5-approving-visual-changes) for the Docker update workflow.

Run the following to create initial baselines inside Docker:

```bash
docker run --rm \
  -v $(pwd):/work -w /work \
  -e CI=true \
  mcr.microsoft.com/playwright:v1.56.0-jammy \
  /bin/bash -c 'npm ci && npm run ci:playwright:update'
```

Inspect the generated PNGs in `src/tests/playwright/components.spec.ts-snapshots/`. If they look correct, commit them to git.

From this point on, `npm run playwright` compares new screenshots against these baselines and fails if the difference exceeds the threshold.

---

## 5. Approving Visual Changes

This is the most operationally important aspect of the setup. When a component's appearance changes intentionally (a redesign, a color update, a layout change), the pipeline fails because the new screenshots no longer match the stored baselines. Someone must review and approve the change.

### The core problem: local vs. CI rendering

Screenshots taken on a developer's machine (macOS) will always differ from screenshots taken in CI (Linux) due to OS-level font rendering, subpixel hinting, and emoji differences — even for identical components. **You cannot update snapshots locally and expect them to pass in CI.**

The solution is simple: **always update snapshots inside the same Docker container used in CI.**

### Workflow for approving visual changes

```
Developer changes a component
        │
        ▼
CI pipeline runs visual tests
        │
        ├─ Tests pass ──────────────────────────────▶  Done
        │
        └─ Tests fail (visual diff detected)
                │
                ▼
        Developer reviews HTML report
        (published as pipeline artifact)
                │
                ├─ Unintentional change ──────────▶  Fix the code, push again
                │
                └─ Intentional change
                        │
                        ▼
                Update snapshots in Docker locally
                (see command below)
                        │
                        ▼
                Review generated PNGs in git diff
                        │
                        ▼
                Commit updated PNGs alongside the code change
                        │
                        ▼
                Push — CI passes
```

### Updating snapshots locally (via Docker)

Add this script to `package.json`:

```json
{
  "scripts": {
    "playwright:update-snapshots": "docker run --rm -v $(pwd):/work -w /work -e CI=true mcr.microsoft.com/playwright:v1.56.0-jammy /bin/bash -c 'npm ci && npm run ci:playwright:update'"
  }
}
```

Then run:

```bash
npm run playwright:update-snapshots
```

This runs inside the same Linux/Ubuntu environment as CI, so the generated PNGs will match exactly. Review the changed PNG files in your git diff, confirm the new appearance is correct, and commit them together with your code changes.

### Using Azure DevOps pipeline approval gates (automated alternative)

If your team prefers an automated approach where snapshots can be updated and committed directly from the pipeline after a human approval step, Azure DevOps Environments with required approvers support this.

**Setup in Azure DevOps:**
1. Go to **Pipelines → Environments** and create a new environment named `visual-snapshot-approval`
2. Add **Approvals and checks**: set the required approvers (e.g., your team leads or component owners)
3. Optionally set a timeout (e.g., 24 hours) after which the gate expires

**How the flow works:**
- The visual test stage fails and publishes the HTML diff report as a pipeline artifact
- A reviewer opens the artifact in Azure DevOps to inspect which components changed and how
- The reviewer navigates to the pipeline run, sees the pending approval, and approves or rejects
- If approved, the pipeline runs inside Docker, updates the snapshot PNGs, and commits them back to the source branch automatically
- If rejected, the developer knows the visual change needs to be fixed, not approved

```yaml
# This stage only runs when the test stage has failed
- stage: UpdateSnapshots
  displayName: 'Update Visual Snapshots (requires approval)'
  dependsOn: VisualTests
  condition: failed('VisualTests')
  jobs:
    - deployment: UpdateSnapshotJob
      displayName: 'Update & commit snapshots'
      environment: 'visual-snapshot-approval'   # <-- approval gate
      container:
        image: mcr.microsoft.com/playwright:v1.56.0-jammy
        options: '--user root'
      variables:
        HOME: '/root'
      strategy:
        runOnce:
          deploy:
            steps:
              - checkout: self
                persistCredentials: true

              - script: npm ci
                displayName: 'Install dependencies'

              - script: npm run ci:playwright:update
                displayName: 'Regenerate snapshots'

              - script: |
                  git config user.email "azure-pipeline@your-company.com"
                  git config user.name "Azure Pipeline"
                  git add src/tests/playwright/**/*.png
                  git diff --staged --quiet || git commit -m "chore: update visual snapshots [skip ci]"
                  git push origin HEAD:$(Build.SourceBranchName)
                displayName: 'Commit updated snapshots'
```

The `[skip ci]` tag in the commit message prevents the pipeline from triggering again on the snapshot commit (configure this in your pipeline's trigger exclusion if your CI system uses a different convention).

---

## 6. Azure DevOps Pipeline

Full pipeline combining build, visual tests, and the optional approval-gated update stage:

```yaml
# azure-pipelines.yml
trigger:
  branches:
    include:
      - main
      - refs/pull/*/merge

variables:
  NODE_VERSION: '20.x'
  PLAYWRIGHT_IMAGE: 'mcr.microsoft.com/playwright:v1.56.0-jammy'

stages:
  - stage: Build
    displayName: 'Build'
    jobs:
      - job: BuildJob
        displayName: 'Build Application & Storybook'
        pool:
          name: 'your-agent-pool'
        steps:
          - checkout: self

          - task: NodeTool@0
            displayName: 'Install Node.js'
            inputs:
              versionSpec: $(NODE_VERSION)

          - task: Cache@2
            displayName: 'Cache node_modules'
            inputs:
              key: 'npm | "$(Agent.OS)" | package-lock.json'
              restoreKeys: 'npm | "$(Agent.OS)"'
              path: node_modules

          - script: npm ci
            displayName: 'Install dependencies'

          # Your build script should produce both the app and Storybook
          # e.g. "build": "vue-cli-service build && npm run storybook:build"
          - script: npm run build
            displayName: 'Build app + Storybook'

          - script: |
              zip -r -0 $(Build.ArtifactStagingDirectory)/dist.zip dist dist-storybook
            displayName: 'Zip build output'

          - task: PublishPipelineArtifact@1
            displayName: 'Publish build artifact'
            inputs:
              targetPath: '$(Build.ArtifactStagingDirectory)/dist.zip'
              artifact: 'dist-zip'

  - stage: VisualTests
    displayName: 'Visual Regression Tests'
    dependsOn: Build
    jobs:
      - job: PlaywrightJob
        displayName: 'Playwright Visual Tests'
        pool:
          name: 'your-agent-pool'
        container:
          image: $(PLAYWRIGHT_IMAGE)
          options: '--user root'
        variables:
          HOME: '/root'
        steps:
          - checkout: self

          - task: Cache@2
            displayName: 'Cache node_modules'
            inputs:
              key: 'npm | "$(Agent.OS)" | package-lock.json'
              restoreKeys: 'npm | "$(Agent.OS)"'
              path: node_modules

          - script: |
              apt-get update -qq && apt-get install -y unzip
              npm ci
            displayName: 'Install dependencies'

          - task: DownloadPipelineArtifact@2
            displayName: 'Download build artifact'
            inputs:
              artifact: 'dist-zip'
              path: '$(System.DefaultWorkingDirectory)'

          - script: unzip dist.zip
            displayName: 'Unzip build output'

          - script: CI=true npm run ci:playwright
            displayName: 'Run Playwright visual tests'

          # Always publish, even on failure — this is how reviewers inspect diffs
          - task: PublishPipelineArtifact@1
            displayName: 'Publish Playwright HTML report'
            condition: always()
            inputs:
              targetPath: 'playwright-report'
              artifact: 'playwright-report'

          - task: PublishPipelineArtifact@1
            displayName: 'Publish test result traces'
            condition: always()
            inputs:
              targetPath: 'test-results'
              artifact: 'test-results'

  # Optional: approval-gated automatic snapshot update
  # Only runs when VisualTests stage fails
  - stage: UpdateSnapshots
    displayName: 'Update Visual Snapshots (requires approval)'
    dependsOn: VisualTests
    condition: failed('VisualTests')
    jobs:
      - deployment: UpdateSnapshotJob
        displayName: 'Update & commit snapshots'
        environment: 'visual-snapshot-approval'
        pool:
          name: 'your-agent-pool'
        container:
          image: $(PLAYWRIGHT_IMAGE)
          options: '--user root'
        variables:
          HOME: '/root'
        strategy:
          runOnce:
            deploy:
              steps:
                - checkout: self
                  persistCredentials: true

                - script: |
                    apt-get update -qq && apt-get install -y unzip
                    npm ci
                  displayName: 'Install dependencies'

                - task: DownloadPipelineArtifact@2
                  displayName: 'Download build artifact'
                  inputs:
                    artifact: 'dist-zip'
                    path: '$(System.DefaultWorkingDirectory)'

                - script: unzip dist.zip
                  displayName: 'Unzip build output'

                - script: CI=true npm run ci:playwright:update
                  displayName: 'Regenerate snapshots'

                - script: |
                    git config user.email "azure-pipeline@your-company.com"
                    git config user.name "Azure Pipeline"
                    git add src/tests/playwright/**/*.png
                    git diff --staged --quiet || git commit -m "chore: update visual snapshots [skip ci]"
                    git push origin HEAD:$(Build.SourceBranchName)
                  displayName: 'Commit updated snapshots'
```

**Why artifacts are zipped between stages:**
The Playwright job runs inside a Docker container, which is a separate environment from the build stage. Passing the pre-built output as a zip artifact ensures the Playwright job tests the exact same files that would be deployed — not a freshly rebuilt version that might differ due to timing or environment differences.

**Why `--user root` and `HOME=/root`:**
The Playwright Docker image requires root access to launch browser processes (for sandbox setup). This is safe within a container that is destroyed after the job completes.

---

## 7. Key Patterns & Decisions

### OS-agnostic snapshot naming

By default Playwright appends the OS name to snapshot filenames (e.g., `alert--default-chromium-darwin.png` on macOS, `alert--default-chromium-linux.png` on Linux). This means a developer on macOS would always create different files than CI creates on Linux.

The fix is to clear `snapshotSuffix` in the test helper:

```typescript
const testInfo = test.info();
testInfo.snapshotSuffix = ''; // Single file per browser, OS-independent
```

Now `alert--default-chromium.png` is the canonical file regardless of where tests run. Combined with always generating baselines in Docker, this gives you one consistent set of PNG files.

### Pixel tolerance threshold

`maxDiffPixelRatio: 0.015` allows up to 1.5% of pixels to differ. This prevents false failures from subpixel anti-aliasing and minor font rendering variations between browser versions, while still catching real regressions.

### Rendering all variants in a single story

Rather than creating a separate story per variant, you can render all variants in a single `Default` story. This keeps snapshot count manageable and gives a comprehensive visual overview in one screenshot:

```typescript
// Shows all four severity levels in one snapshot
template: `
  <AlertBar v-bind="args" severity="info" />
  <AlertBar v-bind="args" severity="success" />
  <AlertBar v-bind="args" severity="warning" />
  <AlertBar v-bind="args" severity="error" />
`,
```

### Local vs. CI server strategy

| Mode | App server | Storybook server |
|---|---|---|
| Local dev | `npm run dev` (hot reload) | `npm run storybook` (hot reload) |
| CI | `npm run serve` (static files) | `npm run serve:storybook` (static files) |

In CI, both servers serve pre-built static files. This is faster, reproducible, and means no build tools need to run inside the Playwright container.

---

## 8. Troubleshooting

### Tests pass locally but fail in CI

**Cause:** Different OS rendering between local machine and CI Linux container.

**Solution:** Always update baselines using the Docker container, not your local machine:

```bash
npm run playwright:update-snapshots
```

Never commit PNG files that were generated directly from your host OS.

### Story URL returns 404

Verify the story ID matches what Storybook generates. Open local Storybook, navigate to the story, and copy the `id=` parameter from the URL. Common pitfalls:
- Spaces in `title` become hyphens: `Components/My Component` → `components-my-component`
- Export name is lowercased: `export const MyStory` → `--mystory`
- The component name in `title` must match exactly what you use in your test's story ID list

### Storybook renders broken components in CI

The Storybook environment does not have your application's router, global plugins, or framework integrations available. If a component relies on `inject`, a Vuex/Pinia store, Vue Router, or any plugin, it must be provided in `.storybook/preview.ts`. Add a mock or minimal real instance of each dependency.

### Snapshot update commit is not triggering the pipeline again

Ensure your pipeline trigger excludes commits that contain `[skip ci]` (or use the Azure DevOps equivalent). In Azure DevOps YAML pipelines, add the following to skip CI on the snapshot update commit:

```yaml
trigger:
  branches:
    include:
      - main
  paths:
    exclude:
      - 'src/tests/playwright/**/*.png'
```

This skips re-running the full pipeline when only PNG snapshot files change.

### Approval gate times out before anyone reviews

Configure the timeout on the `visual-snapshot-approval` environment to match your team's review cadence (e.g., 48 hours for a team that doesn't work weekends). Notify approvers via Azure DevOps notification settings when a new approval is pending.
