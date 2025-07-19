<script setup lang="ts">
import { readMarkdown } from "~/utils/markdown";

interface Props {
  text?: string;
}

const { text = "" } = defineProps<Props>();
const markdownContent = computed(() => {
  return readMarkdown(text)?.bodyHtml;
});
</script>
<template>
  <div v-html="markdownContent" />
</template>
