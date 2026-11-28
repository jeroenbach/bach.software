import type { Collections } from '@nuxt/content';
import type { LocaleStructure } from '~/locales.config';
import { createBlogPostUrl, createPageUrl, createUrl, locales } from '~/locales.config';
import { createSlug } from '~/utils/urlUtil';

/**
 * Resolves the URL of a content item in every locale it exists in, for
 * hreflang links and the language switcher. Content is duplicated per locale
 * under the same contentId, so each locale needs just one lookup in its own
 * collection.
 */
export async function useAlternateUrls(type: MetadataType, contentId: number): Promise<AlternateUrl[]> {
  const { data } = await useAsyncData(
    `alternateUrls-${type}-${contentId}`,
    async () => {
      const urls = await Promise.all(locales.map(locale => queryAlternateUrl(type, locale, contentId)));
      return urls.filter(url => url !== undefined);
    },
    { default: () => [] as AlternateUrl[] },
  );

  return data.value;
}

async function queryAlternateUrl(type: MetadataType, locale: LocaleStructure, contentId: number): Promise<AlternateUrl | undefined> {
  const isPost = type === 'blogPost';
  const collection = `${isPost ? 'posts' : 'pages'}_${locale.code}` as Extract<keyof Collections, `posts_${string}` | `pages_${string}`>;

  const item = await whereNotDraft<typeof collection>(
    queryCollection(collection).where('contentId', '=', contentId) as ReturnType<typeof queryCollection<typeof collection>>,
  ).select('contentId', 'title', 'url', 'slug').first();

  if (!item) {
    return undefined;
  }

  if (item.url) {
    return { hreflang: locale.code, href: createUrl(locale.code, item.url) };
  }

  const createItemUrl = isPost ? createBlogPostUrl : createPageUrl;
  return {
    hreflang: locale.code,
    href: createItemUrl(locale.code, contentId, item.title, item.slug),
    slug: item.slug ?? createSlug(item.title),
  };
}
