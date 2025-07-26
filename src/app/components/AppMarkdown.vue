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
  <div class="show-list-bullets" v-html="markdownContent" />
</template>
<style>
.show-list-bullets ul {
  list-style: disc;
  padding-left: 1rem;
}
</style>
