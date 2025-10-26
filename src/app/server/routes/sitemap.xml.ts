import { findPageChildren } from '@nuxt/content/utils';
import { SitemapStream, streamToPromise } from 'sitemap';
import { createSlug } from '~/utils/url';
import { defaultLocale, locales } from '../../../../locales.config';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  // const pagesCollections = locales.map(locale => `pages_${locale.code}`);
  // const postsCollections = locales.map(locale => `posts_${locale.code}`);

  // const test = await queryCollection('pages_en').all();

  const test = await queryCollectionNavigation(event, 'pages_en');

  return test;
  // const localePrefix = (locale: string) => locale === defaultLocale ? '' : `/${locale}`;

  // const collection = `pages_${locale.value}` as Extract<keyof Collections, `pages_${string}`>;
  // const navigation = await queryCollectionNavigation(collection, ['url'])
  //   .orWhere(q => q.where('partial', 'IS NULL').where('partial', '=', false))
  //   .orWhere(q => q.where('draft', 'IS NULL').where('draft', '=', false));

  // // Fetch all documents for all locales
  // const docs = await serverQueryContent(event)
  //   .where({
  //     $and: [{ _partial: false }, { _dir: { $in: ['posts', 'pages'] } }],
  //   })
  //   .find();

  // const sitemap = new SitemapStream({
  //   hostname: appConfig.baseUrl,
  //   xmlns: {
  //     news: false,
  //     xhtml: true,
  //     image: false,
  //     video: false,
  //   },
  // });

  // // Group documents by their identifier (file name without locale)
  // // Structure: { 'posts/1': { en: {...}, fr: {...} }, 'pages/3.about': { en: {...}, fr: {...} } }
  // const docsByIdentifier = new Map<string, Record<string, any>>();

  // for (const doc of docs) {
  //   // Extract locale from path (e.g., /en/posts/1 -> en)
  //   const pathParts = doc._path.split('/').filter(Boolean);
  //   const locale = pathParts[0];

  //   // Create identifier without locale (e.g., posts/1)
  //   const identifier = pathParts.slice(1).join('/');

  //   if (!docsByIdentifier.has(identifier)) {
  //     docsByIdentifier.set(identifier, {});
  //   }
  //   docsByIdentifier.get(identifier)![locale] = doc;
  // }

  // // Add home page
  // const homeLinks = locales.map(locale => ({
  //   lang: locale.code,
  //   url: `${localePrefix(locale.code)}/`,
  // }));
  // sitemap.write({
  //   url: '/',
  //   changefreq: 'monthly',
  //   links: homeLinks,
  // });

  // // Add posts index page
  // const postsLinks = locales.map(locale => ({
  //   lang: locale.code,
  //   url: `${localePrefix(locale.code)}/posts`,
  // }));
  // sitemap.write({
  //   url: '/posts',
  //   changefreq: 'monthly',
  //   links: postsLinks,
  // });

  // // Add all documents with hreflang links
  // for (const [identifier, docsByLocale] of docsByIdentifier) {
  //   // Only process if we have content for default locale
  //   const defaultDoc = docsByLocale[defaultLocale];
  //   if (!defaultDoc)
  //     continue;

  //   // Determine the URL for each locale
  //   const urlsByLocale: Record<string, string> = {};

  //   for (const locale of locales) {
  //     const doc = docsByLocale[locale.code];
  //     if (!doc)
  //       continue;

  //     let url = doc._path.replace(`/${locale.code}`, localePrefix(locale.code));

  //     if (doc._dir === 'posts') {
  //       // Append slug for posts
  //       const slug = doc.slug ?? createSlug(doc.title);
  //       url = `${url}-${slug}`;
  //     }

  //     urlsByLocale[locale.code] = url;
  //   }

  //   // Create hreflang links for all available locales
  //   const links = Object.entries(urlsByLocale).map(([locale, url]) => ({
  //     lang: locale,
  //     url,
  //   }));

  //   // Add x-default pointing to default locale
  //   if (urlsByLocale[defaultLocale]) {
  //     links.push({
  //       lang: 'x-default',
  //       url: urlsByLocale[defaultLocale],
  //     });
  //   }

  //   // Write entry for each locale
  //   for (const [locale, url] of Object.entries(urlsByLocale)) {
  //     sitemap.write({
  //       url,
  //       changefreq: 'monthly',
  //       links,
  //     });
  //   }
  // }

  // sitemap.end();

  // return streamToPromise(sitemap);
});
