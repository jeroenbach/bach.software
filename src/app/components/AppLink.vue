<script lang="ts" setup>
export interface Props {
  to?: string;
  text?: string;
  color?: "gray" | "blue" | undefined;
}

const { color = undefined, to = undefined, text = "" } = defineProps<Props>();
</script>

<template>
  <NuxtLinkLocale
    v-if="to"
    :to="to"
    :class="{
      'bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent hover:from-gray-900 hover:to-gray-800 dark:from-gray-300 dark:to-gray-200 dark:hover:from-gray-400 dark:hover:to-gray-300':
        color === 'gray',
      'bg-gradient-to-r from-sky-600 to-sky-500 bg-clip-text text-transparent hover:from-sky-700 hover:to-sky-600 dark:from-sky-400 dark:to-sky-300 dark:hover:from-sky-500 dark:hover:to-sky-400':
        color === 'blue',
    }"
  >
    <slot>
      {{ text }}
    </slot>
  </NuxtLinkLocale>
  <span v-else>
    <slot>
      {{ text }}
    </slot>
  </span>
</template>
