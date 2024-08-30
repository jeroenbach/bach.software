import type { MarkdownParsedContent } from "@nuxt/content";

/**
 * Our markdown article type
 */
export interface Article extends MarkdownParsedContent {
  slug: string;
  readTime: string;
  author: string;
  date: string;
  imgCover: string;
}
