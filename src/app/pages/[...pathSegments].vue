<script lang="ts" setup>
import type { MetadataType } from '~/types/MetadataType';
import { postsPaths } from '~/locales.config';

const route = useRoute();
const { path } = route;
const { pathSegments } = route.params as { pathSegments: string[] };

const isRoot = !pathSegments?.length;
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

const { blogPageSize } = useAppConfig();
const activeCategory = computed(() => route.query.category as string | undefined);
const currentPage = computed(() => Number(route.query.page) || 1);

const { categories, filteredPosts } = useBlogPostCategoryFilter(allPosts ?? ref(undefined), activeCategory);
const { totalCount, paginatedItems: paginatedPosts } = useBlogPostPagination(filteredPosts, currentPage, blogPageSize);
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
        :query="route.query"
        :totalCount="totalCount"
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
        :pageSize="blogPageSize"
        :totalCount="totalCount"
        :query="route.query"
        :class="{ 'mx-auto max-w-prose': page?.enableProse }"
      />
    </template>
  </PageContent>
</template>
