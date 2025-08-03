<script lang="ts" setup>
defineProps<{
  src: string;
  alt?: string;
  caption?: string;
}>();
</script>
<template>
  <NuxtImg class="w-full" :src="`/${src}`" :alt="alt" />
  <figcaption v-if="caption">{{ caption }}</figcaption>
</template>
