import type { Page } from "@playwright/test";

import { test, expect } from "./playwright-fixtures";

const waitForComponent = async (page: Page) =>
  await page
    .locator('iframe[title="storybook-preview-iframe"]')
    .contentFrame()
    .getByTestId("component-story-wrapper")
    .first()
    .waitFor({ state: "visible" });

const createScreenshot = async (page: Page) => {
  const testInfo = test.info();
  testInfo.snapshotSuffix = ""; // Remove OS-specific suffixes fo CI pipeline consistency

  await waitForComponent(page);
  await expect(page).toHaveScreenshot(`${testInfo.title}.png`, {
    fullPage: true,
    maxDiffPixelRatio: 0.015,
  });
};

test("header-default", async ({ page, storybookUrl }) => {
  await page.goto(
    `${storybookUrl}/?path=/story/components-header--default&full=1`,
  );

  await createScreenshot(page);
});
