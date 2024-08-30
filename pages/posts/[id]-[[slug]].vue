<script lang="ts" setup>
import { EyeIcon } from "@heroicons/vue/24/outline";
import type { Article } from "~/types/Article";
import type { Author } from "~/types/Author";
import type { Config } from "~/types/Config";

const config = useState<Config>("config");
const { id, slug } = useRoute().params;
const { data: article } = await useAsyncData(() =>
  queryContent<Article>(`/posts/${id}`).findOne(),
);

const { data: author } = await useFetch<Author>(
  `/api/authors/${article.value?.author}`,
  { immediate: true, watch: [article] },
);

const articleUrl = computed(
  () => `${config.value.baseUrl}/posts/${id}-${slug}`,
);
</script>
<template>
  <div class="prose mx-auto">
    <article v-if="!article"></article>
    <article v-else class="prose prose-lg dark:prose-invert lg:prose-xl">
      <h1>{{ article?.title }}</h1>
      <div class="not-prose">
        <div v-if="author" class="relative mb-8 flex items-center gap-x-4">
          <NuxtPicture
            :src="author.image"
            sizes="50px"
            :alt="author.fullName"
            :imgAttrs="{ class: 'h-10 w-10 rounded-full bg-gray-50' }"
          />
          <div class="text-sm leading-6">
            <p class="font-semibold text-gray-800 dark:text-gray-300">
              <span>{{ author.fullName }}</span>
              <span> · </span>
              <a
                class="text-sky-600 hover:text-sky-800 dark:text-sky-500 dark:hover:text-sky-300"
                :href="author.linkedin"
                >{{ $t("Linkedin") }}</a
              >
            </p>
            <p class="text-gray-500 dark:text-gray-400">
              <span>{{ article.readTime }} {{ $t("read") }}</span>
              <span> · </span>
              <time>{{ article.date }}</time>
            </p>
          </div>
        </div>
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
          <div class="ms-auto flex items-center gap-1">
            <span>{{ $t("Share") }}:</span>
            <ShareOn :url="articleUrl" :text="article.title ?? ''" />
          </div>
        </div>
      </div>
      <ContentRenderer :value="article" />
    </article>
  </div>
</template>
