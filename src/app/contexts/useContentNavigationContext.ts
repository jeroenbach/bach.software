/**
 * Gets the content from the pages folder and builds a navigation object.
 */
export const useContentNavigationContext = async () => {
  const { locale } = useI18n();
  return await useAsyncData(
    "nav",
    () =>
      queryCollection("page").where("path", "LIKE", `/${locale.value}%`).all(),
    {
      transform: (data) => {
        return data?.map((item) => ({
          label: item.title,
          to:
            item.path === `/${locale.value}/pages/posts` ? "/posts" : item.path, // Little hack for the posts page to work
        }));
      },
    },
  );
};
