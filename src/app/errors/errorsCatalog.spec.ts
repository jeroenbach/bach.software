import { describe, expect, it } from 'vitest';
import openapi from '../../../openapi/v1.json';
import de from '../locales/de.json';
import en from '../locales/en.json';
import nl from '../locales/nl.json';

const problemDetails = openapi.components.schemas.ProblemDetails;
const codes = Object.keys(problemDetails['x-error-placeholders'] as Record<string, string[]>);

const locales = { en, nl, de } as Record<string, { errors: Record<string, string> }>;
const buckets = ['unexpected', 'unavailable', 'validation'];
const keys = [...codes, ...buckets];

const tokensIn = (template: string) => [...template.matchAll(/\{(\w+)\}/g)].map(match => match[1]!).sort();

describe('errors catalog', () => {
  describe.each(Object.keys(locales))('%s', (locale) => {
    it.each(keys)('should have a translation for %s', (key) => {
      const template = locales[locale]!.errors[key];

      expect(typeof template).toBe('string');
      expect(template!.trim()).not.toBe('');
    });
  });

  it.each(keys)('should use the same placeholders for %s in every locale', (key) => {
    const expected = tokensIn(locales.en!.errors[key]!);

    for (const locale of ['nl', 'de'])
      expect(tokensIn(locales[locale]!.errors[key]!), `${locale} errors.${key}`).toEqual(expected);
  });
});
