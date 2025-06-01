<script lang="ts" setup>
/**
 * The container / placeholder where alerts can teleport there messages
 */
</script>
<template>
  <div
    aria-live="assertive"
    class="pointer-events-none z-50 flex items-start p-6"
  >
    <div alert-bar="main" class="flex w-full flex-col items-end gap-5" />
  </div>
</template>
