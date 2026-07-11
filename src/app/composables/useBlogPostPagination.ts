import type { MaybeRefOrGetter } from 'vue';
import { computed, toValue } from 'vue';

export function useBlogPostPagination<T>(
  items: MaybeRefOrGetter<T[]>,
  page: MaybeRefOrGetter<number>,
  pageSize: MaybeRefOrGetter<number>,
) {
  const totalCount = computed(() => toValue(items).length);

  const paginatedItems = computed(() => {
    const size = toValue(pageSize);
    const start = (toValue(page) - 1) * size;
    return toValue(items).slice(start, start + size);
  });

  return {
    totalCount,
    paginatedItems,
  };
}
