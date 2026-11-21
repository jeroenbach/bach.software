import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from '~/composables/useDestructiblePinia';
import { useMessageStore } from '~/composables/useMessageStore';
import { translate } from '~/tests/helpers/translate';
import { usePageReadsContext } from './usePageReadsContext';

const mock = vi.hoisted(() => ({
  getPageReads: vi.fn(async () => ({ opened: 1 })),
}));

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: translate }) }));

vi.mock('~/services/backend', () => ({
  useApiClient: () => ({
    analytics: { pageReads: { get: mock.getPageReads } },
  }),
}));

// In this unit (non-Nuxt) environment import.meta.client is undefined, which
// mirrors the server-side render.
vi.stubGlobal('useRuntimeConfig', () => ({ public: { plausibleDomain: '' } }));

describe('usePageReadsContext (server-side)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
  });

  it('should not query the page reads during server-side rendering', async () => {
    const { pageReads, isLoadingPageReads } = usePageReadsContext();

    await vi.waitFor(() => expect(isLoadingPageReads.value).toBe(false));
    expect(mock.getPageReads).not.toHaveBeenCalled();
    expect(pageReads.value).toBeUndefined();
  });

  it('should not report a message during server-side rendering', async () => {
    const { isLoadingPageReads } = usePageReadsContext();
    const { messages } = useMessageStore();

    await vi.waitFor(() => expect(isLoadingPageReads.value).toBe(false));
    expect(messages.value).toHaveLength(0);
  });
});
