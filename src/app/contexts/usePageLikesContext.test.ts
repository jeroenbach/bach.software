import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref, toValue } from 'vue';

import { usePageLikesContext } from './usePageLikesContext';

const mock = vi.hoisted(() => ({
  useTrackEvent: vi.fn(),
  getPageLikes: vi.fn(async () => ({ likes: 42 })),
}));

vi.mock('#imports', () => ({ useTrackEvent: mock.useTrackEvent }));

vi.mock('~/services/backend', () => ({
  useApiClient: () => ({
    analytics: { pageLikes: { get: mock.getPageLikes } },
  }),
}));

// In this unit (non-Nuxt) environment import.meta.client is undefined, which
// mirrors the server-side render; the Nuxt auto-imports are stubbed manually.
vi.stubGlobal('ref', ref);
vi.stubGlobal('computed', computed);
vi.stubGlobal('toValue', toValue);
vi.stubGlobal('useRoute', () => ({ path: '/posts/1-first-post' }));
vi.stubGlobal('useRuntimeConfig', () => ({ public: { plausibleDomain: '' } }));

describe('usePageLikesContext (server-side)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should not query the likes during server-side rendering', async () => {
    const { likes, isLoadingLikes } = usePageLikesContext();

    await vi.waitFor(() => expect(isLoadingLikes.value).toBe(false));
    expect(mock.getPageLikes).not.toHaveBeenCalled();
    expect(likes.value).toBe(0);
  });

  it('should not track a like event during server-side rendering', async () => {
    const { likes, hasLiked, like } = usePageLikesContext();

    like();

    expect(hasLiked.value).toBe(false);
    expect(likes.value).toBe(0);
    expect(mock.useTrackEvent).not.toHaveBeenCalled();
  });
});
