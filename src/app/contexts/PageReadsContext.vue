<script lang="ts" setup>
import { useAsyncState } from "@vueuse/core";

import { useApiClient } from "~/services/backend";

const { state: pageReads } = useAsyncState(
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
</script>
<template>
  <slot :pageReads="pageReads" />
</template>
