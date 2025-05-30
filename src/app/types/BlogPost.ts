import type { MarkdownRoot, Toc } from "@nuxt/content";

import type { Author } from "~/types/Author";

export interface BlogPostSummary {
  _path: string;
  /**
   * In case you want to override the automatically generated slug
   */
  slug?: string;
  title: string;
  draft?: boolean;
  url: string;
  description: string;
  category?: string;
  keywords?: string[];
  authorName: string;
  author: Author;
  datePublished: string;
  dateModified: string;
  imgCoverUrl?: string;
  imgCoverPosition?: string;
  readingTime?: { text: string; minutes: number; time: number; words: number };
  /**
   * Content excerpt, generated from content
   */
  excerpt?: MarkdownRoot;
}

export interface BlogPost extends BlogPostSummary {
  /**
   * Parsed Markdown body with included table of contents.
   */
  body: MarkdownRoot & {
    toc?: Toc;
  };
}
