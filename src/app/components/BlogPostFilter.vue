<script lang="ts" setup>
defineProps<{
  categories: { name: string; count: number }[]
  activeCategory?: string
  totalCount: number
}>()

const route = useRoute()
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <span class="mr-1 text-sm text-gray-500 dark:text-gray-400">{{ $t('blog.filter.label') }}</span>

    <NuxtLink :to="{ path: route.path }">
      <AppChip
        :class="!activeCategory
          ? 'bg-sky-600 font-medium text-white'
          : 'bg-linear-to-r from-gray-100 to-gray-50 font-medium hover:from-gray-200 hover:to-gray-100 dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600'"
      >
        {{ $t('blog.filter.all') }}
      </AppChip>
    </NuxtLink>

    <NuxtLink
      v-for="cat in categories"
      :key="cat.name"
      :to="{ path: route.path, query: { category: cat.name } }"
    >
      <AppChip
        :class="activeCategory === cat.name
          ? 'bg-sky-600 font-medium text-white'
          : 'bg-linear-to-r from-gray-100 to-gray-50 font-medium hover:from-gray-200 hover:to-gray-100 dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600'"
      >
        {{ cat.name }}
      </AppChip>
    </NuxtLink>

    <span class="ml-auto text-sm text-gray-400 dark:text-gray-500">
      {{ $t('blog.filter.count', { count: totalCount }) }}
    </span>
  </div>
</template>
