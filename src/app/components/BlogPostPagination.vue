<script lang="ts" setup>
const { page, pageSize, totalCount, activeCategory } = defineProps<{
  page: number
  pageSize: number
  totalCount: number
  activeCategory?: string
}>()

const route = useRoute()

const totalPages = computed(() => Math.ceil(totalCount / pageSize))

function pageQuery(pageNum: number) {
  const query: Record<string, string> = {}
  if (activeCategory) query.category = activeCategory
  if (pageNum > 1) query.page = String(pageNum)
  return { path: route.path, query }
}

const pagesToShow = computed<(number | '...')[]>(() => {
  const total = totalPages.value

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | '...')[] = [1]

  if (page > 3) pages.push('...')

  for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) {
    pages.push(i)
  }

  if (page < total - 2) pages.push('...')
  if (total > 1) pages.push(total)

  return pages
})

const btnBase = 'flex items-center justify-center rounded-lg text-sm transition-colors'
const btnPage = `${btnBase} h-9 w-9 border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-slate-700`
const btnNav = `${btnBase} h-9 px-3 border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-slate-700`
const btnDisabled = `${btnBase} h-9 px-3 border border-gray-100 text-gray-300 cursor-not-allowed dark:border-gray-800 dark:text-gray-600`
const btnActive = `${btnBase} h-9 w-9 bg-sky-600 font-semibold text-white shadow-sm`
</script>

<template>
  <nav
    v-if="totalPages > 1"
    class="mt-16 flex items-center justify-center gap-1"
    :aria-label="$t('blog.pagination.label')"
  >
    <NuxtLink v-if="page > 1" :to="pageQuery(page - 1)" :class="btnNav">
      {{ $t('blog.pagination.previous') }}
    </NuxtLink>
    <span v-else :class="btnDisabled" aria-disabled="true">
      {{ $t('blog.pagination.previous') }}
    </span>

    <template v-for="p in pagesToShow" :key="p">
      <span v-if="p === '...'" class="flex h-9 w-9 items-center justify-center text-sm text-gray-400 dark:text-gray-500">
        …
      </span>
      <span v-else-if="p === page" :class="btnActive" :aria-current="'page'">
        {{ p }}
      </span>
      <NuxtLink v-else :to="pageQuery(p as number)" :class="btnPage">
        {{ p }}
      </NuxtLink>
    </template>

    <NuxtLink v-if="page < totalPages" :to="pageQuery(page + 1)" :class="btnNav">
      {{ $t('blog.pagination.next') }}
    </NuxtLink>
    <span v-else :class="btnDisabled" aria-disabled="true">
      {{ $t('blog.pagination.next') }}
    </span>
  </nav>
</template>
