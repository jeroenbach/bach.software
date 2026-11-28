import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

function readCatalog(locale: string): Record<string, any> {
  return JSON.parse(readFileSync(resolve(process.cwd(), `src/app/locales/${locale}.json`), 'utf8'));
}

/**
 * The raw locale files. Importing the JSON in the Nuxt test environment yields
 * precompiled message functions, so tests read the plain strings from disk instead.
 */
export const catalogs = {
  en: readCatalog('en'),
  nl: readCatalog('nl'),
  de: readCatalog('de'),
};
