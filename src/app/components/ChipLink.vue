<script lang="ts" setup>
import type { Props } from "@/components/AppLink.vue";

defineProps<Props>();
</script>

<template>
  <AppLink v-bind="$props">
    <AppChip
      class="bg-gradient-to-r from-gray-100 to-gray-50 font-medium hover:from-gray-200 hover:to-gray-100 dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600"
    >
      <slot>
        {{ text }}
      </slot>
    </AppChip>
  </AppLink>
</template>
