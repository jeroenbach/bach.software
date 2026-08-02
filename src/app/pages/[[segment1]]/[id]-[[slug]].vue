<script lang="ts" setup>
import { pagesPaths, postsPaths } from '~/locales.config';

const { path, params } = useRoute();
const config = useRuntimeConfig();

const { segment1, id } = params as { segment1: string, id: string, slug: string };

const isPage = pagesPaths.has(`/${segment1}`);
const isPost = postsPaths.has(`/${segment1}`);

const pageType: MetadataType = isPost ? 'blogPost' : 'page';

const alternateUrls = await useAlternateUrls(pageType, Number(id));

const { data: page } = isPage ? await usePagesContext(Number(id)) : { data: undefined };
const { data: post } = isPost ? await useBlogPostsContext({ id: Number(id) }) : { data: undefined };
const { pageReads } = isPost ? await usePageReadsContext() : { pageReads: undefined };
const { likes, hasLiked, like } = isPost
  ? usePageLikesContext(() => ({
      author: post?.value?.authorName ?? '',
      category: post?.value?.category ?? '',
    }))
  : { likes: undefined, hasLiked: undefined, like: undefined };

if (!page?.value && !post?.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page Not Found' });
}

const configuredPath = computed(() => page?.value?.url || post?.value?.url || undefined);

if (configuredPath.value && path !== configuredPath.value) {
  navigateTo(configuredPath.value, { redirectCode: 301 });
}

useMetadata(pageType, (page?.value ?? post?.value)!, alternateUrls);

if (isPost && post?.value) {
  useReadProgressTracking(
    {
      wordCount: post.value.readingTime?.words ?? 0,
      readingTime: post.value.readingTime?.time ?? 0,
    },
    {
      author: post.value.authorName ?? '',
      category: post.value.category ?? '',
    },
  );
}

const tocLinks = computed(() => post?.value?.body?.toc?.links ?? []);
const { activeId } = useScrollspy(() => flattenTocLinkIds(tocLinks.value));
</script>

<template>
  <PageContent>
    <AppProse v-if="page && page.enableProse">
      <ContentRenderer :value="page" />
    </AppProse>
    <ContentRenderer v-else-if="page" :value="page" />
    <div v-else-if="post" class="xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,65ch)_minmax(0,1fr)]">
      <div class="min-w-0 xl:col-start-2">
        <BlogPost
          :post="post"
          :baseUrl="config.public.baseUrl"
          :pageReads="pageReads"
          :likes="likes"
          :hasLiked="hasLiked"
          @like="like?.()"
        >
          <template #tableOfContents>
            <TableOfContents
              v-if="tocLinks.length"
              :links="tocLinks"
              collapsible
              class="mt-6 xl:hidden"
            />
          </template>
        </BlogPost>
      </div>
      <aside v-if="tocLinks.length" class="hidden xl:block">
        <TableOfContents
          :links="tocLinks"
          :activeId="activeId"
          class="sticky top-24 ms-12 max-h-[calc(100vh-8rem)] overflow-y-auto pe-4"
        />
      </aside>
    </div>
  </PageContent>
</template>
