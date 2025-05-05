<script setup lang="ts">
import type { NavigationItem } from "~/types/NavigationItem";

interface Props {
  background?: "white" | "gray";
  navigation?: NavigationItem[];
}
const { background = "white", navigation } = defineProps<Props>();
</script>
<template>
  <div
    class="flex min-h-screen flex-col text-gray-700 dark:text-gray-300"
    :class="{
      'bg-white dark:bg-slate-900': background === 'white',
      'bg-gray-50 dark:bg-gray-900': background === 'gray',
    }"
  >
    <AppHeader :navigation="navigation" :border="background === 'gray'" />
    <main class="pt-6 text-base lg:pt-8 lg:text-lg">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
