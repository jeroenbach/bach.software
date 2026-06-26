<script lang="ts" setup>
import type { MetadataType } from '~/types/MetadataType';
import { postsPaths } from '~/locales.config';

const { path, params } = useRoute();
const { pathSegments } = params as { pathSegments: string[] };

const isRoot = path === '/';
const isBlogRoot = postsPaths.has(`/${pathSegments?.[0]}`) || isRoot; // temporary show the blog root on root path

const pageId = isBlogRoot
  ? 10 // id 10 is the blog root page
  : isRoot
    ? 1 // id 1 is the root page
    : -1; // invalid page

const alternateUrls = await useAlternateUrls('page', pageId);
const { data: page } = await usePagesContext(pageId);
const { data: allPosts } = isBlogRoot ? await useBlogPostsContext({ summary: true }) : { data: undefined };

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page Not Found' });
}

if (page.value.url && page.value.url !== path && path !== '/') { // temporary show the same on the home page as the blog page
  navigateTo(page.value.url, { redirectCode: 301 });
}

const metadataType: MetadataType = isBlogRoot ? 'blog' : 'page';
useMetadata(metadataType, page.value, alternateUrls, allPosts?.value);

// Filtering & pagination (reactive to route query changes)
const route = useRoute();

const activeCategory = computed(() => route.query.category as string | undefined);
const currentPage = computed(() => Number(route.query.page) || 1);

const categories = computed(() => {
  if (!allPosts?.value) return [];
  const countMap = new Map<string, number>();
  for (const post of allPosts.value) {
    if (post.category) {
      countMap.set(post.category, (countMap.get(post.category) ?? 0) + 1);
    }
  }
  return Array.from(countMap.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => ({ name, count }));
});

const filteredPosts = computed(() => {
  if (!allPosts?.value) return [];
  if (!activeCategory.value) return allPosts.value;
  return allPosts.value.filter(p => p.category === activeCategory.value);
});

const totalFilteredCount = computed(() => filteredPosts.value.length);

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * BLOG_PAGE_SIZE;
  return filteredPosts.value.slice(start, start + BLOG_PAGE_SIZE);
});
</script>

<template>
  <PageContent>
    <AppProse v-if="page && page.enableProse">
      <ContentRenderer :value="page" />
    </AppProse>
    <ContentRenderer v-else-if="page" :value="page" />

    <template v-if="isBlogRoot">
      <BlogPostFilter
        v-if="categories.length > 0"
        :categories="categories"
        :activeCategory="activeCategory"
        :totalCount="totalFilteredCount"
        class="mt-10 sm:mt-16"
        :class="{ 'mx-auto max-w-prose': page?.enableProse }"
      />
      <BlogPosts :class="{ 'mx-auto max-w-prose': page?.enableProse }">
        <BlogPostSummary
          v-for="post in paginatedPosts"
          :key="post.path"
          :post="post"
        />
        <p
          v-if="paginatedPosts.length === 0"
          class="text-sm text-gray-500 dark:text-gray-400"
        >
          {{ $t('blog.filter.noResults') }}
        </p>
      </BlogPosts>
      <BlogPostPagination
        :page="currentPage"
        :pageSize="BLOG_PAGE_SIZE"
        :totalCount="totalFilteredCount"
        :activeCategory="activeCategory"
        :class="{ 'mx-auto max-w-prose': page?.enableProse }"
      />
    </template>
  </PageContent>
</template>
