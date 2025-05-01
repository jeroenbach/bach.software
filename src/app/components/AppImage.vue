<script lang="ts" setup>
interface Props {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  sizes?: string;
  class?: string;
  loading?: "lazy" | "eager";
}
const props = defineProps<Props>();
</script>

<template>
  <NuxtImg v-bind="props">
    <slot />
  </NuxtImg>
</template>
