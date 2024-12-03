import { useAzureApi } from "~/services/useAzureApi";
import { useAsyncState } from "@vueuse/core";

export const usePageReads = () => {
  const { getPageViews } = useAzureApi();

  return useAsyncState(
    async () => {
      if (!import.meta.client) return null;

      const currentUrl = window.location.href;
      const response = await getPageViews(currentUrl);
      return response;
    },
    null,
    { immediate: true },
  );
};
