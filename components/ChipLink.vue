<script lang="ts" setup>
import type { Props } from "@/components/AppLink.vue";

defineProps<Props>();
</script>

<template>
  <AppLink
    v-bind="$props"
    class="relative rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
  >
    <slot>
      {{ text }}
    </slot>
  </AppLink>
</template>
