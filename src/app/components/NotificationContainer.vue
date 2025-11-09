<script lang="ts" setup>
/**
 * The container / placeholder where Notifications can teleport there messages
 */
</script>

<template>
  <div
    aria-live="assertive"
    class="pointer-events-none fixed inset-0 z-50 flex items-start p-6"
  >
    <div notification="main" class="flex w-full flex-col items-end gap-3" />
  </div>
</template>
