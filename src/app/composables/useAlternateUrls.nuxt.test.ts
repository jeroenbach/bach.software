import type { ContentUrlMap } from '~/server/utils/contentUrls';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mock = vi.hoisted(() => ({
  useRequestFetch: vi.fn(),
  useAsyncData: vi.fn(),
}));

mockNuxtImport('useRequestFetch', () => mock.useRequestFetch);
mockNuxtImport('useAsyncData', () => mock.useAsyncData);

describe('useAlternateUrls', () => {
  const mockUrlMap: ContentUrlMap = {
    page: {
      1: {
        en: { url: '/about', locale: 'en', contentId: 1, type: 'page', title: 'About', dateModified: '', path: '/about' },
        nl: { url: '/nl/over', locale: 'nl', contentId: 1, type: 'page', title: 'Over', dateModified: '', path: '/nl/over' },
        de: { url: '/de/uber', locale: 'de', contentId: 1, type: 'page', title: 'Über', dateModified: '', path: '/de/uber' },
      },
      2: {
        en: { url: '/portfolio', locale: 'en', contentId: 2, type: 'page', title: 'Portfolio', dateModified: '', path: '/portfolio' },
        fr: { url: '/fr/portfolio', locale: 'fr', contentId: 2, type: 'page', title: 'Portfolio', dateModified: '', path: '/fr/portfolio' },
      },
    },
    blogPost: {
      10: {
        en: { url: '/posts/10-my-post', locale: 'en', contentId: 10, type: 'blogPost', title: 'My Post', dateModified: '', path: '/posts/10-my-post' },
        nl: { url: '/nl/posts/10-mijn-post', locale: 'nl', contentId: 10, type: 'blogPost', title: 'Mijn Post', dateModified: '', path: '/nl/posts/10-mijn-post' },
      },
    },
    blog: {},
  };

  beforeEach(() => {
    mock.useRequestFetch.mockReset();
    mock.useAsyncData.mockReset();
  });

  it('should return alternate URLs for a page with multiple locales', async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockUrlMap);
    mock.useRequestFetch.mockReturnValue(mockFetch);
    mock.useAsyncData.mockImplementation(async (_key, fetcher) => {
      const data = await fetcher();
      return { data: ref(data) };
    });

    const result = await useAlternateUrls('page', 1);

    expect(result).toHaveLength(3);
    expect(result).toEqual([
      { href: '/about', hreflang: 'en' },
      { href: '/nl/over', hreflang: 'nl' },
      { href: '/de/uber', hreflang: 'de' },
    ]);
    expect(mockFetch).toHaveBeenCalledWith('/api/content-urls');
  });

  it('should return alternate URLs for a blogPost', async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockUrlMap);
    mock.useRequestFetch.mockReturnValue(mockFetch);
    mock.useAsyncData.mockImplementation(async (_key, fetcher) => {
      const data = await fetcher();
      return { data: ref(data) };
    });

    const result = await useAlternateUrls('blogPost', 10);

    expect(result).toHaveLength(2);
    expect(result).toEqual([
      { href: '/posts/10-my-post', hreflang: 'en' },
      { href: '/nl/posts/10-mijn-post', hreflang: 'nl' },
    ]);
  });

  it('should return alternate URLs for a page with two locales', async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockUrlMap);
    mock.useRequestFetch.mockReturnValue(mockFetch);
    mock.useAsyncData.mockImplementation(async (_key, fetcher) => {
      const data = await fetcher();
      return { data: ref(data) };
    });

    const result = await useAlternateUrls('page', 2);

    expect(result).toHaveLength(2);
    expect(result).toEqual([
      { href: '/portfolio', hreflang: 'en' },
      { href: '/fr/portfolio', hreflang: 'fr' },
    ]);
  });

  it('should return empty array when content ID does not exist', async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockUrlMap);
    mock.useRequestFetch.mockReturnValue(mockFetch);
    mock.useAsyncData.mockImplementation(async (_key, fetcher) => {
      const data = await fetcher();
      return { data: ref(data) };
    });

    const result = await useAlternateUrls('page', 999);

    expect(result).toEqual([]);
  });

  it('should return empty array when type does not exist in url map', async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockUrlMap);
    mock.useRequestFetch.mockReturnValue(mockFetch);
    mock.useAsyncData.mockImplementation(async (_key, fetcher) => {
      const data = await fetcher();
      return { data: ref(data) };
    });

    const result = await useAlternateUrls('blog', 1);

    expect(result).toEqual([]);
  });

  it('should return empty array when url map is undefined', async () => {
    const mockFetch = vi.fn().mockResolvedValue(undefined);
    mock.useRequestFetch.mockReturnValue(mockFetch);
    mock.useAsyncData.mockImplementation(async (_key, fetcher) => {
      const data = await fetcher();
      return { data: ref(data) };
    });

    const result = await useAlternateUrls('page', 1);

    expect(result).toEqual([]);
  });

  it('should return empty array when url map value is null', async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockUrlMap);
    mock.useRequestFetch.mockReturnValue(mockFetch);
    mock.useAsyncData.mockImplementation(async () => {
      return { data: ref(null) };
    });

    const result = await useAlternateUrls('page', 1);

    expect(result).toEqual([]);
  });

  it('should use useAsyncData with correct cache key', async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockUrlMap);
    mock.useRequestFetch.mockReturnValue(mockFetch);
    mock.useAsyncData.mockImplementation(async (_key, fetcher) => {
      const data = await fetcher();
      return { data: ref(data) };
    });

    await useAlternateUrls('page', 1);

    expect(mock.useAsyncData).toHaveBeenCalledWith(
      'content-urls',
      expect.any(Function),
    );
  });

  it('should correctly map url and locale to href and hreflang', async () => {
    const customUrlMap: ContentUrlMap = {
      page: {
        5: {
          es: { url: '/es/pagina', locale: 'es', contentId: 5, type: 'page', title: 'Página', dateModified: '', path: '/es/pagina' },
        },
      },
      blogPost: {},
      blog: {},
    };

    const mockFetch = vi.fn().mockResolvedValue(customUrlMap);
    mock.useRequestFetch.mockReturnValue(mockFetch);
    mock.useAsyncData.mockImplementation(async (_key, fetcher) => {
      const data = await fetcher();
      return { data: ref(data) };
    });

    const result = await useAlternateUrls('page', 5);

    expect(result).toEqual([
      { href: '/es/pagina', hreflang: 'es' },
    ]);
  });
});
