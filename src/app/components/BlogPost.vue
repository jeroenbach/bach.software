<script lang="ts" setup>
import type { BlogPost } from '~/types/BlogPost';
import type { PostReads } from '~/types/PostReads';
import { EyeIcon } from '@heroicons/vue/24/outline';
import { isNotNullOrUndefined } from '~/utils/checksUtil';
import { formatDate } from '~/utils/dateUtil';

interface Props {
  /**
   * The post to display. Can be undefined while loading
   */
  post?: BlogPost
  baseUrl: string
  reads?: PostReads
  /**
   * The number of likes to display for the post
   */
  likes?: number | null
  /**
   * Whether the current user has already liked the post
   */
  hasLiked?: boolean
}

const { reads } = defineProps<Props>();

defineEmits<{
  like: []
}>();
const readCount = computed(() => reads?.readCount);
</script>

<template>
  <AppProse>
    <article v-if="post">
      <h1 data-pagefind-weight="10" data-pagefind-meta="title">
        {{ post.title }}
      </h1>
      <div class="not-prose" data-pagefind-ignore>
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
            v-if="isNotNullOrUndefined(readCount) && readCount > 0"
            :title="$t('blog.readCount', { n: readCount })"
            class="me-4 flex h-8 items-center gap-1"
          >
            <EyeIcon class="inline-block size-4" />
            <span>{{ readCount }}</span>
          </div>
          <LikeButton :count="likes" :liked="hasLiked" @like="$emit('like')" />
          <aside class="ms-auto flex h-8 items-center gap-2">
            <span>{{ $t("blog.share") }}:</span>
            <ShareOn :url="`${baseUrl}${post?.url}`" :text="post.title ?? ''" />
          </aside>
        </div>
        <slot name="tableOfContents" />
      </div>
      <ContentRenderer :value="post" itemprop="articleBody" />
    </article>
  </AppProse>
</template>
