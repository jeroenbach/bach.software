<script lang="ts" setup>
import { useBlogPostsContext } from "~/contexts/useBlogPostsContext";

const { blog, company, config } = useBlogMetadata();
const { data: posts } = await useBlogPostsContext({ summary: true });

useMetadata({
  baseUrl: config.value.baseUrl,
  title: blog.name,
  description: blog.description,
  imageUrl: blog.imageUrl,
  imageAlt: blog.imageAlt,
  url: blog.url,
  canonicalUrl: blog.url,
  structuredData: createBlogMetadataContext(
    config.value.baseUrl,
    blog,
    posts.value ?? [],
    company,
  ),
});
</script>
<template>
  <PageContent>
    <AppProse>
      <ContentDoc path="/pages/_posts" />
    </AppProse>
    <BlogPosts>
      <BlogPostSummary v-for="post in posts" :post="post" />
    </BlogPosts>
  </PageContent>
</template>
