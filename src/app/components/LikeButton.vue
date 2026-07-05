<script lang="ts" setup>
import { HandThumbUpIcon } from '@heroicons/vue/24/outline';
import { HandThumbUpIcon as HandThumbUpIconSolid } from '@heroicons/vue/24/solid';
import { isNotNullOrUndefined } from '~/utils/checks';

interface Props {
  /**
   * The number of likes to display. Hidden while undefined or 0.
   */
  count?: number | null
  /**
   * Whether the current user has already liked the article
   */
  liked?: boolean
}

const { count, liked = false } = defineProps<Props>();

const emit = defineEmits<{
  like: []
}>();
</script>

<template>
  <button
    type="button"
    class="flex h-8 cursor-pointer items-center gap-1 transition-colors hover:text-sky-600 dark:hover:text-sky-400"
    :class="{ 'text-sky-600 dark:text-sky-400': liked }"
    :aria-pressed="liked"
    :aria-label="$t('likeThisArticle')"
    :title="isNotNullOrUndefined(count) && count > 0 ? $t('likes', { n: count }) : $t('likeThisArticle')"
    @click="emit('like')"
  >
    <HandThumbUpIconSolid v-if="liked" class="inline-block size-4" />
    <HandThumbUpIcon v-else class="inline-block size-4" />
    <span v-if="isNotNullOrUndefined(count) && count > 0">{{ count }}</span>
  </button>
</template>
