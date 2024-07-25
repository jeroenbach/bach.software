<script setup lang="ts"></script>
<template>
  <div class="flex h-screen flex-col bg-white">
    <AppHeader />
    <main class="grow">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <slot />
      </div>
    </main>
    <AppFooter />
  </div>
</template>
