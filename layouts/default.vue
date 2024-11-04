<script setup lang="ts"></script>
<template>
  <div
    class="min-h-screen bg-white px-4 text-gray-700 dark:bg-slate-900 dark:text-gray-300 lg:px-6"
  >
    <div class="mx-auto flex max-w-7xl flex-col">
      <AppHeader />
      <slot />
      <AppFooter />
    </div>
  </div>
</template>
<style lang="scss" global>
.dark {
  color-scheme: dark;
}
</style>
