import type { Collections } from '@nuxt/content';

export function whereNotDraft<T extends keyof Collections>(query: ReturnType<typeof queryCollection<T>>) {
  return query.orWhere(q => q.where('draft', 'IS NULL').where('draft', '=', false)) as ReturnType<typeof queryCollection<T>>;
}
