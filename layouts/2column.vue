<script setup lang="ts"></script>
<template>
  <div class="flex h-screen flex-col bg-white">
    <AppHeader />
    <div class="grid grow grid-cols-4 gap-4">
      <div class="col-span-3 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <main>
          <slot name="default" />
        </main>
      </div>
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <slot name="side" />
      </div>
    </div>
    <Footer />
  </div>
</template>
