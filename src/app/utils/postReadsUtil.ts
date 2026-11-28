import type { PageReads } from '~/services/backend/models';
import type { PostReads } from '~/types/PostReads';

/**
 * The threeQuarterRead property gives a much higher count than the read property.
 * Probably this is the actual time most users take to read the article.
 */
export function toPostReads(pageReads: PageReads | null | undefined): PostReads | undefined {
  if (!pageReads) {
    return undefined;
  }
  return { readCount: pageReads.threeQuarterRead ?? undefined };
}
