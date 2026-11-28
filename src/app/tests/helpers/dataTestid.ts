import { expect } from 'vitest';

export const permittedElementTypes = [
  'button',
  'input',
  'link',
  'checkbox',
  'radio',
  'select',
  'table',
  'icon',
  'value',
  'row',
  'card',
  'panel',
  'modal',
] as const;

const kebabCase = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const rowContainer = /-row-[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** The root's own test id plus those of all its descendants. */
export function collectTestIds(root: Element): string[] {
  const own = root.getAttribute('data-testid');
  const descendants = Array.from(root.querySelectorAll('[data-testid]'), element => element.getAttribute('data-testid')!);
  return own ? [own, ...descendants] : descendants;
}

/** Every id is lowercase kebab-case, ends in a permitted element type (or is a row container) and starts with the base. */
export function expectConventionalTestIds(ids: string[], base?: string) {
  for (const id of ids) {
    expect(id, `${id} is lowercase kebab-case`).toMatch(kebabCase);
    const lastWord = id.split('-').at(-1)!;
    const isRowContainer = rowContainer.test(id);
    expect(isRowContainer || (permittedElementTypes as readonly string[]).includes(lastWord), `${id} ends in a permitted element type`).toBe(true);
    if (base)
      expect(id.startsWith(`${base}-`), `${id} starts with ${base}-`).toBe(true);
  }
}

/** No id appears twice inside one scope. */
export function expectUniqueWithinScope(scope: Element) {
  const ids = collectTestIds(scope);
  expect(ids.filter((id, index) => ids.indexOf(id) !== index), 'repeated ids').toEqual([]);
}
