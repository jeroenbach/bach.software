<script lang="ts" setup>
import { getBlogPosts } from "~/services/content/blogPostsService";

const { company, config } = useBlogMetadata();
const { id } = useRoute().params as { id: string; slug: string };
const { data: post } = await getBlogPosts({ id });
const { hasRead, percentageScrolled, timeSpent } = usePageRead({
  wordCount: post.value?.readingTime?.words,
});

// Watch for read completion
watch(hasRead, async (newValue) => {
  if (newValue) {
    // Record the read in analytics
  }
});

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
    wordCount: {{ post?.readingTime?.words }}<br />
    hasRead: {{ hasRead }}<br />
    scrollPercentage: {{ percentageScrolled }}<br />
    timeSpent: {{ timeSpent }}<br />

    <PageReadsContext v-slot="{ pageReads }">
      <BlogPost
        :post="post"
        :baseUrl="config?.baseUrl"
        :pageReads="pageReads"
      />
    </PageReadsContext>
    wordCount: {{ post?.readingTime?.words }}<br />
    hasRead: {{ hasRead }}<br />
    scrollPercentage: {{ percentageScrolled }}<br />
    timeSpent: {{ timeSpent }}<br />
  </PageContent>
</template>
