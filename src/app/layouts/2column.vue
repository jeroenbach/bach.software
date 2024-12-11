<script setup lang="ts">
import DefaultLayout from "./default.vue";
</script>
<template>
  <DefaultLayout>
    <div class="grid grow grid-cols-4 gap-4">
      <div class="col-span-3 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <slot name="default" />
      </div>
      <aside class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <slot name="side" />
      </aside>
    </div>
  </DefaultLayout>
</template>
