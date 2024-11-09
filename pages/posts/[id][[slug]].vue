<script lang="ts" setup>
import { useBlogPostsContext } from "~/contexts/useBlogPostsContext";

const { company, config } = useBlogMetadata();
const { id } = useRoute().params as { id: string; slug: string };
const { data: post } = await useBlogPostsContext({ id });

// useMetadata(
//   () =>
//     post.value && {
//       baseUrl: config.value.baseUrl,
//       title: post.value.title,
//       description: post.value.description,
//       imageUrl: post.value.imgCoverUrl,
//       imageAlt: post.value.title,
//       url: post.value.url,
//       structuredData: createBlogPostingMetadataContext(
//         config.value.baseUrl,
//         post.value,
//         company,
//       ),
//     },
// );

useMetadata2(
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
    <BlogPost :post="post" :baseUrl="config?.baseUrl" />
  </PageContent>
</template>
