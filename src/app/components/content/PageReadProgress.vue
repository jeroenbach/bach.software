<script lang="ts" setup>
import { computed } from "vue";

import { useReadProgressTracking } from "@/composables/useReadProgressTracking";
import NotificationMessage from "@/components/NotificationMessage.vue";

interface Props {
  wordCount: number;
  readingTime: number;
}

const { wordCount, readingTime } = defineProps<Props>();

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
  <NotificationMessage severity="info">
    <div class="flex flex-col">
      <span>Word count: {{ wordCount }}</span>
      <span
        >You need {{ readingTimeInMinutes }} minutes to read the article</span
      >
      <span>Time progress: {{ timeSpentPercentage?.toFixed(1) }}%</span>
      <span>Scroll progress: {{ scrollPercentage?.toFixed(1) }}%</span>
      <span>Reading stage: {{ totalProgress }}</span>
    </div>
  </NotificationMessage>
</template>
