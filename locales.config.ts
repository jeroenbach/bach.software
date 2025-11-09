import type { LocaleObject } from '@nuxtjs/i18n';
import { joinURL } from 'ufo';
import { toMap } from './src/app/utils/toMap';
import { createSlug } from './src/app/utils/url';

export interface LocaleStructure extends LocaleObject {
  pagesPath: string
  postsPath: string
  authorsPath: string
}

export const locales: LocaleStructure[] = [
  { code: 'en', language: 'en', file: 'en.json', pagesPath: '/content', postsPath: '/posts', authorsPath: '/authors', isCatchallLocale: true },
  { code: 'fr', language: 'fr', file: 'fr.json', pagesPath: '/content', postsPath: '/articles', authorsPath: '/auteurs' },
  { code: 'nl', language: 'nl', file: 'nl.json', pagesPath: '/content', postsPath: '/posts', authorsPath: '/auteurs' },
  { code: 'de', language: 'de', file: 'de.json', pagesPath: '/content', postsPath: '/posts', authorsPath: '/autoren' },
  { code: 'es', language: 'es', file: 'es.json', pagesPath: '/content', postsPath: '/articulos', authorsPath: '/autores' },
];

export type LocalesCode = Parameters<typeof localesMap.get>[0];

export const localesMap = toMap(locales, 'code');

export const pagesPaths = toMap(locales, 'pagesPath');

export const postsPaths = toMap(locales, 'postsPath');

export const authorsPaths = toMap(locales, 'authorsPath');

export const defaultLocale = 'en';

export function localePrefix(locale: LocalesCode) {
  return locale === defaultLocale ? '' : `/${locale}`;
}

export function createUrl(locale: LocalesCode, urlPath: string) {
  const prefix = localePrefix(locale);
  urlPath = urlPath.replaceAll(prefix, ''); // avoid double locale prefix
  return joinURL(prefix, urlPath);
}

export function createPageUrl(locale: LocalesCode, contentId: number, title: string, slug?: string) {
  const structure = localesMap.get(locale);
  return joinURL(localePrefix(locale), structure!.pagesPath, `${contentId}-${slug ?? createSlug(title)}`);
}

export function createBlogPostUrl(locale: LocalesCode, contentId: number, title: string, slug?: string) {
  const structure = localesMap.get(locale);
  return joinURL(localePrefix(locale), structure!.postsPath, `${contentId}-${slug ?? createSlug(title)}`);
}
