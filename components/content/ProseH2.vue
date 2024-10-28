<script lang="ts" setup>
import { LinkIcon } from "@heroicons/vue/24/outline";
defineProps<{ id: string }>();
</script>

<template>
  <a :id="id" :href="`#${id}`" class="group no-underline">
    <LinkIcon
      class="absolute -ml-4 mt-3 size-3 opacity-0 transition-opacity duration-75 group-hover:opacity-100 md:-ml-6 md:mt-3 md:size-4"
    />
    <h2 ref="h2" class="group-hover:underline"><slot /></h2>
  </a>
</template>
