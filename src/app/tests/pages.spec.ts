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
  await page.goto(`/pages/about`);

  await createScreenshot(page);
});

test('portfolio-page', async ({ page }) => {
  await page.goto(`/pages/portfolio`);

  await createScreenshot(page);
});

test('post1-page', async ({ page }) => {
  await page.goto(`/posts/1-mastering-conditional-property-types-with-vue-3_3-generics`);

  await createScreenshot(page);
});
