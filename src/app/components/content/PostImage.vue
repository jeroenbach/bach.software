<script lang="ts" setup>
const { src, alt, caption, cssClass } = defineProps<{
  src: string
  alt?: string
  caption?: string
  cssClass?: string
}>();
</script>

<template>
  <NuxtImg class="w-full bg-gray-100 dark:bg-gray-800" :class="cssClass" :src="`/${src}`" :alt="alt" />
  <figcaption v-if="caption">
    {{ caption }}
  </figcaption>
</template>
