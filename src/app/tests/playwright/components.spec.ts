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

[
  'header--default',
  'footer--default',
  'alert--default',
  'apphero--default',
  'applink--default',
  'blogpost--default',
  'chiplink--default',
  'curriculumvitaetable--default',
  'notificationmessage--default',
  'portfoliogrid--default',
].forEach((story) => {
  test(`${story}`, async ({ page, storybookUrl }) => {
    await page.goto(
      `${storybookUrl}/iframe.html?globals=&id=components-${story}&viewMode=story`,
    );

    await createScreenshot(page);
  });
});
