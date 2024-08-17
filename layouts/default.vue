<script setup lang="ts">
import AppHeader from "~/components/AppHeader.vue";
import AppFooter from "~/components/AppFooter.vue";
</script>
<template>
  <div class="flex min-h-screen flex-col bg-white dark:bg-slate-900">
    <AppHeader />
    <main class="grow">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <slot />
      </div>
    </main>
    <AppFooter />
  </div>
</template>
<style lang="scss" global>
.dark {
  color-scheme: dark;
}
</style>
