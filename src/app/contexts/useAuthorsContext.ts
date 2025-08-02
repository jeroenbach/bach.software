import type { Author } from "~/types/Author";

export const useAuthorsContext = async (userName: string) => {
  const uniqueId = `authorsContext-${userName}`;

  return await useAsyncData(
    uniqueId,
    async () => {
      const query = queryContent<Author>("authors");

      if (userName) {
        query.where({ userName: { $eq: userName } });
      }

      return await query.findOne();
    },
    {
      default: () => undefined,
    },
  );
};
