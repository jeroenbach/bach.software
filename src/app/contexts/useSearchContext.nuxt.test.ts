import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';
import { useSearchContext } from './useSearchContext';

const locale = ref('en');
mockNuxtImport('useI18n', () => () => ({ locale }));

// Backs the pagefind mock module that vitest.config.ts aliases to /pagefind/pagefind.js
const pagefind = {
  options: vi.fn(),
  search: vi.fn(),
};

describe('useSearchContext', () => {
  beforeEach(() => {
    (globalThis as Record<string, any>).__pagefindMock = pagefind;
    pagefind.options.mockReset().mockResolvedValue(undefined);
    pagefind.search.mockReset().mockResolvedValue({ results: [] });
  });

  async function searchFor(context: ReturnType<typeof useSearchContext>, query: string) {
    context.setQuery(query);
    await nextTick();
    // wait out the 200ms debounce, then for the search itself to settle
    await new Promise(resolve => setTimeout(resolve, 250));
    await vi.waitFor(() => expect(context.loading.value).toBe(false));
  }

  it('clears the results without searching when the query is blank', async () => {
    const context = useSearchContext();

    await searchFor(context, '   ');

    expect(context.results.value).toEqual([]);
    expect(pagefind.search).not.toHaveBeenCalled();
  });

  it('marks search as unavailable when pagefind fails to initialise', async () => {
    locale.value = 'de';
    pagefind.options.mockRejectedValue(new Error('index missing'));
    const context = useSearchContext();

    await searchFor(context, 'hello');

    expect(context.unavailable.value).toBe(true);
    expect(context.results.value).toEqual([]);
  });

  it('searches pagefind for the current locale and strips .html from result urls', async () => {
    locale.value = 'en';
    pagefind.search.mockResolvedValue({
      results: [
        {
          data: async () => ({
            url: '/posts/1-my-post.html',
            meta: { title: 'My Post' },
            excerpt: 'main excerpt',
            sub_results: [{ url: '/posts/1-my-post.html#intro', title: 'Intro', excerpt: 'sub excerpt' }],
          }),
        },
        { data: async () => ({ url: '/about.html', excerpt: 'about excerpt' }) },
      ],
    });
    const context = useSearchContext();

    await searchFor(context, 'post');

    expect(pagefind.options).toHaveBeenCalledWith(expect.objectContaining({ language: 'en' }));
    expect(pagefind.search).toHaveBeenCalledWith('post');
    expect(context.results.value).toEqual([
      {
        url: '/posts/1-my-post',
        meta: { title: 'My Post' },
        excerpt: 'main excerpt',
        sub_results: [{ url: '/posts/1-my-post#intro', title: 'Intro', excerpt: 'sub excerpt' }],
      },
      { url: '/about', excerpt: 'about excerpt', sub_results: undefined },
    ]);
  });

  it('initialises pagefind only once per language', async () => {
    locale.value = 'fr';
    const context = useSearchContext();

    await searchFor(context, 'premier');
    await searchFor(context, 'deuxième');

    expect(pagefind.options).toHaveBeenCalledTimes(1);
    expect(pagefind.search).toHaveBeenCalledTimes(2);
  });

  it('resets the query and results when the dialog opens', async () => {
    const context = useSearchContext();
    context.setQuery('previous search');
    await nextTick();

    context.open();
    await nextTick();

    expect(context.query.value).toBe('');
    expect(context.results.value).toEqual([]);
  });
});
