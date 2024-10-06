import type { MarkdownParsedContent } from "@nuxt/content";

export interface PostSummary
  extends Pick<MarkdownParsedContent, "_path" | "excerpt"> {
  slug?: string;
  title?: string;
  description: string;
  category?: string;
  author?: string;
  date?: string;
  imgCoverUrl?: string;
  readTime?: string;
}

export interface Post extends PostSummary, MarkdownParsedContent {}
