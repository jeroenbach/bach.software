export interface Metadata {
  path: string
  title: string
  description: string
  datePublished: string
  dateModified: string
  imageUrl?: string
  imageAlt?: string
  /**
   * In case the canonical is different from the url, specify it here
   */
  canonicalUrl?: string
}
