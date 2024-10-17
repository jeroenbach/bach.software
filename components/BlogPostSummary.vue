<script lang="ts" setup>
import type { Author } from "~/types/Author";
import type { PostSummary } from "~/types/Post";

defineProps<{
  post?: PostSummary;
  author?: Author;
}>();
</script>

<template>
  <article
    v-if="post"
    class="flex flex-col items-start gap-8 lg:flex-row"
    itemtype="https://schema.org/BlogPosting"
    itemprop="blogPost"
  >
    <div class="w-full lg:w-64">
      <AppLink :to="post.url">
        <AppImage
          :src="post.imgCoverUrl"
          :alt="post.title"
          :partOfScreenSmall="1"
          :partOfScreenLarge="1 / 4"
          aspectRatio="16/9"
          aspectRatioSmall="2/1"
          aspectRatioLarge="1/1"
          class="w-full rounded-2xl"
          itemprop="thumbnail"
        />
      </AppLink>
    </div>
    <div class="flex max-w-xl flex-col items-start justify-between">
      <div class="flex items-center gap-x-4 text-xs">
        <time
          class="text-gray-500"
          :datetime="post.date"
          itemprop="datePublished"
        >
          {{ formatDate(post.date) }}
        </time>
        <ChipLink :to="`/posts?category=${post.category}`" class="z-10">{{
          post.category
        }}</ChipLink>
      </div>
      <div class="group relative max-w-xl">
        <AppLink :to="post.url">
          <h3
            class="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600"
            itemprop="headline"
          >
            <span class="absolute inset-0" />
            {{ post.title }}
          </h3>
          <ContentRenderer
            :value="post"
            :excerpt="true"
            class="mt-5 line-clamp-3 text-sm leading-6 text-gray-600"
            itemprop="description"
          />
        </AppLink>
      </div>
      <AuthorInformation v-if="author" v-bind="author" class="mt-8" />
    </div>
  </article>
</template>
