import type { Collections } from '@nuxt/content';
import { createPageUrl, defaultLocale } from '~/locales.config';

/**
 * Fetches a single page based on the provided slug. The composable is language aware.
 *
 * This hook uses a unique identifier to cache the data and avoid redundant fetches.
 * If no slug is provided, it returns null.
 *
 * @param {number} id - The ID of the page to fetch.
 * @returns {Promise<PagesCollectionItem | undefined>} A promise that resolves to a single page or null.
 */
export async function usePagesContext<TPage extends Page>(id: number) {
  const { locale } = useI18n();
  const uniqueId = `pagesContext-${locale.value}-${id}`;

  return await useAsyncData(
    uniqueId,
    async () => {
      if (isNullOrUndefinedOrEmpty(id)) {
        return undefined;
      }

      let result = await queryPage<TPage>(locale.value, id);

      if (!result && locale.value !== defaultLocale) {
        // optional fallback to default locale
        result = await queryPage<TPage>(defaultLocale, id);
      }

      return result ?? undefined;
    },
    {
      default: () => undefined,
      transform: (data) => {
        if (!data)
          return undefined;

        // Ensure the page has a URL property
        data.url ??= createPageUrl(locale.value, data.contentId, data.title, data.slug);
        return data;
      },
    },
  );
}

async function queryPage<TPage extends Page>(locale: string, contentId: number) {
  const collection = `pages_${locale}` as Extract<keyof Collections, `pages_${string}`>;
  return await whereNotDraft<typeof collection>(
    queryCollection(collection).where('contentId', '=', contentId) as ReturnType<typeof queryCollection<typeof collection>>,
  ).first() as TPage | null;
}
