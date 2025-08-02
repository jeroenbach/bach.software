import { test, expect } from "@playwright/test";

test("header-default", async ({ page }) => {
  await page.goto("/_storybook/");
  await page.getByRole("button", { name: "Header" }).click();
  await page.getByRole("link", { name: "Default" }).click();
  await page.getByLabel("Go full screen").click();
  await expect(page).toHaveScreenshot();
});
