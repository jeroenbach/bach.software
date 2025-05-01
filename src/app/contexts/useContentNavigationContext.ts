/**
 * Gets the content from the pages folder and builds a navigation object.
 */
export const useContentNavigationContext = async () => {
  return useAsyncData(
    "navigation",
    () => fetchContentNavigation(queryContentLocaleContext("pages")),
    {
      transform: (data) => {
        return data?.[0]?.children?.map((item) => ({
          label: item.title,
          to: item._path === "/pages/posts" ? "/posts" : item._path, // Little hack for the posts page to work
        }));
      },
    },
  );
};
