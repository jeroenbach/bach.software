<script lang="ts" setup>
export interface Props {
  to?: string;
  text?: string;
  color?: "default" | "blue";
}
const { color = "default" } = defineProps<Props>();
</script>

<template>
  <NuxtLink
    v-if="to"
    :class="{
      'text-gray-800 dark:text-gray-300': color === 'default',
      'text-sky-600 hover:text-sky-800 dark:text-sky-500 dark:hover:text-sky-300':
        color === 'blue',
    }"
    :to="to"
  >
    <slot>
      {{ text }}
    </slot>
  </NuxtLink>
  <span v-else>
    <slot>
      {{ text }}
    </slot>
  </span>
</template>
