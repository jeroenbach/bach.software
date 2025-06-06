/**
 * Query the content with the current locale context.
 * This is useful for querying content that is locale-specific.
 */
export const queryContentLocaleContext = (query: string) => {
  const { locale } = useI18n();
  return queryCollection(query).where({
    _locale: locale.value,
  });
};
