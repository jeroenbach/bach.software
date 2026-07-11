import type { MaybeRefOrGetter } from 'vue';
import type { BlogPostSummary } from '~/types/BlogPostSummary';
import { computed, toValue } from 'vue';

export function useBlogPostCategoryFilter(
  posts: MaybeRefOrGetter<BlogPostSummary[] | undefined>,
  category: MaybeRefOrGetter<string | undefined>,
) {
  const categories = computed(() => {
    const allPosts = toValue(posts);
    if (!allPosts)
      return [];
    const countMap = new Map<string, number>();
    for (const post of allPosts) {
      if (post.category) {
        countMap.set(post.category, (countMap.get(post.category) ?? 0) + 1);
      }
    }
    return Array.from(countMap.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  });

  const filteredPosts = computed(() => {
    const allPosts = toValue(posts);
    if (!allPosts)
      return [];
    const activeCategory = toValue(category);
    if (!activeCategory)
      return allPosts;
    return allPosts.filter(p => p.category === activeCategory);
  });

  return {
    categories,
    filteredPosts,
  };
}
