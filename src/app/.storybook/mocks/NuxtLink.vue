<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router';
import { computed } from 'vue';

const { to = undefined } = defineProps<{ to?: RouteLocationRaw }>();

const href = computed(() => {
  if (typeof to === 'string')
    return to;
  if (!to)
    return '#';

  const { path = '', query } = to as { path?: string, query?: Record<string, string> };
  const search = new URLSearchParams(query).toString();
  return search ? `${path}?${search}` : path || '#';
});
</script>

<template>
  <a :href="href"><slot /></a>
</template>
