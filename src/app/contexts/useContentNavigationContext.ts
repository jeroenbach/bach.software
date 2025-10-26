import type { Collections } from '@nuxt/content';
import { findPageChildren } from '@nuxt/content/utils';
import { createPageUrl, localesMap } from '~/locales.config';

/**
 * Gets the content from the pages folder and builds a navigation object.
 */
export async function useContentNavigationContext() {
  const { locale } = useI18n();
  const uniqueId = `navigation-${locale.value}`;

  return useAsyncData<NavigationItem[]>(
    uniqueId,
    async () => {
      const collection = `pages_${locale.value}` as Extract<keyof Collections, `pages_${string}`>;

      let pages = await queryCollectionNavigation(collection, ['contentId', 'url'])
        .orWhere(q => q.where('partial', 'IS NULL').where('partial', '=', false))
        .orWhere(q => q.where('draft', 'IS NULL').where('draft', '=', false));

      const structure = localesMap.get(locale.value);
      if (structure?.pagesPath && structure.pagesPath !== '/') {
        pages = findPageChildren(pages, structure?.pagesPath);
      }

      return pages.map(item => ({
        label: item.title ?? '',
        to: item.url as string ?? createPageUrl(locale.value, item.contentId as number, item.title, item.slug as string),
      }));
    },
    {
      default: undefined,
    },
  );
}
