import slugify from "slugify";

export const createSlug = (text?: string) =>
  // Add an extra rule to remove the dots as nuxt ssg doesn't like them
  slugify(text ?? "", { lower: true }).replaceAll(".", "_");

/**
 * Helps create a clean url by removing extra slashes and adding a base url if it exists.
 * @param relativeUrl url within the site
 * @param baseUrl the base url of the site
 * @returns a clean url
 */
export const createAbsoluteUrl = (relativeUrl: string, baseUrl?: string) => {
  let url = relativeUrl;

  // clean extra slashes
  url = url.split("/").filter(isNotNullOrUndefinedOrEmpty).join("/");

  // Add baseUrl if it exists
  if (baseUrl) {
    url = new URL(`/${url}`, baseUrl).href;
  }

  return url;
};