import { useAsyncState } from "@vueuse/core";

import { useApiClient } from "~/services/backend";

/**
 * Composable to the read analytics for the current page.
 */
export const usePageReadsContext = () => {
  const { state: pageReads, isLoading: isLoadingPageReads } = useAsyncState(
    async () => {
      if (!import.meta.client) return undefined;

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
      throwError: true, // show in the console, but not to the user
    },
  );

  return { pageReads, isLoadingPageReads };
};
