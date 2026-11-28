import type { Page } from '@playwright/test';
import { expect, messageBarCardTestid, test, waitForHeaderHydration } from './playwright-fixtures';

const postUrl = '/posts/2-ditching-the-cookie-banners:-run-plausible-analytics-on-azure-kubernetes';

async function stubPageReads(page: Page, status: number, body: Record<string, unknown>, contentType = 'application/problem+json') {
  await page.route('**/api/analytics/pageReads*', route =>
    route.fulfill({ status, contentType, body: JSON.stringify(body) }));
}

async function gotoAndSettleReads(page: Page) {
  const readsSettled = page.waitForResponse('**/api/analytics/pageReads*');
  await page.goto(postUrl);
  await readsSettled;
  await waitForHeaderHydration(page);
}

// Analytics are a nice-to-have: a failing reads/likes call must never surface
// an error bar to the visitor; the page just renders without the counters.
test.describe('Failed analytics requests', () => {
  test.beforeEach(async ({ browser: _ }, testInfo) => {
    /**
     * Only run these tests in Chromium to keep the matrix small.
     */
    test.skip(testInfo.project.name !== 'chromium');
  });

  test('stays silent when the backend answers 502', async ({ page }) => {
    await stubPageReads(page, 502, { status: 502, title: 'A dependency failed' });

    await gotoAndSettleReads(page);

    await expect(page.getByTestId(messageBarCardTestid)).toHaveCount(0);
  });

  test('stays silent when the backend answers 500', async ({ page }) => {
    await stubPageReads(page, 500, { status: 500, title: 'An unexpected error occurred' });

    await gotoAndSettleReads(page);

    await expect(page.getByTestId(messageBarCardTestid)).toHaveCount(0);
  });

  test('shows no message when the request succeeds', async ({ page }) => {
    await stubPageReads(page, 200, { opened: 12, read: 5 }, 'application/json');

    await gotoAndSettleReads(page);

    await expect(page.getByTestId(messageBarCardTestid)).toHaveCount(0);
  });
});
