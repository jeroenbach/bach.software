import type { Page } from "~/types/Page";

export const useAzureApi = () => {
  const config = useRuntimeConfig();

  const getPageViews = async (url: string) =>
    await $fetch(`${config.public.apiBase ?? ""}/api/PageViews?url=${url}`);

  return { getPageViews };
};

export const usePageReads = async () => {
  if (!import.meta.client) return null;

  const currentUrl = window.location.href;

  const { getPageViews } = useAzureApi();

  return await getPageViews(currentUrl);
};
