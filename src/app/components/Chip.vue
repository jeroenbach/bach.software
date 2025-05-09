<script lang="ts" setup>
interface Props {}

const {} = defineProps<Props>();
</script>

<template>
  <span class="block rounded-full px-3 py-0.5 text-sm/7">
    <slot />
  </span>
</template>
