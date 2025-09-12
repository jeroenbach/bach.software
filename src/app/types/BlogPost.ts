import type { MarkdownRoot, Toc } from '@nuxt/content';

import type { Author } from '~/types/Author';
import type { Metadata } from '~/types/Metadata';

export interface BlogPostSummary extends Metadata {
  draft?: boolean
  /**
   * In case you want to override the automatically generated slug
   */
  slug?: string
  category?: string
  keywords?: string[]
  authorName: string
  author: Author
  imagePosition?: string
  readingTime?: { text: string, minutes: number, time: number, words: number }
  /**
   * This is the path including the slug
   */
  url?: string
  /**
   * Content excerpt, generated from content
   */
  excerpt?: MarkdownRoot
}

export interface BlogPost extends BlogPostSummary {
  /**
   * Parsed Markdown body with included table of contents.
   */
  body: MarkdownRoot & {
    toc?: Toc
  }
}
