<script setup lang="ts">
// Note: this file cannot contain any async code at the top level,
// the static site generation didn't work when refreshing a page.
export interface Props {
  background?: "white" | "gray";
}
const { background = "white" } = defineProps<Props>();
</script>
<template>
  <div
    class="flex min-h-screen flex-col text-gray-700 dark:text-gray-300"
    :class="{
      'bg-white dark:bg-slate-900': background === 'white',
      'bg-gray-50 dark:bg-gray-800': background === 'gray',
    }"
  >
    <AppHeaderContext :border="background === 'gray'" />
    <main class="pt-6 text-base lg:pt-8 lg:text-lg">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
