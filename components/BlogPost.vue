<script lang="ts" setup>
import { EyeIcon } from "@heroicons/vue/24/outline";
import type { Author } from "~/types/Author";
import type { Post } from "~/types/Post";

defineProps<{
  post: Post;
  author?: Author;
  baseUrl?: string;
}>();
</script>

<template>
  <article
    v-if="post"
    class="prose prose-lg dark:prose-invert lg:prose-xl"
    itemtype="https://schema.org/BlogPosting"
    itemprop="blogPost"
  >
    <h1 itemprop="headline">{{ post.title }}</h1>
    <div class="not-prose">
      <AuthorInformation v-if="author" v-bind="author" class="mb-8">
        <template #bottomLine>
          <span itemprop="timeRequired"
            >{{ post.readTime }} {{ $t("read") }}</span
          >
          <span> · </span>
          <time itemprop="datePublished">{{ formatDate(post.date) }}</time>
        </template>
      </AuthorInformation>
      <div
        class="flex border-y border-gray-200 px-3 py-1 text-xs text-gray-500 dark:text-gray-400"
      >
        <div
          v-if="false"
          :title="`${200} views`"
          class="flex h-8 items-center gap-1"
        >
          <EyeIcon class="inline-block size-4" />
          <span>200</span>
        </div>
        <aside class="ms-auto flex items-center gap-1">
          <span>{{ $t("Share") }}:</span>
          <ShareOn
            :url="`${baseUrl}${post.value?.url}`"
            :text="post.title ?? ''"
          />
        </aside>
      </div>
    </div>
    <ContentRenderer :value="post" itemprop="articleBody" />
  </article>
</template>
