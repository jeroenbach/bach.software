import { captureScreenshot, stubAnalytics, test, waitForAnalytics, waitForHeaderHydration } from './playwright-fixtures';

test.beforeEach(async ({ page }) => {
  await stubAnalytics(page);
});

test('about-page', async ({ page }) => {
  await page.goto(`/content/30-about`);
  await waitForHeaderHydration(page);

  await captureScreenshot(page);
});

test('portfolio-page', async ({ page }) => {
  await page.goto(`/content/20-portfolio`);
  await waitForHeaderHydration(page);

  await captureScreenshot(page);
});

test('post2-page', async ({ page }) => {
  const analyticsLoaded = waitForAnalytics(page);
  await page.goto(`/posts/2-ditching-the-cookie-banners:-run-plausible-analytics-on-azure-kubernetes`);
  await waitForHeaderHydration(page);
  await analyticsLoaded;

  await captureScreenshot(page);
});

test.describe('Different language versions', () => {
  test.beforeEach(async ({ browser: _ }, testInfo) => {
    /**
     * Only run these tests in Chromium to avoid redundancy and speed up the test suite.
     */
    test.skip(testInfo.project.name !== 'chromium');
  });

  test('about-page-nl', async ({ page }) => {
    await page.goto(`/nl/content/30-over`);
    await waitForHeaderHydration(page);

    await captureScreenshot(page);
  });
  test('about-page-de', async ({ page }) => {
    await page.goto(`/de/content/30-uber-mich`);
    await waitForHeaderHydration(page);

    await captureScreenshot(page);
  });
});
