<script lang="ts" setup>
import { useBlogPostsContext } from "~/contexts/useBlogPostsContext";
import { usePageReads } from "~/services/analytics/usePageReads";
import { useScroll, useTimestamp } from "@vueuse/core";

const { company, config } = useBlogMetadata();
const { id } = useRoute().params as { id: string; slug: string };
const { data: post } = await useBlogPostsContext({ id });
const { state: pageReads } = usePageReads();
const { hasRead, percentageScrolled, timeSpent } = usePageRead({
  wordCount: post.value?.readingTime?.words,
});
const { y: scrollY } = useScroll(window, {});
// const { hasRead } = useArticleRead({
//   scrollThreshold: 70,
//   timeThreshold: 30,
//   wordCount: props.article?.wordCount
// })

// // Watch for read completion
// watch(hasRead, async (newValue) => {
//   if (newValue) {
//     await usePageReads() // Record the read in analytics
//   }
// })

useMetadata(
  post.value && {
    baseUrl: config.value.baseUrl,
    title: post.value.title,
    description: post.value.description,
    imageUrl: post.value.imgCoverUrl,
    imageAlt: post.value.title,
    url: post.value.url,
    structuredData: createBlogPostingMetadataContext(
      config.value.baseUrl,
      post.value,
      company,
    ),
  },
);
</script>
<template>
  <PageContent>
    scrollY: {{ scrollY }}<br />
    wordCount: {{ post?.readingTime?.words }}<br />
    hasRead: {{ hasRead }}<br />
    scrollPercentage: {{ percentageScrolled }}<br />
    timeSpent: {{ timeSpent }}<br />

    <BlogPost :post="post" :baseUrl="config?.baseUrl" :pageReads="pageReads" />

    scrollY: {{ scrollY }}<br />
    wordCount: {{ post?.readingTime?.words }}<br />
    hasRead: {{ hasRead }}<br />
    scrollPercentage: {{ percentageScrolled }}<br />
    timeSpent: {{ timeSpent }}<br />
  </PageContent>
</template>
