import type { BlogPostSummary } from '~/types/BlogPostSummary';
import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { useBlogPostCategoryFilter } from './useBlogPostCategoryFilter';

function createPost(overrides: Partial<BlogPostSummary> = {}): BlogPostSummary {
  return {
    contentId: 1,
    title: 'Test post',
    path: '/posts/1-test',
    ...overrides,
  } as BlogPostSummary;
}

describe('useBlogPostCategoryFilter', () => {
  it('returns empty results when posts is undefined', () => {
    const { categories, filteredPosts } = useBlogPostCategoryFilter(ref(undefined), undefined);

    expect(categories.value).toEqual([]);
    expect(filteredPosts.value).toEqual([]);
  });

  it('returns all posts unfiltered when no category is active', () => {
    const posts = ref([
      createPost({ contentId: 1, category: 'tech' }),
      createPost({ contentId: 2, category: 'life' }),
    ]);

    const { filteredPosts } = useBlogPostCategoryFilter(posts, undefined);

    expect(filteredPosts.value).toHaveLength(2);
  });

  it('filters posts by the given category', () => {
    const posts = ref([
      createPost({ contentId: 1, category: 'tech' }),
      createPost({ contentId: 2, category: 'life' }),
      createPost({ contentId: 3, category: 'tech' }),
    ]);

    const { filteredPosts } = useBlogPostCategoryFilter(posts, 'tech');

    expect(filteredPosts.value.map(p => p.contentId)).toEqual([1, 3]);
  });

  it('reacts to category changes', () => {
    const posts = ref([
      createPost({ contentId: 1, category: 'tech' }),
      createPost({ contentId: 2, category: 'life' }),
    ]);
    const category = ref<string | undefined>('tech');

    const { filteredPosts } = useBlogPostCategoryFilter(posts, category);

    expect(filteredPosts.value.map(p => p.contentId)).toEqual([1]);

    category.value = 'life';
    expect(filteredPosts.value.map(p => p.contentId)).toEqual([2]);
  });

  it('builds a category facet sorted by count, then alphabetically', () => {
    const posts = ref([
      createPost({ contentId: 1, category: 'life' }),
      createPost({ contentId: 2, category: 'tech' }),
      createPost({ contentId: 3, category: 'tech' }),
      createPost({ contentId: 4 }), // no category, excluded from facet
    ]);

    const { categories } = useBlogPostCategoryFilter(posts, undefined);

    expect(categories.value).toEqual([
      { name: 'tech', count: 2 },
      { name: 'life', count: 1 },
    ]);
  });
});
