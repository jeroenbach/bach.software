import { useDebounceFn } from '@vueuse/core';
import { ref, watch } from 'vue';

export interface SearchResult {
  url: string
  meta?: { title?: string }
  excerpt: string
}

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
        await pf.options({ language: lang });
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
      results.value = await Promise.all(hits.slice(0, 8).map((r: any) => r.data()));
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
