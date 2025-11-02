<script lang="ts" setup>
import { pagesPaths, postsPaths } from '~/locales.config';

const { path, params } = useRoute();
const config = useRuntimeConfig();

const { segment1, id } = params as { segment1: string, id: string, slug: string };

const isPage = pagesPaths.has(`/${segment1}`);
const isPost = postsPaths.has(`/${segment1}`);

const { data: page } = isPage ? await usePagesContext(Number(id)) : { data: undefined };
const { data: post } = isPost ? await useBlogPostsContext({ id: Number(id) }) : { data: undefined };
const { pageReads } = isPost ? await usePageReadsContext() : { pageReads: undefined };

const configuredPath = computed(() => page?.value?.url || post?.value?.url || undefined);

if (path !== configuredPath.value) {
  navigateTo(configuredPath.value || '/', { redirectCode: 301 });
}
const pageType: MetadataType = isPost ? 'blogPost' : 'page';

useMetadata(pageType, page?.value ?? post?.value);
</script>

<template>
  <PageContent>
    <AppProse v-if="page && page.enableProse">
      <ContentRenderer :value="page" />
    </AppProse>
    <ContentRenderer v-else-if="page" :value="page" />
    <BlogPost v-else-if="post" :post="post" :baseUrl="config.public.baseUrl" :pageReads="pageReads" />
  </PageContent>
</template>
