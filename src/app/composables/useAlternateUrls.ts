import type { ContentUrlMap } from '~/server/utils/contentUrls';

export async function useAlternateUrls(type: MetadataType, contentId: number): Promise<AlternateUrl[]> {
  const requestFetch = useRequestFetch();
  const { data: urlMap } = await useAsyncData<ContentUrlMap>('content-urls', () => {
    return requestFetch('/api/content-urls');
  });

  const alternateUrls: AlternateUrl[] = Object.values(urlMap.value?.[type]?.[contentId] ?? {}).map(item => ({
    href: item.url,
    hreflang: item.locale,
  } as AlternateUrl));

  return alternateUrls;
}
