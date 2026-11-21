import type { Page } from '@playwright/test';
import { expect, messageBarCardTestid, test, waitForHeaderHydration } from './playwright-fixtures';

const postUrl = '/posts/2-ditching-the-cookie-banners:-run-plausible-analytics-on-azure-kubernetes';

async function stubPageReads(page: Page, status: number, body: Record<string, unknown>, contentType = 'application/problem+json') {
  await page.route('**/api/analytics/pageReads*', route =>
    route.fulfill({ status, contentType, body: JSON.stringify(body) }));
}

test.describe('Failed analytics requests', () => {
  test.beforeEach(async ({ browser: _ }, testInfo) => {
    /**
     * Only run these tests in Chromium to keep the matrix small.
     */
    test.skip(testInfo.project.name !== 'chromium');
  });

  test('shows the unavailable message when the backend answers 502', async ({ page }) => {
    await stubPageReads(page, 502, { status: 502, title: 'A dependency failed' });

    await page.goto(postUrl);

    await expect(page.getByTestId(messageBarCardTestid)).toContainText('This information is temporarily unavailable. Please try again later.');
    await expect(page.getByTestId(messageBarCardTestid)).toHaveCount(1);
  });

  test('shows the unexpected message when the backend answers 500', async ({ page }) => {
    await stubPageReads(page, 500, { status: 500, title: 'An unexpected error occurred' });

    await page.goto(postUrl);

    await expect(page.getByTestId(messageBarCardTestid)).toContainText('Something went wrong. Please try again later.');
  });

  test('shows no message when the request succeeds', async ({ page }) => {
    await stubPageReads(page, 200, { opened: 12, read: 5 }, 'application/json');

    await page.goto(postUrl);
    await waitForHeaderHydration(page);

    await expect(page.getByTestId(messageBarCardTestid)).toHaveCount(0);
  });
});
