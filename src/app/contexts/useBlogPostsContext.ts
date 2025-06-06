import type { BlogPost, BlogPostSummary } from "~/types/BlogPost";
import { toDictionary } from "~/utils/collections";

/**
 * Fetches blog posts data based on the provided options.
 *
 * @template TSingle - Determines if a single post or multiple posts should be fetched.
 * @template TSummary - Determines if the full post or a summary of the post should be fetched.
 *
 * @param {Object} [options] - Options for fetching blog posts.
 * @param {TSingle} [options.id] - The ID of a single post to fetch.
 * @param {TSummary} [options.summary] - Whether to fetch a summary of the post(s).
 *
 * @returns {Promise<TPostSingleOrMultiple>} - A promise that resolves to the fetched blog post(s).
 *
 * @description
 * This function fetches blog posts data based on the provided options. It supports fetching either a single post or multiple posts,
 * and either the full post data or a summary of the post data. The function uses caching to avoid redundant data fetching.
 *
 * @example
 * // Fetch a summary of all blog posts
 * const postsSummary = await useBlogPostsContext({ summary: true });
 *
 * @example
 * // Fetch the full data of a single blog post by ID
 * const singlePost = await useBlogPostsContext({ id: 'post-id' });
 */
export const useBlogPostsContext = async <
  TSingle extends string | undefined = undefined,
  TSummary extends boolean | undefined = undefined,
>(options?: {
  id?: TSingle;
  summary?: TSummary;
}) => {
  // Check whether we want the full or the summary object
  type TPost = undefined extends TSummary
    ? BlogPost
    : TSummary extends true
      ? BlogPostSummary
      : BlogPost;

  // Then check whether we want a single or multiple object
  type TPostSingleOrMultiple = undefined extends TSingle ? TPost[] : TPost;

  const { id, summary } = options ?? {};
  const uniqueId = `postsContext-${id}-${summary}`;

  return await useAsyncData(
    uniqueId,
    async () => {
      const query = isFalseOrUndefined(summary)
        ? queryContent<BlogPost>("posts")
        : queryContent<BlogPostSummary>("posts").only([
            "slug",
            "title",
            "description",
            "category",
            "authorName",
            "datePublished",
            "dateModified",
            "imgCoverUrl",
            "imgCoverPosition",
            "readingTime",
            "_path",
            "excerpt",
            "draft",
          ]);

      if (id) {
        query.where({ _path: { $eq: `/posts/${id}` } });
      }

      query.where({ draft: { $ne: true } });

      query.sort({ datePublished: -1 });

      const postsRaw = await query.find();
      const authorUserNames = new Set(postsRaw.map((p) => p.authorName));
      const { data: authors } = await useAuthorsContext(
        Array.from(authorUserNames),
      );

      const authorsDictionary = toDictionary(
        authors.value ?? [],
        (a) => a.userName,
      );

      const posts = postsRaw.map((p) => {
        const post = p as BlogPostSummary;
        post.author = authorsDictionary[post.authorName];
        post.url = `${post._path}-${post.slug ?? createSlug(post.title)}`;
        return post;
      });

      return (id ? posts?.[0] : posts) as TPostSingleOrMultiple;
    },
    {
      default: () => undefined,
    },
  );
};
