<script lang="ts" setup>
import type { MetadataType } from '~/composables/useMetadata';
import { postsPaths } from '~/locales.config';

const { pathSegments } = useRoute().params as { pathSegments: string[] };

const isRoot = pathSegments.length === 0;
const isBlogRoot = postsPaths.has(`/${pathSegments[0]}`);

const pageId = isRoot
  ? 1 // id 1 is the root page
  : isBlogRoot
    ? 10 // id 10 is the blog root page
    : -1; // invalid page
const pageType: MetadataType = isBlogRoot ? 'blog' : 'page';

const { data: page } = await usePagesContext(pageId);
const { data: posts } = isBlogRoot ? await useBlogPostsContext({ summary: true }) : { data: undefined };

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page Not Found' });
}
useMetadata(pageType, page.value, posts?.value);
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
