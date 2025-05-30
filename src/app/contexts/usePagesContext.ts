import type { Page } from "~/types/Page";

/**
 * Fetches a single page based on the provided slug.
 *
 * This hook uses a unique identifier to cache the data and avoid redundant fetches.
 * If no slug is provided, it returns null.
 *
 * @param {string} [slug] - An optional slug to filter the page.
 * @returns {Promise<Page | null>} A promise that resolves to a single page or null.
 */
export const usePagesContext = async (slug: string) => {
  const uniqueId = `pagesContext-${slug}`;

  return await useAsyncData(uniqueId, async () => {
    const query = queryContent<Page>("pages").where({
      _path: `/pages/${slug}`,
      _draft: { $ne: true },
    });

    return await query.findOne();
  });
};
