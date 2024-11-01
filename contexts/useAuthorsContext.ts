import type { Author } from "~/types/Author";

/**
 * Fetches author data based on the provided usernames.
 *
 * This hook uses a unique identifier to cache the data and avoid redundant fetches.
 * If no usernames are provided, it fetches all authors.
 *
 * @param {string[]} [userNames] - An optional array of usernames to filter the authors.
 * @returns {Promise<Author[]>} A promise that resolves to an array of authors.
 */
export const useAuthorsContext = async (userNames?: string[]) => {
  const uniqueId = `authorsContext-${userNames?.join("-")}`;

  return await useAsyncData(uniqueId, async () => {
    const query = queryContent<Author>("authors");

    if (userNames) {
      query.where({ userName: { $in: userNames } });
    }

    return await query.find();
  });
};
