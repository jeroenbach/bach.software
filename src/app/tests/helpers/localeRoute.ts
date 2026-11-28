import { onTestFinished } from 'vitest';
import { useNuxtApp } from '#imports';

/**
 * The route to mount a component at so the real i18n instance renders in the given locale
 * (mountSuspended resets the locale to the one of the route). Restores English after the test.
 */
export function localeRoute(locale: 'en' | 'nl' | 'de') {
  const { $i18n } = useNuxtApp();
  onTestFinished(async () => {
    await $i18n.setLocale('en');
  });
  return locale === 'en' ? '/' : `/${locale}`;
}
