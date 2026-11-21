import type { Locator, Page } from '@playwright/test';
import process from 'node:process';
import { test as base } from '@playwright/test';

export { expect } from '@playwright/test';

interface ComponentFixture {
  storybookUrl: string
}

export const test = base.extend<ComponentFixture>({
  storybookUrl: async ({ page: _ }, use) => {
    const url = process.env.STORYBOOK_URL || 'http://localhost:6006';
    await use(url);
  },
});

/** Store-driven message bars carry the id of their message, so tests match the whole family. */
export const messageBarCardTestid = /^message-bar-\d+-card$/;

/** Every code group in a post carries its own generated key, so tests match the whole family and scope through the row. */
export const codeGroupRowTestid = /^code-group-row-[a-z0-9-]+$/;

/**
 * The header switchers are inside <ClientOnly>, so they only enter the DOM once
 * hydration finishes. Waits (attached, not visible, as it is CSS-hidden on
 * mobile viewports) for the desktop color mode switcher.
 */
export async function waitForHeaderHydration(page: Page) {
  await page.getByTestId('desktop-menu-color-mode-switcher-toggle-button').waitFor({ state: 'attached' });
}

/**
 * Where the capture specs write their screenshots. The same directory is the
 * `actualDir` in `regconfig.json` and is git-ignored: reg-suit compares and
 * publishes it, nothing here is a committed baseline.
 */
export const actualScreenshotDir = 'visual-regression/actual';

/** Analytics answers are constants, so counts in a capture never depend on the live backend. */
export const pageReadsRoute = '**/api/analytics/pageReads*';
export const pageLikesRoute = '**/api/analytics/pageLikes*';

export const stubbedPageReads = { opened: 120, peeked: 100, quarterRead: 80, halfRead: 60, threeQuarterRead: 40, read: 25 };
export const stubbedPageLikes = { likes: 7 };

export async function stubAnalytics(page: Page) {
  await page.route(pageReadsRoute, route => route.fulfill({ json: stubbedPageReads }));
  await page.route(pageLikesRoute, route => route.fulfill({ json: stubbedPageLikes }));
}

/** Start before navigating, then await after: resolves once the page received both stubbed answers. */
export function waitForAnalytics(page: Page) {
  return Promise.all([page.waitForResponse(pageReadsRoute), page.waitForResponse(pageLikesRoute)]);
}

/**
 * Waits until the rendered page can no longer change on its own: web fonts are
 * ready and every image, lazy ones included, is loaded and decoded.
 */
async function waitForStablePage(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const images = Array.from(document.images);
    images.forEach((image) => {
      image.loading = 'eager';
    });
    await Promise.all(images.map(image => image.decode().catch(() => undefined)));
  });
  await page.waitForLoadState('networkidle');
}

/**
 * Captures the full page into the shared actual directory as `<test title>-<project>.png`.
 * Comparison is not done here: reg-suit pairs the file with the baseline of the same name.
 */
export async function captureScreenshot(page: Page, options: { mask?: Locator[] } = {}) {
  const { title, project } = test.info();
  const projectSlug = project.name.replace(/\s+/g, '-');

  await waitForStablePage(page);
  await page.screenshot({
    path: `${actualScreenshotDir}/${title}-${projectSlug}.png`,
    fullPage: true,
    animations: 'disabled',
    mask: options.mask,
  });
}
