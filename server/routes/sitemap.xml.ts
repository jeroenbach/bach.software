import { serverQueryContent } from "#content/server";
import { SitemapStream, streamToPromise } from "sitemap";
import appConfig from "~/appConfig.json";

export default defineEventHandler(async (event) => {
  // Fetch all documents
  const docs = await serverQueryContent(event).find();
  const sitemap = new SitemapStream({
    hostname: appConfig.baseUrl,
  });

  for (const doc of docs) {
    sitemap.write({
      url: doc._path,
      changefreq: "monthly",
    });
  }
  sitemap.end();

  return streamToPromise(sitemap);
});
