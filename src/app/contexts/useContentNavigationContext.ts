/**
 * Gets the content from the pages folder and builds a navigation object.
 */
export const useContentNavigationContext = async () => {
  return useAsyncData<NavigationItem[]>(
    "navigation",
    async () => {
      const pages = await queryContent<Page>("pages")
        .where({
          _partial: false,
          draft: { $ne: true },
        })
        .only(["title", "url", "_path"])
        .find();

      return pages.map((item) => ({
        label: item.title ?? "",
        to: item.url ?? item._path,
      }));
    },
    {
      default: undefined,
    },
  );
};
