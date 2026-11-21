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
const {
  src,
  alt,
  width,
  height,
  sizes,
  class: className,
  loading,
} = defineProps<Props>();
</script>

<template>
  <NuxtImg
    :src="src"
    :alt="alt"
    :width="width"
    :height="height"
    :sizes="sizes"
    :class="className"
    :loading="loading"
  >
    <slot />
  </NuxtImg>
</template>
