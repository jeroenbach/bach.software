<script lang="ts" setup>
import { useAsyncState } from "@vueuse/core";

import { useAzureApi } from "~/services/useAzureApi";
const { getPageViews } = useAzureApi();

const { state: pageReads } = useAsyncState(
  async () => {
    if (!import.meta.client) return null;

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

    const response = await getPageViews(currentUrl);
    return response;
  },
  null,
  { immediate: true },
);
</script>
<template>
  <slot :pageReads="pageReads" />
</template>
