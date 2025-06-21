<script setup lang="ts">
// Note: this file cannot contain any async code at the top level,
// the static site generation didn't work when refreshing a page.
import AppBackground, { type Props } from "~/components/AppBackground.vue";

const { background = "white" } = defineProps<Props>();
</script>
<template>
  <AppBackground :background="background" class="flex min-h-screen flex-col">
    <AppHeaderContext :border="background === 'gray'" />
    <main class="pt-6 text-base lg:pt-8 lg:text-lg">
      <slot />
    </main>
    <AppFooter />
  </AppBackground>
</template>
