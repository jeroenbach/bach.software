<script lang="ts" setup>
import type { PageReads } from '~/services/backend/models';

import type { BlogPost } from '~/types/BlogPost';
import { EyeIcon } from '@heroicons/vue/24/outline';
import { isNotNullOrUndefined } from '~/utils/checks';
import { formatDate } from '~/utils/date';

interface Props {
  /**
   * The post to display. Can be undefined while loading
   */
  post?: BlogPost
  baseUrl: string
  pageReads?: PageReads
}

const { pageReads } = defineProps<Props>();
/**
 * We've seen that the threeQuarterRead property gives a much higher count than the read property.
 * Probably this is the actual time most users take to read the article.
 */
const readCount = computed(() => pageReads?.threeQuarterRead);
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
            v-if="isNotNullOrUndefined(readCount)"
            :title="$t('read', { n: readCount })"
            class="flex h-8 items-center gap-1"
          >
            <EyeIcon class="inline-block size-4" />
            <span>{{ readCount }}</span>
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
