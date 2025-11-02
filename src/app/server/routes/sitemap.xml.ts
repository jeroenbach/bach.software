import type { Collections, ContentNavigationItem } from '@nuxt/content';
import { queryCollectionNavigation } from '@nuxt/content/server';
import { findPageChildren } from '@nuxt/content/utils';
import { SitemapStream, streamToPromise } from 'sitemap';
import { createBlogPostUrl, createPageUrl, defaultLocale, locales } from '~/locales.config';

interface ContentNavigationItemExtended extends ContentNavigationItem {
  type: string
  contentId: number
  url: string
  locale: string
  dateModified: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  const docs: ContentNavigationItemExtended[] = [];
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
      // Ensure the page has a URL property
      page.url ??= createPageUrl(locale.code, page.contentId as number, page.title, page.slug as string);
      page.locale = locale.code;
      page.type = 'page';
    });

    docs.push(...pages);

    // Articles
    const postsCollection = `posts_${locale.code}` as Extract<keyof Collections, `posts_${string}`>;
    let articles = await queryCollectionNavigation(event, postsCollection, ['contentId', 'dateModified'])
      .orWhere(q => q.where('draft', 'IS NULL').where('draft', '=', false)) as ContentNavigationItemExtended[];

    if (locale?.postsPath && locale.postsPath !== '/') {
      articles = findPageChildren(articles, locale?.postsPath);
    }

    articles.forEach((post) => {
      // Ensure the post has a URL property
      post.url = createBlogPostUrl(locale.code, post.contentId as number, post.title, post.slug as string);
      post.locale = locale.code;
      post.type = 'article';
    });

    docs.push(...articles);
  }

  // Group documents by their identifier (type + contentId)
  const docsByIdentifier = new Map<string, Map<string, ContentNavigationItemExtended>>();

  for (const doc of docs) {
    const identifier = `${doc.type}_${doc.contentId}`;
    if (!docsByIdentifier.has(identifier)) {
      docsByIdentifier.set(identifier, new Map<string, ContentNavigationItemExtended>());
    }
    docsByIdentifier.get(identifier)!.set(doc.locale, doc);
  }

  const sitemap = new SitemapStream({
    hostname: config.public.baseUrl,
    xmlns: {
      news: false,
      xhtml: true,
      image: false,
      video: false,
    },
  });

  // Add all documents with hreflang links
  // eslint-disable-next-line ts/no-unused-vars
  for (const [_, localeVariants] of docsByIdentifier) {
    // Only process if we have content for default locale
    const defaultVariant = localeVariants.get(defaultLocale);
    if (!defaultVariant)
      continue;

    // Create hreflang links for all available locales
    const links = localeVariants.entries().map(([locale, doc]) => ({
      lang: locale,
      url: doc.url as string,
    })).toArray();

    // Add x-default pointing to default locale
    links.push({
      lang: 'x-default',
      url: defaultVariant.url,
    });

    // Write entry for each locale
    sitemap.write({
      url: defaultVariant.url,
      lastmod: defaultVariant.dateModified,
      changefreq: 'monthly',
      links,
    });
  }

  sitemap.end();

  return streamToPromise(sitemap);
});
