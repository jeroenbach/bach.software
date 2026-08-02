/**
 * Stand-in for the runtime-generated `/pagefind/pagefind.js` bundle, which only
 * exists after a full static build. `vitest.config.ts` aliases the bundle's url
 * to this module so tests can exercise `useSearchContext`; tests control its
 * behaviour through `globalThis.__pagefindMock`.
 */
interface PagefindMockHooks {
  options: (opts: unknown) => Promise<void>
  search: (query: string) => Promise<{ results: { data: () => Promise<unknown> }[] }>
}

function hooks(): PagefindMockHooks {
  const mock = (globalThis as Record<string, any>).__pagefindMock;
  if (!mock) {
    throw new Error('globalThis.__pagefindMock is not set — assign it in your test before searching');
  }
  return mock;
}

export function options(opts: unknown) {
  return hooks().options(opts);
}

export function search(query: string) {
  return hooks().search(query);
}
