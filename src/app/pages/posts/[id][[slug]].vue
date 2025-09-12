<script lang="ts" setup>
const config = useConfig();
const { id } = useRoute().params as { id: string, slug: string };
const { data: post } = await useBlogPostsContext({ id });
const author = post.value?.authorName ?? '';
const category = post.value?.category ?? '';
const wordCount = post.value?.readingTime?.words ?? 0;
const readingTime = post.value?.readingTime?.time ?? 0;

useReadProgressTracking({ wordCount, readingTime }, { author, category });
const { pageReads } = usePageReadsContext();

useMetadata('blogPost', post.value);
</script>

<template>
  <PageContent>
    <BlogPost :post="post" :baseUrl="config?.baseUrl" :pageReads="pageReads" />
  </PageContent>
</template>
