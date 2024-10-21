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
  <div class="py-6 sm:py-12" itemscope itemtype="https://schema.org/Blog">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="mx-auto max-w-2xl lg:mx-0">
        <h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          From the blog
        </h2>
        <p class="mt-2 text-lg leading-8 text-gray-600">
          Learn how to grow your business with our expert advice.
        </p>
      </div>
      <div
        class="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none"
      >
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
      </div>
    </div>
  </div>
</template>
