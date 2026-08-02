import { useDebounceFn } from '@vueuse/core';
import { ref, watch } from 'vue';
import { stripHtmlExtension } from '~/utils/url';

export interface SearchSubResult {
  url: string
  title: string
  excerpt: string
}

export interface SearchResult {
  url: string
  meta?: { title?: string }
  excerpt: string
  sub_results?: SearchSubResult[]
}

// Pagefind's default ranking is tuned for larger, more uniform sites. This is a
// small site with a handful of long, in-depth posts alongside short pages (home,
// about) — the default pageLength weight (0.75) penalises the long posts relative
// to the site's (low) average page length. Dropping it lets post length stop
// being a ranking factor almost entirely, so relevance is driven by term matches
// instead. Tune further via the Pagefind debug tools if results still feel off:
// https://pagefind.app/docs/ranking/
const RANKING = {
  pageLength: 0.15,
};

// Module-level cache so we only download the index once per language per session.
// Pagefind reads <html lang=""> at init time; if the user switches locale the
// instance is recreated on next open because pfLang won't match.
let pfInstance: any = null;
let pfLang: string | null = null;

export function useSearchContext() {
  const { locale } = useI18n();
  const { isOpen, open, close } = useSearchDialog();

  const query = ref('');
  const results = ref<SearchResult[]>([]);
  const loading = ref(false);
  const unavailable = ref(false);

  async function getPagefind(lang: string) {
    if (pfInstance && pfLang === lang) {
      return pfInstance;
    }
    try {
      // Pagefind's index is generated post-build, not resolvable at compile time.
      // The path must be a non-literal so Vite's import-analysis plugin doesn't
      // try to eagerly resolve it in dev (it ignores @vite-ignore for string literals).
      const pagefindUrl = '/pagefind/pagefind.js';
      const pf = await import(/* @vite-ignore */ pagefindUrl);
      if (pfLang !== lang) {
        await pf.options({ language: lang, ranking: RANKING });
      }
      pfInstance = pf;
      pfLang = lang;
      return pf;
    }
    catch {
      unavailable.value = true;
      return null;
    }
  }

  const runSearch = useDebounceFn(async (q: string) => {
    if (!import.meta.client || !q.trim()) {
      results.value = [];
      return;
    }
    loading.value = true;
    try {
      const pf = await getPagefind(locale.value);
      if (!pf) {
        return;
      }
      const { results: hits } = await pf.search(q);
      const data: SearchResult[] = await Promise.all(hits.slice(0, 8).map((r: any) => r.data()));
      // Pagefind indexes the generated `.html` files and returns their raw
      // file URLs; strip the extension so links match the app's routes —
      // otherwise the canonical redirect drops sub-result #anchors.
      results.value = data.map(result => ({
        ...result,
        url: stripHtmlExtension(result.url),
        sub_results: result.sub_results?.map(subResult => ({
          ...subResult,
          url: stripHtmlExtension(subResult.url),
        })),
      }));
    }
    finally {
      loading.value = false;
    }
  }, 200);

  watch(query, q => runSearch(q));

  watch(isOpen, (opened) => {
    if (opened) {
      query.value = '';
      results.value = [];
    }
  });

  function setQuery(value: string) {
    query.value = value;
  }

  return { isOpen, open, close, query, results, loading, unavailable, setQuery };
}
