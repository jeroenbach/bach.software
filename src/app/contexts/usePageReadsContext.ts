import { useApiState } from '~/composables/useApiState';
import { useApiClient } from '~/services/backend';

/**
 * Composable to the read analytics for the current page.
 */
export function usePageReadsContext() {
  const { mappedState: pageReads, isLoading: isLoadingPageReads } = useApiState(
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
      const response = await backendApiClient.analytics.pageReads.get({
        queryParameters: {
          url: currentUrl,
        },
      });
      return response;
    },
    undefined,
    {
      immediate: true,
      // A failed request resolves to null; the page treats that as "no data".
      mapData: data => data ?? undefined,
    },
  );

  return { pageReads, isLoadingPageReads };
}
