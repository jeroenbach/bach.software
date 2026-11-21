// @vitest-environment node
import { resolve } from 'node:path';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';
import { permittedElementTypes } from '../helpers/dataTestid';

const root = resolve(import.meta.dirname, '../../../..');
const eslint = new ESLint({ cwd: root });

async function messagesFor(template: string, folder = 'src/app/components') {
  const [result] = await eslint.lintText(`<template>\n  ${template}\n</template>\n`, {
    filePath: resolve(root, folder, 'LintProbe.vue'),
  });
  return result!.messages.filter(message => message.ruleId === 'vue/no-restricted-syntax');
}

// Plain strings holding a template literal source would trip no-template-curly-in-string
const ref = (name: string) => `\${${name}}`;
const template = (...parts: string[]) => `\`${parts.join('')}\``;

const reported = async (template: string, folder?: string) => (await messagesFor(template, folder)).length > 0;

describe('data-testid lint', () => {
  describe('accepted ids', () => {
    it.each([
      'color-mode-switcher-toggle-button',
      'search-keyword-input',
      'side-menu-import-link',
      'order-details-select-all-checkbox',
      'user-profile-country-select',
      'order-details-deadline-value',
      'reports-row-a3f9',
      'like-button',
    ])('should accept the static id %s', async (id) => {
      expect(await reported(`<div data-testid="${id}" />`)).toBe(false);
    });

    it.each(permittedElementTypes)('should accept an id ending in %s', async (type) => {
      expect(await reported(`<div data-testid="order-details-export-${type}" />`)).toBe(false);
    });

    it.each([
      template(ref('baseDataTestid'), '-close-button'),
      template(ref('baseDataTestid'), '-row-', ref('key')),
      template(ref('a'), '-', ref('b'), '-comment-input'),
    ])('should accept the bound template %s', async (expression) => {
      expect(await reported(`<div :data-testid="${expression}" />`)).toBe(false);
    });

    it('should leave a bare identifier binding to review', async () => {
      expect(await reported('<div :data-testid="someId" />')).toBe(false);
    });
  });

  describe('rejected ids', () => {
    it.each([
      'BadName',
      'bad_name-button',
      'userProfileSubmit',
      'btn-navbar-save',
      'navbar-save-btn',
      'order-details-export',
      'Order-Details-Export-Button',
      'order details-button',
      'export-button-',
      'button',
      '',
    ])('should report the static id "%s" and name data-testid', async (id) => {
      const messages = await messagesFor(`<div data-testid="${id}" />`);

      expect(messages).toHaveLength(1);
      expect(messages[0]!.message).toContain('data-testid');
    });

    it('should report a valueless attribute', async () => {
      expect(await reported('<div data-testid />')).toBe(true);
    });

    it.each([
      template(ref('base'), '-export'),
      template(ref('base'), '-row-', ref('key'), '-extra'),
      '\'BadName\'',
    ])('should report the bound expression %s', async (expression) => {
      expect(await reported(`<div :data-testid="${expression}" />`)).toBe(true);
    });

    it.each(['data-test', 'data-cy', 'data-qa'])('should report the %s variant attribute', async (attribute) => {
      const messages = await messagesFor(`<div ${attribute}="save-button" />`);

      expect(messages).toHaveLength(1);
      expect(messages[0]!.message).toContain('data-testid');
    });
  });

  describe('where the rule applies', () => {
    it.each([
      'src/app/components',
      'src/app/pages',
      'src/app/contexts',
      'src/app/layouts',
      'src/app/.storybook/mocks',
      'src/app/examples',
    ])('should report a bad id in %s', async (folder) => {
      expect(await reported('<div data-testid="BadName" />', folder)).toBe(true);
    });
  });

  describe('neighbouring rules', () => {
    it('should still report inline styles next to the id rule', async () => {
      const messages = await messagesFor('<div style="color:red" :style="x" data-testid="BadName" />');

      expect(messages.map(message => message.message.slice(0, 5))).toEqual(['FE-09', 'FE-09', 'FE-07']);
    });

    it('should not flag data-testid as a hyphenated attribute', async () => {
      const [result] = await eslint.lintText('<template>\n  <div data-testid="order-details-export-button" />\n</template>\n', {
        filePath: resolve(root, 'src/app/components/LintProbe.vue'),
      });

      expect(result!.messages.filter(message => message.ruleId === 'vue/attribute-hyphenation')).toEqual([]);
    });
  });
});
