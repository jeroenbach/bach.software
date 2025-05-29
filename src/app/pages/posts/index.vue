<script lang="ts" setup>
import { getBlogPosts } from "~/services/content/blogPostsService";

const { blog, company, config } = useBlogMetadata();
const { data: posts } = await getBlogPosts({ summary: true });

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
      <ContentDocLocaleContext path="/pages/posts" />
    </AppProse>
    <BlogPosts>
      <BlogPostSummary v-for="post in posts" :key="post._path" :post="post" />
    </BlogPosts>
  </PageContent>
</template>
