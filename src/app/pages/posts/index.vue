<script lang="ts" setup>
const { blog, company, config } = useBlogMetadata();
// const { data: posts } = await useBlogPostsContext({ summary: true });

const { data: posts } = await useAsyncData(
  "posts",
  () => {
    return queryCollection("posts").all();
  },
  {
    transform: (data) => {
      return data.map((post) => {
        delete post.body;
        return post;
      });
    },
  },
);
const { data: page } = await useAsyncData("page", () => {
  return queryCollection("page").first();
});

// useMetadata({
//   baseUrl: config.value.baseUrl,
//   title: blog.name,
//   description: blog.description,
//   imageUrl: blog.imageUrl,
//   imageAlt: blog.imageAlt,
//   url: blog.url,
//   canonicalUrl: blog.url,
//   structuredData: createBlogMetadataContext(
//     config.value.baseUrl,
//     blog,
//     posts.value ?? [],
//     company,
//   ),
// });
</script>
<template>
  <PageContent>
    <pre>{{ posts }}</pre>
    <AppProse>
      <ContentRenderer v-if="page" :value="page" />
      <!-- <ContentDocLocaleContext path="/pages/posts" /> -->
    </AppProse>
    <!-- <BlogPosts>
      <BlogPostSummary v-for="post in posts" :key="post._path" :post="post" />
    </BlogPosts> -->
  </PageContent>
</template>
