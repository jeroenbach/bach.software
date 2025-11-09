import type { Collections } from '@nuxt/content';

export async function useAuthorsContext<TSingle extends string | undefined = undefined>(userName?: TSingle) {
  const { locale } = useI18n();
  const uniqueId = `authorsContext-${locale.value}-${userName}`;

  return await useAsyncData(
    uniqueId,
    async () => {
      type TAuthorSingleOrMultiple = undefined extends TSingle ? Author[] : Author;

      const collection = `authors_${locale.value}` as Extract<keyof Collections, `authors_${string}`>;
      const query = queryCollection(collection);

      if (userName) {
        query.where('userName', '=', userName);
      }

      const authors = await query.all() as Author[];

      return (userName ? authors?.[0] : authors) as TAuthorSingleOrMultiple;
    },
    {
      default: () => undefined,
    },
  );
}
