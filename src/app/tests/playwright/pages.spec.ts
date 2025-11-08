import type { Page } from '@playwright/test';

import { expect, test } from './playwright-fixtures';

async function createScreenshot(page: Page) {
  const testInfo = test.info();
  testInfo.snapshotSuffix = ''; // Remove OS-specific suffixes fo CI pipeline consistency

  await expect(page).toHaveScreenshot(`${testInfo.title}.png`, {
    fullPage: true,
    maxDiffPixelRatio: 0.015,
  });
}

test('about-page', async ({ page }) => {
  await page.goto(`/content/30-about`);

  await createScreenshot(page);
});

test('portfolio-page', async ({ page }) => {
  await page.goto(`/content/20-portfolio`);

  await createScreenshot(page);
});

test('post2-page', async ({ page }) => {
  await page.goto(`/posts/2-ditching-the-cookie-banners:-run-plausible-analytics-on-azure-kubernetes`);

  await createScreenshot(page);
});

test.describe('Different language versions', () => {
  test.beforeEach(async ({ browser: _ }, testInfo) => {
    /**
     * Only run these tests in Chromium to avoid redundancy and speed up the test suite.
     */
    test.skip(testInfo.project.name !== 'chromium');
  });

  test('about-page-fr', async ({ page }) => {
    await page.goto(`/fr/content/30-a-propos`);

    await createScreenshot(page);
  });
  test('about-page-nl', async ({ page }) => {
    await page.goto(`/nl/content/30-over`);

    await createScreenshot(page);
  });
  test('about-page-de', async ({ page }) => {
    await page.goto(`/de/content/30-uber-mich`);

    await createScreenshot(page);
  });
  test('about-page-es', async ({ page }) => {
    await page.goto(`/es/content/30-acerca-de`);

    await createScreenshot(page);
  });
});
