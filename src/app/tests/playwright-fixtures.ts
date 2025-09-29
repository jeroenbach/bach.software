import process from 'node:process';
import { test as base } from '@playwright/test';

export { expect } from '@playwright/test';

interface ComponentFixture {
  /**
   * When true, a custom font is applied to the HTML element.
   */
  e2eFont: boolean
  storybookUrl: string
}

export const test = base.extend<ComponentFixture>({
  // By default we have a custom font for e2e tests to ensure consistent screenshots across environments.
  e2eFont: [true, { option: true }],

  // ensure e2e-font class is set before any page scripts run
  page: async ({ page, e2eFont }, use) => {
    if (e2eFont) {
      // Patch page.goto so it sets the class to load the fonts and waits for the fonts
      const originalGoto = page.goto.bind(page);
      page.goto = async (url, options) => {
        const response = await originalGoto(url, options);
        await page.evaluate(async () => {
          document.documentElement.classList.add('e2e-font');

          if (document.fonts?.ready) {
            // Wait until all fonts loaded
            await document.fonts.ready;
          }
        });
        return response;
      };
    }
    await use(page);
  },

  storybookUrl: async ({ page: _ }, use) => {
    const url = process.env.STORYBOOK_URL || 'http://localhost:6006';
    await use(url);
  },
});
