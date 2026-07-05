import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { usePageLikesContext } from './usePageLikesContext';

const mock = vi.hoisted(() => ({
  useTrackEvent: vi.fn(),
  getPageLikes: vi.fn(async () => ({ likes: 42 })),
}));

vi.mock('~/services/backend', () => ({
  useApiClient: () => ({
    analytics: { pageLikes: { get: mock.getPageLikes } },
  }),
}));

mockNuxtImport('useTrackEvent', () => mock.useTrackEvent);

describe('usePageLikesContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useRuntimeConfig().public.plausibleDomain = '';
  });

  it('should fetch the like count for the current page', async () => {
    const { likes, hasLiked } = usePageLikesContext();

    await vi.waitFor(() => expect(likes.value).toBe(42));
    expect(mock.getPageLikes).toHaveBeenCalledTimes(1);
    expect(hasLiked.value).toBe(false);
  });

  it('should track a like event and optimistically increment the count', async () => {
    const { likes, hasLiked, like } = usePageLikesContext(() => ({
      author: 'jeroenbach',
      category: 'Vue.js',
    }));
    await vi.waitFor(() => expect(likes.value).toBe(42));

    like();

    expect(hasLiked.value).toBe(true);
    expect(likes.value).toBe(43);
    expect(mock.useTrackEvent).toHaveBeenCalledWith('like', {
      props: { author: 'jeroenbach', category: 'Vue.js' },
    });
  });

  it('should not track the like event twice', async () => {
    const { likes, like } = usePageLikesContext();
    await vi.waitFor(() => expect(likes.value).toBe(42));

    like();
    like();

    expect(likes.value).toBe(43);
    expect(mock.useTrackEvent).toHaveBeenCalledTimes(1);
  });

  it('should query the likes on the configured plausible domain', async () => {
    useRuntimeConfig().public.plausibleDomain = 'plausible.bach.software';

    const { likes } = usePageLikesContext();

    await vi.waitFor(() => expect(likes.value).toBe(42));
    expect(mock.getPageLikes).toHaveBeenCalledWith({
      queryParameters: {
        url: expect.stringContaining('https://plausible.bach.software/'),
      },
    });
  });

  it('should remember a previous like of the visitor', async () => {
    localStorage.setItem('liked:/', 'true');

    const { hasLiked, like } = usePageLikesContext();
    expect(hasLiked.value).toBe(true);

    like();
    expect(mock.useTrackEvent).not.toHaveBeenCalled();
  });
});
