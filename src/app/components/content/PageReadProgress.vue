<script lang="ts" setup>
import { useReadProgressTracking } from "@/composables/useReadProgressTracking";
import NotificationMessage from "@/components/NotificationMessage.vue";

interface Props {
  wordCount?: number;
}

const { wordCount } = defineProps<Props>();

const { totalProgress, timeSpent, timeSpentPercentage, scrollPercentage } =
  useReadProgressTracking({ wordCount });
</script>

<template>
  <NotificationMessage severity="info">
    <div class="flex flex-col">
      <span>Word count: {{ wordCount }}</span>
      <span>Time: {{ timeSpentPercentage?.toFixed(1) }}%</span>
      <span>Scroll: {{ scrollPercentage?.toFixed(1) }}%</span>
      <span>Total: {{ totalProgress }}</span>
    </div>
  </NotificationMessage>
</template>
