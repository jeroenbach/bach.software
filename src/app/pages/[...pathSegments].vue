<script lang="ts" setup>
import type { MetadataType } from '~/types/MetadataType';
import { postsPaths } from '~/locales.config';

const { path, params } = useRoute();
const { pathSegments } = params as { pathSegments: string[] };

const isRoot = pathSegments.length === 0;
const isBlogRoot = postsPaths.has(`/${pathSegments[0]}`) || isRoot; // temporary show the blog root on root path

const pageId = isBlogRoot
  ? 10 // id 10 is the blog root page
  : isRoot
    ? 1 // id 1 is the root page
    : -1; // invalid page

const alternateUrls = await useAlternateUrls('page', pageId);
const { data: page } = await usePagesContext(pageId);
const { data: posts } = isBlogRoot ? await useBlogPostsContext({ summary: true }) : { data: undefined };

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page Not Found' });
}

if (page.value.url && page.value.url !== path) {
  navigateTo(page.value.url, { redirectCode: 301 });
}

const metadataType: MetadataType = isBlogRoot ? 'blog' : 'page';
useMetadata(metadataType, page.value, alternateUrls, posts?.value);
</script>

<template>
  <PageContent>
    <AppProse v-if="page && page.enableProse">
      <ContentRenderer :value="page" />
    </AppProse>
    <ContentRenderer v-else-if="page" :value="page" />
    <BlogPosts v-if="isBlogRoot" :class="{ 'max-w-prose mx-auto': page?.enableProse }">
      <BlogPostSummary v-for="post in posts" :key="post.path" :post="post" />
    </BlogPosts>
  </PageContent>
</template>
