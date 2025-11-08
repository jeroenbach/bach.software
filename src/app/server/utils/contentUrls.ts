import type { Collections } from '@nuxt/content';
import type { ContentNavigationDictionary, ContentNavigationItemExtended } from '~/types/ContentNavigationItemExtended';
import type { MetadataType } from '~/types/MetadataType';
import { queryCollectionNavigation } from '@nuxt/content/server';
import { findPageChildren } from '@nuxt/content/utils';
import { createBlogPostUrl, createPageUrl, locales } from '~/locales.config';

export type ContentUrlMap = {
  [K in MetadataType]: ContentNavigationDictionary
};

export async function getContentUrlMap(event: any): Promise<ContentUrlMap> {
  let cachedUrlMap: ContentUrlMap | null = null;
  // Return cached version if available
  if (cachedUrlMap) {
    return cachedUrlMap;
  }

  const docs: ContentNavigationItemExtended[] = [];

  // Query all content for all locales
  for (const locale of locales) {
    // Pages
    const pagesCollection = `pages_${locale.code}` as Extract<keyof Collections, `pages_${string}`>;
    let pages = await queryCollectionNavigation(event, pagesCollection, ['contentId', 'url', 'dateModified'])
      .orWhere(q => q.where('partial', 'IS NULL').where('partial', '=', false))
      .orWhere(q => q.where('draft', 'IS NULL').where('draft', '=', false)) as ContentNavigationItemExtended[];

    if (locale?.pagesPath && locale.pagesPath !== '/') {
      pages = findPageChildren(pages, locale?.pagesPath);
    }

    pages.forEach((page) => {
      page.url ??= createPageUrl(locale.code, page.contentId as number, page.title, page.slug as string);
      page.locale = locale.code;
      page.type = 'page';
    });

    docs.push(...pages);

    // Posts
    const postsCollection = `posts_${locale.code}` as Extract<keyof Collections, `posts_${string}`>;
    let posts = await queryCollectionNavigation(event, postsCollection, ['contentId', 'dateModified'])
      .orWhere(q => q.where('draft', 'IS NULL').where('draft', '=', false)) as ContentNavigationItemExtended[];

    if (locale?.postsPath && locale.postsPath !== '/') {
      posts = findPageChildren(posts, locale?.postsPath);
    }

    posts.forEach((post) => {
      post.url = createBlogPostUrl(locale.code, post.contentId as number, post.title, post.slug as string);
      post.locale = locale.code;
      post.type = 'blogPost';
    });

    docs.push(...posts);
  }

  // Group by identifier (type_contentId)
  const urlMap: ContentUrlMap = {
    page: {},
    blogPost: {},
    blog: {},
  };

  for (const doc of docs) {
    const type = doc.type as keyof ContentUrlMap;
    if (!urlMap[type][doc.contentId]) {
      urlMap[type][doc.contentId] = {};
    }
    urlMap[type]![doc.contentId]![doc.locale] = doc;
  }

  // Cache the result
  cachedUrlMap = urlMap;

  return urlMap;
}
