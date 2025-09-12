<script lang="ts" setup>
interface Props {
  src?: string
  alt?: string
  sizes?: string
  class?: string
  imgAttrs?: Record<string, unknown>
}
const props = defineProps<Props>();
</script>

<template>
  <img v-bind="{ ...props, ...imgAttrs }">
</template>
