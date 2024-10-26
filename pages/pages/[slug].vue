<script lang="ts" setup>
const config = useConfig();

// useMetadata(() => ({
//   baseUrl: config.value.baseUrl,
//   title: blog.name,
//   description: blog.description,
//   imageUrl: blog.imageUrl,
//   imageAlt: blog.imageAlt,
//   url: blog.url,
//   structuredData: createBlogMetadataContext(
//     config.value.baseUrl,
//     blog,
//     _posts.value,
//     Object.entries(_authors.value).map(([_, author]) => author),
//     company,
//   ),
// }));
</script>

<template>
  <PageContent itemscope itemtype="https://schema.org/WebPage">
    <h1 itemprop="name">Title</h1>
    <ContentDoc />
  </PageContent>
</template>
