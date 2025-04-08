<script lang="ts" setup>
import { getBlogPosts } from "~/services/content/blogPostsService";

const { company, config } = useBlogMetadata();
const { id } = useRoute().params as { id: string; slug: string };
const { data: post } = await getBlogPosts({ id });
const author = post.value?.authorName ?? "";
const category = post.value?.category ?? "";
const wordCount = post.value?.readingTime?.words ?? 0;
const readingTime = post.value?.readingTime?.time ?? 0;

useReadProgressTracking({ wordCount, readingTime }, { author, category });

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
    <PageReadsContext v-slot="{ pageReads }">
      <BlogPost
        :post="post"
        :baseUrl="config?.baseUrl"
        :pageReads="pageReads"
      />
    </PageReadsContext>
  </PageContent>
</template>
