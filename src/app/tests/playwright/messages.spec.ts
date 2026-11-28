import { codeGroupRowTestid, expect, messageBarCardTestid, test } from './playwright-fixtures';

const postWithSeveralCodeGroups = '/posts/5-array-to-map-conversion-in-typescript-with-type-safety';
const postWithCodeAndProgress = '/posts/3-track-article-reads-plausible-vue-azure-functions';

test.describe('Messages', () => {
  test.beforeEach(async ({ browser: _ }, testInfo) => {
    /**
     * Only run these tests in Chromium: the clipboard permission differs per browser.
     */
    test.skip(testInfo.project.name !== 'chromium');
  });

  test('copy toast disappears on its own', async ({ page }) => {
    await page.goto(postWithCodeAndProgress);

    await page.getByTestId('code-group-copy-button').click();

    const toast = page.getByTestId(messageBarCardTestid);
    await expect(toast).toContainText('Copied to clipboard!');
    await expect(toast).toBeVisible();
    await expect(toast).toBeHidden({ timeout: 6000 });
  });

  test('copy button works inside any of several code groups on one post', async ({ page }) => {
    await page.goto(postWithSeveralCodeGroups);
    const groups = page.getByTestId(codeGroupRowTestid);
    await expect(groups).toHaveCount(2);

    await groups.nth(1).getByTestId('code-group-copy-button').click();

    await expect(page.getByTestId(messageBarCardTestid)).toContainText('Copied to clipboard!');
  });

  test('language notice appears after switching to nl and not after switching back to en', async ({ page }) => {
    await page.goto(postWithCodeAndProgress);
    // The button has no box of its own (its flags are absolutely positioned), so it is clicked by event instead of by pointer.
    const switchLanguage = page.getByTestId('desktop-menu-language-switcher-toggle-button');
    const notice = page.getByTestId(messageBarCardTestid);

    await switchLanguage.dispatchEvent('click');
    await expect(notice).toContainText('automatisch vertaald met AI');
    await notice.click();
    await expect(notice).toHaveCount(0);

    await switchLanguage.dispatchEvent('click');
    await expect(notice).toContainText('automatisch mit KI übersetzt');
    await notice.click();
    await expect(notice).toHaveCount(0);

    await switchLanguage.dispatchEvent('click');
    await expect(page).not.toHaveURL(/\/(nl|de)\//);
    await expect(notice).toHaveCount(0);
  });

  test('reading progress panel opens and closes as a floating alert', async ({ page }) => {
    await page.goto(postWithCodeAndProgress);
    const panel = page.getByTestId('page-read-progress-message-bar-card');
    const toggle = page.getByTestId('page-read-progress-toggle-button');

    await expect(panel).toHaveCount(0);
    await toggle.click();

    await expect(panel).toBeVisible();
    await expect(panel).toContainText('Word count:');
    await expect(panel).toContainText('Reading stage:');
    await expect(page.getByTestId('message-bar-outlet-fixed-panel').getByTestId('page-read-progress-message-bar-card')).toBeVisible();

    await toggle.click();
    await expect(panel).toHaveCount(0);
  });

  test('reading progress panel reopens with a single toggle click after the bar was dismissed', async ({ page }) => {
    await page.goto(postWithCodeAndProgress);
    const panel = page.getByTestId('page-read-progress-message-bar-card');
    const toggle = page.getByTestId('page-read-progress-toggle-button');

    await toggle.click();
    await expect(panel).toBeVisible();
    await panel.click();
    await expect(panel).toHaveCount(0);

    await toggle.click();

    await expect(panel).toBeVisible();
  });
});
