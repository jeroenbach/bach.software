import { serverQueryContent } from "#content/server";
import { SitemapStream, streamToPromise } from "sitemap";
import appConfig from "~/appConfig.json";

export default defineEventHandler(async (event) => {
  // Fetch all documents
  const docs = await serverQueryContent(event)
    .where({ _partial: false })
    .find();
  const sitemap = new SitemapStream({
    hostname: appConfig.baseUrl,
  });

  for (const doc of docs) {
    // Append any slugs if available
    const url = doc.slug ? `${doc._path}-${doc.slug}` : doc._path;
    sitemap.write({
      url,
      changefreq: "monthly",
    });
  }
  sitemap.end();

  return streamToPromise(sitemap);
});
