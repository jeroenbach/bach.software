import type { Collections } from '@nuxt/content';
import { createBlogPostUrl } from '~/locales.config';
import { toMap } from '~/utils/toMap';

/**
 * Fetches blog posts data based on the provided options.
 *
 * @template TSingle - Determines if a single post or multiple posts should be fetched.
 * @template TSummary - Determines if the full post or a summary of the post should be fetched.
 *
 * @param {object} [options] - Options for fetching blog posts.
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
export async function useBlogPostsContext<
  TSingle extends number | undefined = undefined,
  TSummary extends boolean | undefined = undefined,
>(options?: {
  id?: TSingle
  summary?: TSummary
}) {
  // Check whether we want the full or the summary object
  type TPost = undefined extends TSummary
    ? BlogPost
    : TSummary extends true
      ? BlogPostSummary
      : BlogPost;

  // Then check whether we want a single or multiple objects
  type TPostSingleOrMultiple = undefined extends TSingle ? TPost[] : TPost;

  const { id, summary } = options ?? {};
  const { locale } = useI18n();
  const uniqueId = `postsContext-${locale.value}-${id}-${summary}`;

  return await useAsyncData(
    uniqueId,
    async () => {
      const postsRaw = await queryBlogPosts(locale.value, id, summary).all();
      const authorUserNames = new Set(postsRaw.map(p => p.authorName));

      const authors = await queryAuthors(locale.value, Array.from(authorUserNames)).all();

      const authorsDictionary = toMap(authors, a => a.userName);

      const posts = postsRaw.map((p) => {
        const post = p as BlogPostSummary;
        post.author = authorsDictionary.get(post.authorName);
        post.url ??= createBlogPostUrl(locale.value, post.contentId, post.title, post.slug);
        return post;
      });

      return (id ? posts?.[0] : posts) as TPostSingleOrMultiple;
    },
    {
      default: () => undefined,
    },
  );
}

function queryBlogPosts(locale: string, id?: number, summary?: boolean) {
  const collection = `posts_${locale}` as Extract<keyof Collections, `posts_${string}`>;
  const query = whereNotDraft<typeof collection>(
    queryCollection(collection),
  );

  if (id) {
    query.where('contentId', '=', id);
  }

  if (summary === true) {
    query.select(
      'contentId',
      'title',
      'description',
      'datePublished',
      'dateModified',
      'imageUrl',
      'imageAlt',
      'authorName',
      'draft',
      'url',
      'slug',
      'imagePosition',
      'category',
      'keywords',
      'readingTime',
      'excerpt',
    );
  }

  query.order('datePublished', 'DESC');

  return query;
}
function queryAuthors(locale: string, userNames: string[]) {
  const collection = `authors_${locale}` as Extract<keyof Collections, `authors_${string}`>;
  return queryCollection(collection)
    .where('userName', 'IN', userNames);
}
