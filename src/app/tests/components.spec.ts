import type { Page } from '@playwright/test';

import { expect, test } from './playwright-fixtures';

async function waitForComponent(page: Page) {
  return await page
    .locator('iframe[title="storybook-preview-iframe"]')
    .contentFrame()
    .getByTestId('component-story-wrapper')
    .first()
    .waitFor({ state: 'visible' });
}

async function createScreenshot(page: Page) {
  const testInfo = test.info();
  testInfo.snapshotSuffix = ''; // Remove OS-specific suffixes fo CI pipeline consistency

  await waitForComponent(page);
  await expect(page).toHaveScreenshot(`${testInfo.title}.png`, {
    fullPage: true,
    maxDiffPixelRatio: 0.015,
  });
}

test('header-default', async ({ page, storybookUrl }) => {
  await page.goto(
    `${storybookUrl}/?path=/story/components-header--default&full=1`,
  );

  await createScreenshot(page);
});
