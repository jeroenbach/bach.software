import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { useBlogPostPagination } from './useBlogPostPagination';

describe('useBlogPostPagination', () => {
  it('returns the first page of items', () => {
    const items = ref([1, 2, 3, 4, 5]);

    const { totalCount, paginatedItems } = useBlogPostPagination(items, 1, 2);

    expect(totalCount.value).toBe(5);
    expect(paginatedItems.value).toEqual([1, 2]);
  });

  it('returns the requested page of items', () => {
    const items = ref([1, 2, 3, 4, 5]);

    const { paginatedItems } = useBlogPostPagination(items, 2, 2);

    expect(paginatedItems.value).toEqual([3, 4]);
  });

  it('returns a partial last page', () => {
    const items = ref([1, 2, 3, 4, 5]);

    const { paginatedItems } = useBlogPostPagination(items, 3, 2);

    expect(paginatedItems.value).toEqual([5]);
  });

  it('returns an empty page beyond the last page', () => {
    const items = ref([1, 2]);

    const { paginatedItems } = useBlogPostPagination(items, 3, 2);

    expect(paginatedItems.value).toEqual([]);
  });

  it('reacts to page changes', () => {
    const items = ref([1, 2, 3, 4]);
    const page = ref(1);

    const { paginatedItems } = useBlogPostPagination(items, page, 2);

    expect(paginatedItems.value).toEqual([1, 2]);

    page.value = 2;
    expect(paginatedItems.value).toEqual([3, 4]);
  });
});
