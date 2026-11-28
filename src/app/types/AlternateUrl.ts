export interface AlternateUrl {
  href: string
  hreflang: string
  /** The locale's slug segment; only set when the URL has the generated `/:id-:slug` form. */
  slug?: string
}
