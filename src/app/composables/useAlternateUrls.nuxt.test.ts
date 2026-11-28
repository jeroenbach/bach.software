import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mock = vi.hoisted(() => ({
  queryCollection: vi.fn(),
  useAsyncData: vi.fn(),
}));

mockNuxtImport('queryCollection', () => mock.queryCollection);
mockNuxtImport('useAsyncData', () => mock.useAsyncData);

type ContentItem = Record<string, unknown>;

function arrangeCollections(itemsByCollection: Record<string, ContentItem>) {
  mock.queryCollection.mockImplementation((collection: string) => {
    const query = {
      where: vi.fn(() => query),
      orWhere: vi.fn(() => query),
      select: vi.fn(() => query),
      first: vi.fn(async () => itemsByCollection[collection] ?? null),
    };
    return query;
  });
}

describe('useAlternateUrls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mock.useAsyncData.mockImplementation(async (_key: string, fetcher: () => Promise<unknown>) => {
      const data = await fetcher();
      return { data: ref(data) };
    });
  });

  it('should return a generated URL and slug per locale for a blog post', async () => {
    arrangeCollections({
      posts_en: { contentId: 1, title: 'My Post' },
      posts_nl: { contentId: 1, title: 'Mijn Post' },
      posts_de: { contentId: 1, title: 'Mein Post' },
    });

    const result = await useAlternateUrls('blogPost', 1);

    expect(result).toEqual([
      { hreflang: 'en', href: '/posts/1-my-post', slug: 'my-post' },
      { hreflang: 'nl', href: '/nl/posts/1-mijn-post', slug: 'mijn-post' },
      { hreflang: 'de', href: '/de/posts/1-mein-post', slug: 'mein-post' },
    ]);
  });

  it('should prefer the frontmatter slug over one derived from the title', async () => {
    arrangeCollections({
      posts_en: { contentId: 3, title: 'A Very Long Title That Would Make A Long URL', slug: 'short-slug' },
    });

    const result = await useAlternateUrls('blogPost', 3);

    expect(result).toEqual([
      { hreflang: 'en', href: '/posts/3-short-slug', slug: 'short-slug' },
    ]);
  });

  it('should query the pages collections for the page type', async () => {
    arrangeCollections({
      pages_en: { contentId: 5, title: 'About' },
      pages_nl: { contentId: 5, title: 'Over' },
    });

    const result = await useAlternateUrls('page', 5);

    expect(result).toEqual([
      { hreflang: 'en', href: '/content/5-about', slug: 'about' },
      { hreflang: 'nl', href: '/nl/content/5-over', slug: 'over' },
    ]);
    expect(mock.queryCollection).toHaveBeenCalledWith('pages_en');
    expect(mock.queryCollection).toHaveBeenCalledWith('pages_nl');
    expect(mock.queryCollection).toHaveBeenCalledWith('pages_de');
  });

  it('should use the frontmatter URL with the locale prefix and omit the slug', async () => {
    arrangeCollections({
      pages_en: { contentId: 10, title: 'Blog', url: '/posts' },
      pages_nl: { contentId: 10, title: 'Blog', url: '/posts' },
    });

    const result = await useAlternateUrls('page', 10);

    expect(result).toEqual([
      { hreflang: 'en', href: '/posts' },
      { hreflang: 'nl', href: '/nl/posts' },
    ]);
  });

  it('should skip locales where the content does not exist', async () => {
    arrangeCollections({
      posts_en: { contentId: 2, title: 'English Only' },
    });

    const result = await useAlternateUrls('blogPost', 2);

    expect(result).toEqual([
      { hreflang: 'en', href: '/posts/2-english-only', slug: 'english-only' },
    ]);
  });

  it('should return an empty array when the content exists in no locale', async () => {
    arrangeCollections({});

    const result = await useAlternateUrls('page', 999);

    expect(result).toEqual([]);
  });

  it('should cache per type and content id', async () => {
    arrangeCollections({});

    await useAlternateUrls('blogPost', 7);

    expect(mock.useAsyncData).toHaveBeenCalledWith(
      'alternateUrls-blogPost-7',
      expect.any(Function),
      expect.anything(),
    );
  });
});
