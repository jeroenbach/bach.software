<script lang="ts" setup>
import type { BlogPage } from '~/types/BlogPage';

const [{ data: page }, { data: posts }] = await Promise.all([
  usePagesContext<BlogPage>('posts'),
  useBlogPostsContext({ summary: true }),
]);

useMetadata('blog', page.value, posts.value);
</script>

<template>
  <PageContent>
    <AppProse>
      <ContentRenderer :value="page" />
    </AppProse>
    <BlogPosts>
      <BlogPostSummary v-for="post in posts" :key="post._path" :post="post" />
    </BlogPosts>
  </PageContent>
</template>
