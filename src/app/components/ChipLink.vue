<script lang="ts" setup>
import type { Props } from "@/components/AppLink.vue";

defineProps<Props>();
</script>

<template>
  <AppLink
    v-bind="$props"
    class="block rounded-full bg-gradient-to-r from-gray-100 to-gray-50 px-3 py-0.5 text-sm/7 font-medium hover:from-gray-200 hover:to-gray-100 dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-900 dark:hover:to-gray-800"
  >
    <slot>
      {{ text }}
    </slot>
  </AppLink>
</template>
