import type { ContentNavigationItem } from '@nuxt/content';

export interface ContentNavigationItemExtended extends ContentNavigationItem {
  type: MetadataType
  contentId: number
  url: string
  locale: string
  dateModified: string
}

export interface ContentNavigationDictionary {
  [contentId: number]: {
    [locale: string]: ContentNavigationItemExtended
  }
}
