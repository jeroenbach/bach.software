export function useBlogPostFilter(posts: Ref<BlogPostSummary[] | undefined>) {
  const route = useRoute();

  const activeCategory = computed(() => route.query.category as string | undefined);
  const currentPage = computed(() => Number(route.query.page) || 1);

  const categories = computed(() => {
    if (!posts.value)
      return [];
    const countMap = new Map<string, number>();
    for (const post of posts.value) {
      if (post.category) {
        countMap.set(post.category, (countMap.get(post.category) ?? 0) + 1);
      }
    }
    return Array.from(countMap.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  });

  const filteredPosts = computed(() => {
    if (!posts.value)
      return [];
    if (!activeCategory.value)
      return posts.value;
    return posts.value.filter(p => p.category === activeCategory.value);
  });

  const totalFilteredCount = computed(() => filteredPosts.value.length);

  const paginatedPosts = computed(() => {
    const start = (currentPage.value - 1) * BLOG_PAGE_SIZE;
    return filteredPosts.value.slice(start, start + BLOG_PAGE_SIZE);
  });

  return {
    activeCategory,
    currentPage,
    categories,
    totalFilteredCount,
    paginatedPosts,
  };
}
