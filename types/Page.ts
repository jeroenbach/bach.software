import type { MarkdownRoot, Toc } from "@nuxt/content";

export interface Page {
  _path: string;
  title: string;
  draft?: boolean;
  description: string;
  author: string;
  datePublished: string;
  dateModified: string;
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
