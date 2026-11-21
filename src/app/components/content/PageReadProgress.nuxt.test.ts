import { describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';
import { useNuxtApp } from '#imports';
import { useMessageStore } from '~/composables/useMessageStore';
import { fixedOutlet, mountWithMessageBars, renderedAlerts } from '~/tests/helpers/messageBarHarness';
import PageReadProgress from './PageReadProgress.vue';

const mock = vi.hoisted(() => ({ track: vi.fn() }));

vi.mock('~/composables/useReadProgressTracking', () => ({
  useReadProgressTracking: mock.track,
}));

const t = (key: string, params?: Record<string, unknown>) => useNuxtApp().$i18n.t(key, params ?? {});

function trackedValues() {
  const values = {
    totalProgress: ref('opened'),
    timeSpentPercentage: ref(12.34),
    scrollPercentage: ref(45.67),
    minimumReadingTime: 150000,
  };
  mock.track.mockReturnValue(values);
  return values;
}

async function mountPanel() {
  const values = trackedValues();
  const harness = await mountWithMessageBars(PageReadProgress, { props: { wordCount: 500, readingTime: 150000 } });
  const toggle = async () => {
    const openButton = Array.from(document.body.querySelectorAll('button'))
      .find(button => button.textContent?.includes(t('pageReadProgress.openButton')));
    openButton!.click();
    await nextTick();
    await nextTick();
  };
  return { ...harness, values, toggle };
}

describe('pageReadProgress', () => {
  it('should show no panel until the button is clicked', async () => {
    await mountPanel();

    expect(renderedAlerts()).toHaveLength(0);
  });

  it('should show word count, reading time, time progress, scroll progress and reading stage when opened', async () => {
    const { toggle } = await mountPanel();

    await toggle();

    await vi.waitFor(() => expect(renderedAlerts()).toHaveLength(1));
    const text = renderedAlerts()[0]!.textContent!;
    expect(text).toContain(t('pageReadProgress.wordCount', { wordCount: 500 }));
    expect(text).toContain(t('pageReadProgress.readingTime', { readingTimeInMinutes: '2.50' }));
    expect(text).toContain(t('pageReadProgress.timeProgress', { timeSpentPercentage: '12.3' }));
    expect(text).toContain(t('pageReadProgress.scrollProgress', { scrollPercentage: '45.7' }));
    expect(text).toContain(t('pageReadProgress.readingStage', { totalProgress: 'opened' }));
  });

  it('should hide the panel when the button is clicked again', async () => {
    const { toggle } = await mountPanel();
    await toggle();
    await vi.waitFor(() => expect(renderedAlerts()).toHaveLength(1));

    await toggle();

    await vi.waitFor(() => expect(renderedAlerts()).toHaveLength(0));
  });

  it('should render the panel as a fixed message teleported into the fixed outlet', async () => {
    const { toggle } = await mountPanel();

    await toggle();

    await vi.waitFor(() => expect(fixedOutlet().querySelectorAll('[role="alert"]')).toHaveLength(1));
  });

  it('should add nothing to the message store', async () => {
    const { toggle, messages } = await mountPanel();

    await toggle();
    await vi.waitFor(() => expect(renderedAlerts()).toHaveLength(1));

    expect(messages.value).toHaveLength(0);
    expect(useMessageStore().messages.value).toHaveLength(0);
  });

  it('should update the panel when the tracked values change', async () => {
    const { toggle, values } = await mountPanel();
    await toggle();
    await vi.waitFor(() => expect(renderedAlerts()).toHaveLength(1));

    values.scrollPercentage.value = 80;
    values.totalProgress.value = 'half-read';

    await vi.waitFor(() => {
      const text = renderedAlerts()[0]!.textContent!;
      expect(text).toContain(t('pageReadProgress.scrollProgress', { scrollPercentage: '80.0' }));
      expect(text).toContain(t('pageReadProgress.readingStage', { totalProgress: 'half-read' }));
    });
  });

  it('should reopen with a single toggle click after the panel was dismissed through the bar', async () => {
    const { toggle } = await mountPanel();
    await toggle();
    await vi.waitFor(() => expect(renderedAlerts()).toHaveLength(1));

    renderedAlerts()[0]!.click();
    await vi.waitFor(() => expect(renderedAlerts()).toHaveLength(0));
    await toggle();

    await vi.waitFor(() => expect(renderedAlerts()).toHaveLength(1));
  });

  it('should reopen with a single toggle click after the panel was dismissed through its close button', async () => {
    const { toggle } = await mountPanel();
    await toggle();
    await vi.waitFor(() => expect(renderedAlerts()).toHaveLength(1));

    document.body.querySelector<HTMLElement>('[data-testid="page-read-progress-message-bar-close-button"]')!.click();
    await vi.waitFor(() => expect(renderedAlerts()).toHaveLength(0));
    await toggle();

    await vi.waitFor(() => expect(renderedAlerts()).toHaveLength(1));
  });

  it('should leave a single alert in the fixed outlet after opening, closing and opening again', async () => {
    const { toggle } = await mountPanel();

    await toggle();
    await vi.waitFor(() => expect(renderedAlerts()).toHaveLength(1));
    await toggle();
    await vi.waitFor(() => expect(renderedAlerts()).toHaveLength(0));
    await toggle();

    await vi.waitFor(() => expect(fixedOutlet().querySelectorAll('[role="alert"]')).toHaveLength(1));
  });
});
