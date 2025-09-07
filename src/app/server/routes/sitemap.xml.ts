import { serverQueryContent } from '#content/server';

import { SitemapStream, streamToPromise } from 'sitemap';
import appConfig from '~/appConfig.json';
import { createSlug } from '~/utils/url';

export default defineEventHandler(async (event) => {
  // Fetch all documents
  const docs = await serverQueryContent(event)
    .where({
      $and: [{ _partial: false }, { _dir: { $in: ['posts', 'pages'] } }],
    })
    .find();
  const sitemap = new SitemapStream({
    hostname: appConfig.baseUrl,
  });

  // Some hard coded urls
  sitemap.write({
    url: '/',
    changefreq: 'monthly',
  });
  sitemap.write({
    url: '/posts',
    changefreq: 'monthly',
  });

  for (const doc of docs) {
    let url = doc._path;
    if (doc._dir === 'posts') {
      // Append any slugs if available or create one
      url = `${url}-${doc.slug ?? createSlug(doc.title)}`;
    }
    sitemap.write({
      url,
      changefreq: 'monthly',
    });
  }
  sitemap.end();

  return streamToPromise(sitemap);
});
