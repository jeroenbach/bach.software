import en from '~/locales/en.json';

/** Resolves a key from the English catalog and fills its `{placeholders}`, like vue-i18n would. */
export function translate(key: string, params: Record<string, unknown> = {}): string {
  const template = key.split('.').reduce<unknown>(
    (node, part) => (typeof node === 'object' && node !== null ? (node as Record<string, unknown>)[part] : undefined),
    en,
  );
  if (typeof template !== 'string')
    return key;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? `{${name}}`));
}
