import type { Page } from '@playwright/test';
import type { StoryRegistration } from './componentStories';
import { storyRegistrations } from './componentStories';
import { captureScreenshot, expect, test } from './playwright-fixtures';

interface PreviewWindow {
  __STORYBOOK_PREVIEW__?: { currentRender?: { phase?: string } }
}

/** The capture is named after the id without the sidebar prefix, which keeps existing names stable. */
function captureName(id: string) {
  return id.replace(/^(components|elements)-/, '');
}

/** Resolves once the story rendered and its play function, if any, finished. */
async function waitForStoryRendered(page: Page) {
  await page.waitForFunction(() => {
    const phase = (window as unknown as PreviewWindow).__STORYBOOK_PREVIEW__?.currentRender?.phase;
    if (phase === 'errored' || phase === 'aborted')
      throw new Error(`The story ended in phase ${phase}`);
    return phase === 'completed' || phase === 'finished';
  });
}

function registerStory({ id, viewport }: StoryRegistration, theme?: 'light' | 'dark') {
  const name = captureName(id);
  test(theme ? `${name}-${theme}` : name, async ({ page, storybookUrl }) => {
    const problems: string[] = [];
    page.on('pageerror', error => problems.push(`page error: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error' || message.text().includes('[Vue warn]'))
        problems.push(`console ${message.type()}: ${message.text()}`);
    });

    if (viewport)
      await page.setViewportSize(viewport);

    const globals = theme ? `theme:${theme}` : '';
    await page.goto(
      `${storybookUrl}/iframe.html?globals=${globals}&id=${id}&viewMode=story`,
    );
    await page.locator('body.sb-show-main').waitFor({ state: 'attached' });
    await waitForStoryRendered(page);

    await captureScreenshot(page);

    expect(problems).toEqual([]);
  });
}

storyRegistrations.forEach((registration) => {
  if (registration.themes)
    registration.themes.forEach(theme => registerStory(registration, theme));
  else
    registerStory(registration);
});
