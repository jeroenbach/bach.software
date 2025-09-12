import type { MarkdownRoot, Toc } from '@nuxt/content';

import type { Metadata } from './Metadata';

export interface Page extends Metadata {
  url?: string
  draft?: boolean
  /**
   * Parsed Markdown body with included table of contents.
   */
  body: MarkdownRoot & {
    toc?: Toc
  }
}
