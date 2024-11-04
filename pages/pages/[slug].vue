<script lang="ts" setup>
import { usePagesContext } from "~/contexts/usePagesContext";

const { slug } = useRoute().params as { slug: string };

const config = useConfig();

const { data: page } = await usePagesContext(slug);

useMetadata(
  () =>
    page.value && {
      baseUrl: config.value.baseUrl,
      title: page.value.title,
      description: page.value.description,
      url: page.value._path,
      structuredData: createWebPageMetadataContext(
        config.value.baseUrl,
        page.value,
      ),
    },
);
</script>

<template>
  <PageContent itemscope itemtype="https://schema.org/WebPage">
    <AppProse>
      <ContentRenderer v-if="page" :value="page" itemprop="mainContentOfPage" />
    </AppProse>
  </PageContent>
</template>
