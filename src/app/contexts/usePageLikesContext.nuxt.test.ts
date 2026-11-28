import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';

import { kiotaError } from '~/tests/helpers/apiErrors';
import { mountWithContexts } from '~/tests/helpers/mountWithContexts';
import { usePageLikesContext } from './usePageLikesContext';

const mock = vi.hoisted(() => ({
  useTrackEvent: vi.fn(),
  getPageLikes: vi.fn(),
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
    mock.getPageLikes.mockResolvedValue({ likes: 42 });
    localStorage.clear();
    useRuntimeConfig().public.plausibleDomain = '';
  });

  it('should fetch the like count for the current page', async () => {
    const { results: [{ likes, hasLiked }] } = await mountWithContexts(() => usePageLikesContext());

    await vi.waitFor(() => expect(likes.value).toBe(42));
    expect(mock.getPageLikes).toHaveBeenCalledTimes(1);
    expect(hasLiked.value).toBe(false);
  });

  it('should track a like event and optimistically increment the count', async () => {
    const { results: [{ likes, hasLiked, like }] } = await mountWithContexts(() => usePageLikesContext(() => ({
      author: 'jeroenbach',
      category: 'Vue.js',
    })));
    await vi.waitFor(() => expect(likes.value).toBe(42));

    like();

    expect(hasLiked.value).toBe(true);
    expect(likes.value).toBe(43);
    expect(mock.useTrackEvent).toHaveBeenCalledWith('like', {
      props: { author: 'jeroenbach', category: 'Vue.js' },
    });
  });

  it('should not track the like event twice', async () => {
    const { results: [{ likes, like }] } = await mountWithContexts(() => usePageLikesContext());
    await vi.waitFor(() => expect(likes.value).toBe(42));

    like();
    like();

    expect(likes.value).toBe(43);
    expect(mock.useTrackEvent).toHaveBeenCalledTimes(1);
  });

  it('should query the likes on the configured plausible domain', async () => {
    useRuntimeConfig().public.plausibleDomain = 'plausible.bach.software';

    const { results: [{ likes }] } = await mountWithContexts(() => usePageLikesContext());

    await vi.waitFor(() => expect(likes.value).toBe(42));
    expect(mock.getPageLikes).toHaveBeenCalledWith({
      queryParameters: {
        url: expect.stringContaining('https://plausible.bach.software/'),
      },
    });
  });

  it('should remember a previous like of the visitor', async () => {
    localStorage.setItem('liked:/', 'true');

    const { results: [{ hasLiked, like }] } = await mountWithContexts(() => usePageLikesContext());
    expect(hasLiked.value).toBe(true);

    like();
    expect(mock.useTrackEvent).not.toHaveBeenCalled();
  });

  it('should read the previous like only after mount, to avoid a hydration mismatch', async () => {
    localStorage.setItem('liked:/', 'true');

    let hasLikedDuringSetup: boolean | undefined;
    let hasLiked: Ref<boolean> | undefined;
    const component = defineComponent({
      setup() {
        ({ hasLiked } = usePageLikesContext());
        hasLikedDuringSetup = hasLiked.value;
        return () => h('div');
      },
    });

    await mountSuspended(component);

    // During setup (= what gets hydrated) the value must match the server-rendered "false"
    expect(hasLikedDuringSetup).toBe(false);
    // After mount the stored like kicks in as a regular reactive update
    expect(hasLiked!.value).toBe(true);
  });

  // Analytics failures are deliberately invisible (`reportErrors: false`):
  // the page renders without the counters instead of showing an error bar.
  describe('failures', () => {
    it.each([
      ['a 502', kiotaError(502)],
      ['a 503', kiotaError(503)],
      ['a 500', kiotaError(500)],
      ['a 404', kiotaError(404)],
      ['a validation failure', kiotaError(400, { title: 'Validation failed', errors: { url: ['urlRequired'] } })],
      ['an unmapped status', kiotaError(418)],
      ['a network failure', new TypeError('Failed to fetch')],
    ])('should stay silent and keep the count at zero for %s', async (_, error) => {
      mock.getPageLikes.mockRejectedValue(error);

      const { results: [{ likes, isLoadingLikes }], messages } = await mountWithContexts(() => usePageLikesContext());

      await vi.waitFor(() => expect(mock.getPageLikes).toHaveBeenCalled());
      await vi.waitFor(() => expect(isLoadingLikes.value).toBe(false));
      expect(likes.value).toBe(0);
      expect(messages.value).toHaveLength(0);
    });

    it('should show no message after a successful fetch', async () => {
      const { results: [{ likes }], messages } = await mountWithContexts(() => usePageLikesContext());

      await vi.waitFor(() => expect(likes.value).toBe(42));
      expect(messages.value).toHaveLength(0);
    });
  });
});
