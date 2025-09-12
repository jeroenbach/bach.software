<script lang="ts" setup>
import { computed } from 'vue';

import NotificationMessage from '~/components/NotificationMessage.vue';
import { useReadProgressTracking } from '~/composables/useReadProgressTracking';

interface Props {
  wordCount: number
  readingTime: number
}

const { wordCount, readingTime } = defineProps<Props>();

const showProgress = ref(false);

const {
  totalProgress,
  timeSpentPercentage,
  scrollPercentage,
  minimumReadingTime,
} = useReadProgressTracking({
  wordCount,
  readingTime,
  disableEventTracking: true,
});

const readingTimeInMinutes = computed(() => {
  return (minimumReadingTime / 1000 / 60).toPrecision(3);
});
</script>

<template>
  <AppButton
    class="rounded-full bg-sky-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
    @click="showProgress = !showProgress"
  >
    {{ $t("pageReadProgress.openButton") }}
  </AppButton>
  <NotificationMessage v-if="showProgress" severity="info">
    <div class="flex flex-col">
      <span>{{ $t("pageReadProgress.wordCount", { wordCount }) }}</span>
      <span>{{
        $t("pageReadProgress.readingTime", { readingTimeInMinutes })
      }}</span>
      <span>{{
        $t("pageReadProgress.timeProgress", {
          timeSpentPercentage: timeSpentPercentage?.toFixed(1),
        })
      }}</span>
      <span>{{
        $t("pageReadProgress.scrollProgress", {
          scrollPercentage: scrollPercentage?.toFixed(1),
        })
      }}</span>
      <span>{{ $t("pageReadProgress.readingStage", { totalProgress }) }}</span>
    </div>
  </NotificationMessage>
</template>
