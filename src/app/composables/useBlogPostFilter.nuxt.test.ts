import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { describe, expect, it, vi } from 'vitest';

const mock = vi.hoisted(() => ({
  useRoute: vi.fn(),
}));

mockNuxtImport('useRoute', () => mock.useRoute);

function createPost(overrides: Partial<BlogPostSummary> = {}): BlogPostSummary {
  return {
    contentId: 1,
    title: 'Test post',
    path: '/posts/1-test',
    ...overrides,
  } as BlogPostSummary;
}

describe('useBlogPostFilter', () => {
  it('returns empty results when posts is undefined', () => {
    mock.useRoute.mockReturnValue({ query: {} });

    const { categories, totalFilteredCount, paginatedPosts } = useBlogPostFilter(ref(undefined));

    expect(categories.value).toEqual([]);
    expect(totalFilteredCount.value).toBe(0);
    expect(paginatedPosts.value).toEqual([]);
  });

  it('returns all posts unfiltered when no category is active', () => {
    mock.useRoute.mockReturnValue({ query: {} });
    const posts = ref([
      createPost({ contentId: 1, category: 'tech' }),
      createPost({ contentId: 2, category: 'life' }),
    ]);

    const { activeCategory, totalFilteredCount, paginatedPosts } = useBlogPostFilter(posts);

    expect(activeCategory.value).toBeUndefined();
    expect(totalFilteredCount.value).toBe(2);
    expect(paginatedPosts.value).toHaveLength(2);
  });

  it('filters posts by the active category from the route query', () => {
    mock.useRoute.mockReturnValue({ query: { category: 'tech' } });
    const posts = ref([
      createPost({ contentId: 1, category: 'tech' }),
      createPost({ contentId: 2, category: 'life' }),
      createPost({ contentId: 3, category: 'tech' }),
    ]);

    const { activeCategory, totalFilteredCount, paginatedPosts } = useBlogPostFilter(posts);

    expect(activeCategory.value).toBe('tech');
    expect(totalFilteredCount.value).toBe(2);
    expect(paginatedPosts.value.map(p => p.contentId)).toEqual([1, 3]);
  });

  it('builds a category facet sorted by count, then alphabetically', () => {
    mock.useRoute.mockReturnValue({ query: {} });
    const posts = ref([
      createPost({ contentId: 1, category: 'life' }),
      createPost({ contentId: 2, category: 'tech' }),
      createPost({ contentId: 3, category: 'tech' }),
      createPost({ contentId: 4 }), // no category, excluded from facet
    ]);

    const { categories } = useBlogPostFilter(posts);

    expect(categories.value).toEqual([
      { name: 'tech', count: 2 },
      { name: 'life', count: 1 },
    ]);
  });

  it('paginates the filtered results using BLOG_PAGE_SIZE and the page from the route query', () => {
    mock.useRoute.mockReturnValue({ query: { page: '2' } });
    const posts = ref(Array.from({ length: BLOG_PAGE_SIZE * 2 }, (_, i) => createPost({ contentId: i + 1 })));

    const { currentPage, paginatedPosts } = useBlogPostFilter(posts);

    expect(currentPage.value).toBe(2);
    expect(paginatedPosts.value).toHaveLength(BLOG_PAGE_SIZE);
    expect(paginatedPosts.value[0]?.contentId).toBe(BLOG_PAGE_SIZE + 1);
  });

  it('defaults to page 1 for an invalid page query', () => {
    mock.useRoute.mockReturnValue({ query: { page: 'not-a-number' } });

    const { currentPage } = useBlogPostFilter(ref([]));

    expect(currentPage.value).toBe(1);
  });
});
