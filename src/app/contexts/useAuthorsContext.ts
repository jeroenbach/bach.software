import type { Author } from '~/types/Author';

export async function useAuthorsContext(userName: string) {
  const uniqueId = `authorsContext-${userName}`;

  return await useAsyncData(
    uniqueId,
    async () => {
      const query = queryContent<Author>('authors');

      if (userName) {
        query.where({ userName: { $eq: userName } });
      }

      return await query.findOne();
    },
    {
      default: () => undefined,
    },
  );
}
