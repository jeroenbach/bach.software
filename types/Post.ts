import type { MarkdownRoot, Toc } from "@nuxt/content";

export interface PostSummary {
  _path?: string;
  /**
   * In case you want to override the automatically generated slug
   */
  slug?: string;
  title: string;
  url: string;
  description: string;
  category?: string;
  keywords?: string[];
  author: string;
  datePublished: string;
  dateModified: string;
  imgCoverUrl?: string;
  readTime?: string;
  /**
   * Content excerpt, generated from content
   */
  excerpt?: MarkdownRoot;
  /**
   * Parsed Markdown body with included table of contents.
   */
  body: MarkdownRoot & {
    toc?: Toc;
  };
}

export interface Post extends PostSummary {}
