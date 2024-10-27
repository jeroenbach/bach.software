<script lang="ts" setup>
defineProps<{
  src: string;
  alt?: string;
}>();
</script>
<template>
  <NuxtImg class="w-full" :src="`/${src}`" :alt="alt" />
</template>
