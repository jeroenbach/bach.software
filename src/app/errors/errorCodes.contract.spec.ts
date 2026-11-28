import { describe, expect, it } from 'vitest';
// The OpenAPI document is the error-code contract: the ProblemDetails schema's code enum lists
// every client-visible backend code, and x-error-placeholders maps each code to the
// placeholder names it provides (published by the backend's ErrorCodesDocumentTransformer).
// It is the same committed document the Kiota client is generated from; never edit it by hand.
import openapi from '../../../openapi/v1.json';
import en from '../locales/en.json';

const problemDetails = openapi.components.schemas.ProblemDetails;
const codes = Object.entries(problemDetails['x-error-placeholders'] as Record<string, string[]>);

const tokensIn = (template: string) => [...template.matchAll(/\{(\w+)\}/g)].map(match => match[1]!);
const templates = en.errors as Record<string, string>;

describe('error code translations', () => {
  it('declares placeholders for exactly the codes in the enum', () => {
    const enumCodes = problemDetails.properties.code.enum as string[];
    expect(codes.map(([code]) => code).sort()).toEqual([...enumCodes].sort());
  });

  it.each(codes)('translates %s', (code, placeholders) => {
    const template = templates[code];
    expect(template, `The backend can return "${code}" but en.json has no errors.${code} entry`).toBeDefined();

    // Exact match in both directions: a template may not interpolate values the backend
    // never sends, and may not ignore values the backend declares. If a translation does
    // not need a placeholder, remove the parameter from the ErrorCodes factory instead.
    const used = tokensIn(template!);
    for (const token of used) {
      expect(
        placeholders,
        `errors.${code} interpolates {${token}}, which the backend never provides`,
      ).toContain(token);
    }
    for (const placeholder of placeholders) {
      expect(
        used,
        `errors.${code} never uses {${placeholder}}, use it or remove the parameter from the ErrorCodes factory`,
      ).toContain(placeholder);
    }
  });
});
