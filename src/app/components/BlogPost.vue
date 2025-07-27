<script lang="ts" setup>
import { EyeIcon } from "@heroicons/vue/24/outline";

import { formatDate } from "~/utils/date";
import { isNotNullOrUndefined } from "~/utils/checks";
import type { BlogPost } from "~/types/BlogPost";
import type { PageReads } from "~/services/backend/models";

interface Props {
  /**
   * The post to display. Can be undefined while loading
   */
  post?: BlogPost;
  baseUrl: string;
  pageReads?: PageReads;
}

defineProps<Props>();
</script>

<template>
  <AppProse>
    <article v-if="post">
      <h1>{{ post.title }}</h1>
      <div class="not-prose">
        <AuthorInformation v-bind="post.author" class="mb-8">
          <template #bottomLine>
            <span>{{ post.readingTime?.text }}</span>
            <span> · </span>
            <time>{{ formatDate(post.datePublished) }}</time>
          </template>
        </AuthorInformation>
        <div
          class="flex border-y border-gray-200 px-3 py-1 text-xs text-gray-500 dark:border-gray-400 dark:text-gray-400 md:py-1.5"
        >
          <div
            v-if="isNotNullOrUndefined(pageReads)"
            :title="$t('read', { n: pageReads.read })"
            class="flex h-8 items-center gap-1"
          >
            <EyeIcon class="inline-block size-4" />
            <span>{{ pageReads.read }}</span>
          </div>
          <aside class="ms-auto flex h-8 items-center gap-2">
            <span>{{ $t("Share") }}:</span>
            <ShareOn :url="`${baseUrl}${post?.url}`" :text="post.title ?? ''" />
          </aside>
        </div>
      </div>
      <ContentRenderer :value="post" itemprop="articleBody" />
    </article>
  </AppProse>
</template>
