import slugify from 'slugify';

export function createSlug(text?: string) {
  return slugify(text ?? '', { lower: true }).replaceAll('.', '_');
}

/**
 * Strips the `.html` file extension from a URL while preserving any #fragment
 * or ?query. The static build emits pages as `<name>.html` files, so tools that
 * index the build output (e.g. Pagefind) return those raw file URLs — but the
 * app's routes (and configured canonical urls) don't have the extension, and
 * navigating to the `.html` path triggers a canonical redirect that loses the
 * fragment.
 * @param url a site-relative url, e.g. `/posts/1-my-post.html#section`
 * @returns the url without the extension, e.g. `/posts/1-my-post#section`
 */
export function stripHtmlExtension(url: string) {
  return url
    .replace(/\/index\.html(?=[#?]|$)/, '/')
    .replace(/\.html(?=[#?]|$)/, '');
}

/**
 * Helps create a clean url by removing extra slashes and adding a base url if it exists.
 * @param relativeUrl url within the site
 * @param baseUrl the base url of the site
 * @returns a clean url
 */
export function createAbsoluteUrl(relativeUrl: string, baseUrl: string) {
  // Add baseUrl
  const url = new URL(relativeUrl, baseUrl);

  // Clean up any double slashes in the path
  url.pathname = url.pathname
    .split('/')
    .filter(x => x)
    .join('/');

  return url.href;
}
