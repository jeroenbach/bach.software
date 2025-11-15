<script lang="ts" setup>
const emits = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>();
</script>

<template>
  <button class="cursor-pointer" @click="emits('click', $event)">
    <slot />
  </button>
</template>
