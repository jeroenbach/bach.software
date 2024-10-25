<script lang="ts" setup>
import PostsContext from "~/contexts/PostsContext.vue";
import AuthorsContext from "~/contexts/AuthorsContext.vue";
import type { PostSummary } from "~/types/Post";
import type { Author } from "~/types/Author";

const { blog, company, config } = useBlogMetadata();
const _posts = ref<PostSummary[]>([]);
const _authors = ref<{ [key: string]: Author }>({});

useMetadata(() => ({
  baseUrl: config.value.baseUrl,
  title: blog.name,
  description: blog.description,
  imageUrl: blog.imageUrl,
  imageAlt: blog.imageAlt,
  url: blog.url,
  structuredData: createBlogMetadataContext(
    config.value.baseUrl,
    blog,
    _posts.value,
    Object.entries(_authors.value).map(([_, author]) => author),
    company,
  ),
}));
</script>
<template>
  <PageContent>
    <AppProse>
      <ContentDoc path="/pages/_posts" />
    </AppProse>
    <BlogPosts>
      <PostsContext summary @load="(p) => (_posts = p)">
        <template #post="{ post }">
          <AuthorsContext
            :userName="post.author"
            @load="(a) => (_authors[a?.userName] = a)"
          >
            <template #author="{ author }">
              <BlogPostSummary :post="post" :author="author" />
            </template>
          </AuthorsContext>
        </template>
      </PostsContext>
    </BlogPosts>
  </PageContent>
</template>
