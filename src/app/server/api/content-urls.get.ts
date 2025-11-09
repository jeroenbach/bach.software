import { getContentUrlMap } from '~/server/utils/contentUrls';

export default defineEventHandler(async (event) => {
  const urlMap = await getContentUrlMap(event);
  return urlMap;
});
