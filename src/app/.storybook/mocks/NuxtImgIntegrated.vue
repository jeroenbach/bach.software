<script lang="ts" setup>
interface Props {
  src?: string
  alt?: string
  width?: number
  height?: number
  sizes?: string
  class?: string
  loading?: 'lazy' | 'eager'
}
const props = defineProps<Props>();
</script>

<template>
  <img v-bind="props" :src="`/_storybook/${props.src}`">
</template>
