import type { ContentNavigationDictionary } from '~/types/ContentNavigationItemExtended';
import { SitemapStream, streamToPromise } from 'sitemap';
import { defaultLocale } from '~/locales.config';
import { getContentUrlMap } from '~/server/utils/contentUrls';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  const contentUrlMap = await getContentUrlMap(event);

  const sitemap = new SitemapStream({
    hostname: config.public.baseUrl,
    xmlns: {
      news: false,
      xhtml: true,
      image: false,
      video: false,
    },
  });

  addLinks(sitemap, contentUrlMap.page);
  addLinks(sitemap, contentUrlMap.blogPost);
  addLinks(sitemap, contentUrlMap.blog);

  sitemap.end();

  const xml = await streamToPromise(sitemap);

  // Set the correct content type header
  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8');

  return xml;
});

function addLinks(sitemap: SitemapStream, navDic: ContentNavigationDictionary) {
  for (const contentId of Object.keys(navDic)) {
    const localeVariants = navDic[Number(contentId)] ?? {};

    const defaultVariant = localeVariants[defaultLocale];
    if (!defaultVariant) {
      throw new Error(`Missing default locale variant for content ID ${contentId}`);
    }

    // Create hreflang links for all available locales
    const links = Object.entries(localeVariants).map(([locale, doc]) => ({
      lang: locale,
      url: doc.url as string,
    }));

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
}
