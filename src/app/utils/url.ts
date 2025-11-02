import slugify from 'slugify';

export function createSlug(text?: string) {
  return slugify(text ?? '', { lower: true }).replaceAll('.', '_');
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
