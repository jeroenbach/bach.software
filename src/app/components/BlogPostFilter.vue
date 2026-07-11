<script lang="ts" setup>
import type { LocationQuery } from 'vue-router';

const { query = {} } = defineProps<{
  categories: { name: string, count: number }[]
  totalCount: number
  query?: LocationQuery
}>();

const activeCategory = computed(() => query.category as string | undefined);

function categoryQuery(category?: string): LocationQuery {
  // Keep unrelated query parameters, but reset paging when the filter changes
  const rest: LocationQuery = { ...query };
  delete rest.category;
  delete rest.page;
  return category ? { ...rest, category } : rest;
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <span class="mr-1 text-xs-em text-gray-500 dark:text-gray-400">{{ $t('blog.filter.label') }}</span>

    <ChipLink :to="{ query: categoryQuery() }" :chipColor="!activeCategory ? 'blue' : 'gray'">
      {{ $t('blog.filter.all') }}
    </ChipLink>

    <ChipLink
      v-for="cat in categories"
      :key="cat.name"
      :to="{ query: categoryQuery(cat.name) }"
      :chipColor="activeCategory === cat.name ? 'blue' : 'gray'"
    >
      {{ cat.name }}
    </ChipLink>

    <span class="ml-auto text-xs-em text-gray-500 dark:text-gray-400">
      {{ $t('blog.filter.count', { count: totalCount }) }}
    </span>
  </div>
</template>
