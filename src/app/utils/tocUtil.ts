import type { TocLink } from '@nuxt/content';

/**
 * Flattens nested table of contents links into a list of heading ids, in document order.
 */
export function flattenTocLinkIds(links: TocLink[]): string[] {
  return links.flatMap(link => [link.id, ...flattenTocLinkIds(link.children ?? [])]);
}
