<script lang="ts" setup>
import { EyeIcon } from "@heroicons/vue/24/outline";
import type { Config } from "~/types/Config";
import type { Post } from "~/types/Post";

const config = useState<Config>("config");
const { id } = useRoute().params as { id: string; slug: string };

const setPost = (post: Post) => {
  if (!post) return;
  useSeoMeta({
    title: post.title,
    ogTitle: post.title,
    description: post.description,
    ogDescription: post.description,
    ogImage: post.imgCoverUrl,
    ogImageAlt: post.title,
  });
};
</script>
<template>
  <div class="prose mx-auto">
    <PostsContext :id="id" @load="setPost">
      <template #post="{ post }">
        <AuthorsContext :userName="post.author">
          <template #author="{ author }">
            <article class="prose prose-lg dark:prose-invert lg:prose-xl">
              <h1>{{ post.title }}</h1>
              <div class="not-prose">
                <div
                  v-if="author"
                  class="relative mb-8 flex items-center gap-x-4"
                >
                  <NuxtPicture
                    :src="author.imageUrl"
                    sizes="50px"
                    :alt="author.fullName"
                    :imgAttrs="{ class: 'h-10 w-10 rounded-full bg-gray-50' }"
                  />
                  <div class="text-sm leading-6">
                    <p class="font-semibold text-gray-800 dark:text-gray-300">
                      <span>{{ author.fullName }}</span>
                      <span> · </span>
                      <NuxtLink
                        class="text-sky-600 hover:text-sky-800 dark:text-sky-500 dark:hover:text-sky-300"
                        :to="author.linkedin"
                        >{{ $t("Linkedin") }}</NuxtLink
                      >
                    </p>
                    <p class="text-gray-500 dark:text-gray-400">
                      <span>{{ post.readTime }} {{ $t("read") }}</span>
                      <span> · </span>
                      <time>{{ formatDate(post.date) }}</time>
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
                    <ShareOn
                      :url="`${config.baseUrl}${post.value?.url}`"
                      :text="post.title ?? ''"
                    />
                  </div>
                </div>
              </div>
              <ContentRenderer :value="post" />
            </article>
          </template>
        </AuthorsContext>
      </template>
    </PostsContext>
  </div>
</template>
