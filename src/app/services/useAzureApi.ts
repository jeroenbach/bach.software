export const useAzureApi = () => {
  const config = useRuntimeConfig();

  const getPageReads = async (url: string): Promise<number> =>
    await $fetch(`${config.public.apiBase ?? ""}/api/pageReads?url=${url}`);

  return { getPageViews: getPageReads };
};
