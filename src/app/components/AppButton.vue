<script lang="ts" setup>
const emits = defineEmits<{
  (e: "click"): void;
}>();
</script>

<template>
  <button @click="emits('click')">
    <slot />
  </button>
</template>
