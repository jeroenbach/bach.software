<script lang="ts" setup>
withDefaults(defineProps<{
  color?: 'gray' | 'blue'
}>(), {
  color: 'gray',
});
</script>

<template>
  <span
    class="block rounded-full px-3 py-0.5 text-sm/7  font-medium"
    :class="{
      ' bg-linear-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600':
        color === 'gray',
      'text-white bg-linear-to-r from-sky-600 to-sky-500  hover:from-sky-700 hover:to-sky-600 dark:from-sky-400 dark:to-sky-300 dark:hover:from-sky-500 dark:hover:to-sky-400':
        color === 'blue',
    }"
  >
    <slot />
  </span>
</template>
