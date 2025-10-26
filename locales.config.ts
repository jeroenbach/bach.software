import type { LocaleObject } from '@nuxtjs/i18n';
import { joinURL } from 'ufo';
import { toMap } from './src/app/utils/toMap';

interface LocaleStructure extends LocaleObject {
  pagesPath: string
  postsPath: string
  authorsPath: string
}

export const locales: LocaleStructure[] = [
  { code: 'en', language: 'en-US', file: 'en.json', pagesPath: '/content', postsPath: '/posts', authorsPath: '/authors' },
  { code: 'fr', language: 'fr-FR', file: 'fr.json', pagesPath: '/content', postsPath: '/articles', authorsPath: '/auteurs' },
];

type LocalesCode = Parameters<typeof localesMap.get>[0];

export const localesMap = toMap(locales, 'code');

export const pagesPaths = toMap(locales, 'pagesPath');

export const postsPaths = toMap(locales, 'postsPath');

export const authorsPaths = toMap(locales, 'authorsPath');

export const defaultLocale = 'en';

export function createPageUrl(locale: LocalesCode, contentId: number, title: string, slug?: string) {
  const structure = localesMap.get(locale);
  return joinURL(structure!.pagesPath, `${contentId}-${slug ?? createSlug(title)}`);
}

export function createBlogPostUrl(locale: LocalesCode, contentId: number, title: string, slug?: string) {
  const structure = localesMap.get(locale);
  return joinURL(structure!.postsPath, `${contentId}-${slug ?? createSlug(title)}`);
}
