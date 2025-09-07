/**
 * Query the content with the current locale context.
 * This is useful for querying content that is locale-specific.
 */
export function queryContentLocaleContext(query: string, ...pathParts: string[]) {
  const { locale } = useI18n();
  return queryContent(query, ...pathParts).where({
    _locale: locale.value,
  });
}
