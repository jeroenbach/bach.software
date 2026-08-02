import { useAsyncState, useLocalStorage } from '@vueuse/core';

import { useTrackEvent } from '#imports';
import { useApiClient } from '~/services/backend';

/**
 * Composable for the like analytics of the current page.
 * Reads the number of unique visitors that fired the "like" custom event via the backend
 * (which queries Plausible), and exposes a `like` action that fires the event itself.
 *
 * Whether the current visitor already liked the page is remembered in localStorage,
 * so the thumbs up stays active on subsequent visits and the event isn't sent twice.
 *
 * @param {MaybeRefOrGetter<Record<string, string>>} [extraTrackingProps] - Additional properties to include in the like event.
 * @returns {object} An object containing the following properties:
 * - `likes`: A computed ref with the number of likes (including an optimistic +1 after liking).
 * - `isLoadingLikes`: Whether the likes are still being fetched.
 * - `hasLiked`: A ref indicating whether the current visitor has liked the page.
 * - `like`: Fires the "like" event, unless the visitor already liked the page.
 */
export function usePageLikesContext(extraTrackingProps?: MaybeRefOrGetter<Record<string, string>>) {
  const { path } = useRoute();
  // Read the stored value only after mount: reading it during setup makes the
  // client render "liked" while the server-rendered HTML says "not liked", and
  // Vue never patches that hydration mismatch — the thumb would stay inactive.
  const hasLiked = useLocalStorage(`liked:${path}`, false, { initOnMounted: true });
  // Optimistically count the visitor's own like, as Plausible only reports it on the next query
  const optimisticLikes = ref(0);

  const { state: fetchedLikes, isLoading: isLoadingLikes } = useAsyncState(
    async () => {
      if (!import.meta.client)
        return undefined;

      const config = useRuntimeConfig();
      let currentUrl = window.location.href;

      // Use a custom domain for Plausible analytics when specified
      const plausibleDomain = config.public.plausibleDomain;
      if (plausibleDomain) {
        currentUrl = currentUrl.replace(
          window.location.origin,
          `https://${plausibleDomain}`,
        );
      }

      const backendApiClient = useApiClient();
      const response = await backendApiClient.analytics.pageLikes.get({
        queryParameters: {
          url: currentUrl,
        },
      });
      return response;
    },
    undefined,
    {
      immediate: true,
      throwError: true, // show in the console, but not to the user
    },
  );

  const likes = computed(() => (fetchedLikes.value?.likes ?? 0) + optimisticLikes.value);

  const like = () => {
    if (!import.meta.client || hasLiked.value)
      return;

    hasLiked.value = true;
    optimisticLikes.value += 1;

    const trackingProps = toValue(extraTrackingProps) ?? {};
    useTrackEvent('like', { props: trackingProps });
  };

  return { likes, isLoadingLikes, hasLiked, like };
}
