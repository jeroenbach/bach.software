<script lang="ts" setup>
import PostsContext from "~/contexts/PostsContext.vue";
import AuthorsContext from "~/contexts/AuthorsContext.vue";
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
        <PostsContext summary>
          <template #post="{ post }">
            <AuthorsContext :userName="post.author">
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
