<script lang="ts" setup>
import { useAsyncState } from "@vueuse/core";
import { useAzureApi } from "~/services/useAzureApi";
const { getPageViews } = useAzureApi();

const { state: pageReads } = useAsyncState(
  async () => {
    if (!import.meta.client) return null;

    const currentUrl = window.location.href;
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
