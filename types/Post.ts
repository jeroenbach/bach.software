import type { MarkdownParsedContent } from "@nuxt/content";

export interface PostSummary
  extends Pick<MarkdownParsedContent, "_path" | "excerpt"> {
  title?: string;
  slug?: string;
  readTime?: string;
  author?: string;
  date?: string;
  imgCover?: string;
}

export interface Post extends PostSummary, MarkdownParsedContent {}
