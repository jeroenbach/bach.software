<script lang="ts" setup>
import type { BlogPostSummary } from "~/types/BlogPost";

const { post } = defineProps<{
  post: BlogPostSummary;
}>();

const formattedDatePublished = computed(() => formatDate(post?.datePublished));
</script>

<template>
  <article v-if="post" class="flex flex-col items-start gap-8 lg:flex-row">
    <div class="w-full lg:w-72">
      <AppLink :to="post.url">
        <ResponsiveImage
          :src="post.imageUrl"
          :alt="post.title"
          :partOfScreenSmall="1"
          :partOfScreenLarge="1 / 6"
          aspectRatio="16/9"
          aspectRatioSmall="2/1"
          aspectRatioLarge="1/1"
          class="w-full rounded-2xl drop-shadow-md"
          :class="post.imagePosition"
        />
      </AppLink>
    </div>
    <div class="flex flex-col items-start justify-between">
      <div class="flex items-center gap-x-4">
        <time
          class="text-xs-em text-gray-500 dark:text-gray-500"
          :datetime="post.datePublished"
        >
          {{ formattedDatePublished }}
        </time>
        <ChipLink :to="`/posts?category=${post.category}`">{{
          post.category
        }}</ChipLink>
      </div>
      <div class="group relative">
        <AppLink :to="post.url">
          <h3
            class="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-700 dark:text-gray-50 dark:group-hover:text-gray-200"
          >
            {{ post.title }}
          </h3>
          <AppProse>
            <ContentRenderer
              :value="post"
              :excerpt="true"
              class="line-clamp-4 text-sm leading-6 group-hover:text-gray-600 dark:group-hover:text-gray-300"
            />
          </AppProse>
        </AppLink>
      </div>
      <AuthorInformation v-bind="post.author" class="mt-4 lg:mt-4" />
    </div>
  </article>
</template>
