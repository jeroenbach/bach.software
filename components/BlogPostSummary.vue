<script lang="ts" setup>
import type { Author } from "~/types/Author";
import type { PostSummary } from "~/types/Post";

defineProps<{
  post?: PostSummary;
  author?: Author;
}>();
</script>

<template>
  <article v-if="post" class="flex flex-col items-start gap-8 lg:flex-row">
    <div class="w-full lg:w-64">
      <NuxtLink :to="post.url">
        <NuxtPicture
          :src="post.imgCoverUrl"
          :alt="post.title"
          sizes="sm:640px, lg:256px"
          :imgAttrs="{
            class:
              'aspect-16/9 sm:aspect-2/1 lg:aspect-1/1 w-full rounded-2xl bg-slate-200 object-cover',
          }"
        />
      </NuxtLink>
    </div>
    <div class="flex max-w-xl flex-col items-start justify-between">
      <div class="flex items-center gap-x-4 text-xs">
        <time :datetime="post.date" class="text-gray-500"
          >{{ formatDate(post.date) }}
        </time>
        <ChipLink :to="`/posts?category=${post.category}`" class="z-10">{{
          post.category
        }}</ChipLink>
      </div>
      <div class="group relative max-w-xl">
        <AppLink :to="post.url">
          <h3
            class="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600"
          >
            <span class="absolute inset-0" />
            {{ post.title }}
          </h3>
          <ContentRenderer
            :value="post"
            :excerpt="true"
            class="mt-5 line-clamp-3 text-sm leading-6 text-gray-600"
          />
        </AppLink>
      </div>
      <AuthorInformation v-if="author" v-bind="author" class="mt-8" />
    </div>
  </article>
</template>
