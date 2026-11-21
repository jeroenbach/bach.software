import path from 'node:path';
import antfu from '@antfu/eslint-config';

// FE-05: shared files are recognisable by name. `unicorn/filename-case` cannot require a prefix or
// suffix, so this small rule matches the whole basename (test variants included) against a per-folder pattern.
const sharedFileNaming = {
  rules: {
    'filename-pattern': {
      meta: {
        type: 'problem',
        schema: [{
          type: 'object',
          properties: { pattern: { type: 'string' }, hint: { type: 'string' } },
          required: ['pattern', 'hint'],
          additionalProperties: false,
        }],
        messages: { invalid: 'FE-05: "{{name}}" must be {{hint}}.' },
      },
      create(context) {
        const { pattern, hint } = context.options[0];
        const name = path.basename(context.filename);
        return {
          Program(node) {
            if (!new RegExp(pattern).test(name)) {
              context.report({ node, messageId: 'invalid', data: { name, hint } });
            }
          },
        };
      },
    },
  },
};

// FE-07: data-testid values are lowercase kebab-case `<context>-<purpose>-<elementtype>` and end in one of
// the standard's element types. A repeated container may instead use the `<context>-row-<key>` form.
const testidTypes = 'button|input|link|checkbox|radio|select|table|icon|value|row|card|panel|modal';
const testidStatic = `^[a-z0-9]+(-[a-z0-9]+)*-(${testidTypes})$`;
const testidRow = '^[a-z0-9]+(-[a-z0-9]+)*-row-[a-z0-9]+(-[a-z0-9]+)*$';
const testidMessage = 'FE-07: data-testid must be lowercase kebab-case `<context>-<purpose>-<elementtype>` ending in one of: '
  + `${testidTypes.replaceAll('|', ', ')}. A row container may use \`<context>-row-<key>\`.`;
const testidSelectors = [
  // Static value: `data-testid="..."`. A valueless attribute has no value node and is reported too.
  {
    selector: `VAttribute[directive=false][key.name='data-testid']:not([value.value=/${testidStatic}/]):not([value.value=/${testidRow}/])`,
    message: testidMessage,
  },
  // Bound string literal: `:data-testid="'...'"`.
  {
    selector: `VAttribute[directive=true][key.argument.name='data-testid'] > VExpressionContainer > Literal:not([value=/${testidStatic}/]):not([value=/${testidRow}/])`,
    message: testidMessage,
  },
  // Bound template literal: the static tail must end in an element type, or the literal is a
  // `...-row-${key}` container id. Bare identifiers and other expressions are left to review.
  {
    selector: `VAttribute[directive=true][key.argument.name='data-testid'] > VExpressionContainer > TemplateLiteral:not(:has(TemplateElement[tail=true][value.cooked=/-(${testidTypes})$/])):not(:has(TemplateElement[tail=false][value.cooked=/-row-$/]):has(TemplateElement[tail=true][value.cooked=/^$/]))`,
    message: testidMessage,
  },
  {
    selector: 'VAttribute[directive=false][key.name=/^data-(test|cy|qa)$/]',
    message: 'FE-07: use `data-testid`, not data-test, data-cy or data-qa.',
  },
  {
    selector: 'VAttribute[directive=true][key.argument.name=/^data-(test|cy|qa)$/]',
    message: 'FE-07: use `data-testid`, not data-test, data-cy or data-qa.',
  },
];

export default antfu({
  formatters: true,
  stylistic: true,
  nuxt: true,
  ignores: [
    'src/api/**',
    'src/app/services/backend/**',
    '**/*.md',
    'k8s/**',
    'openapi/**',
  ],
  rules: {
    // Allow throwing non-Error objects in test files
    'no-throw-literal': 'off',
    'style/semi': ['error', 'always'],

    'vue/attribute-hyphenation': ['error', 'never'],
    'vue/v-on-event-hyphenation': ['error', 'never', { autofix: true }],
    'vue/multi-word-component-names': [
      'error',
      {
        ignores: [
          'index',
          'default',
          'app',
          'home',
          'about',
          'portfolio',
          'plausible',
          'contact',
          '[id][[slug]]',
          '[slug]',
          'gray',
          'Parent',
          'Child',
          'Example',
          'App404',
          'error',
        ],
      },
    ],
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

    // FE-10: no JavaScript classes.
    // FE-11: never keep a `props` object and never use withDefaults. Destructure defineProps
    // only when a prop is used in the script or needs a default; otherwise call it bare.
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ClassDeclaration',
        message: 'FE-10: no JavaScript classes. Use plain functions/composables instead.',
      },
      {
        selector: 'ClassExpression',
        message: 'FE-10: no JavaScript classes. Use plain functions/composables instead.',
      },
      {
        selector: 'VariableDeclarator[id.type=\'Identifier\'] > CallExpression[callee.name=\'defineProps\']',
        message: 'FE-11: never keep a `props` object. Destructure defineProps when a prop is used in the script or needs a default; otherwise call it bare.',
      },
      {
        selector: 'CallExpression[callee.name=\'withDefaults\']',
        message: 'FE-11: use destructuring defaults on defineProps instead of withDefaults.',
      },
    ],

    // FE-09: no inline styles; styling belongs in CSS classes.
    'vue/no-restricted-syntax': [
      'error',
      {
        selector: 'VAttribute[directive=false][key.name=\'style\']',
        message: 'FE-09: no inline style attributes. Drive per-instance variation with a class chosen from a prop.',
      },
      {
        selector: 'VAttribute[directive=true][key.argument.name=\'style\']',
        message: 'FE-09: no :style bindings. Drive per-instance variation with a class chosen from a prop.',
      },
      ...testidSelectors,
    ],

    // FE-19 (partial): backend calls go through the generated Kiota client, not axios/ofetch/fetch directly.
    // Type-only imports are allowed everywhere (zero runtime coupling); only value imports are restricted.
    '@typescript-eslint/no-restricted-imports': [
      'error',
      {
        paths: [
          { name: 'axios', message: 'FE-19: use the generated backend client (~/services/backend), not axios.' },
          { name: 'ofetch', message: 'FE-19: use the generated backend client (~/services/backend), not ofetch.' },
        ],
        patterns: [
          {
            group: ['~/services/backend', '~/services/backend/*', '*/services/backend', '*/services/backend/*'],
            message: 'FE-19: the generated backend client is only imported from src/app/contexts/** (or its construction composable).',
            allowTypeImports: true,
          },
          {
            group: ['pinia'],
            message: 'FE-20: import the destructible-store wrapper from ~/composables/useDestructiblePinia, not pinia directly.',
          },
        ],
      },
    ],
  },
}, {
  files: ['src/app/.storybook/mocks/**/*.vue', 'src/app/examples/**/*.vue'],
  rules: {
    // Storybook mocks and blog-post code samples are intentionally bare; not held to the app's own
    // component standards. Redefined without the FE-11 entries (flat-config rule settings replace, not merge).
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ClassDeclaration',
        message: 'FE-10: no JavaScript classes. Use plain functions/composables instead.',
      },
      {
        selector: 'ClassExpression',
        message: 'FE-10: no JavaScript classes. Use plain functions/composables instead.',
      },
    ],
  },
}, {
  files: ['src/app/composables/useDestructiblePinia.ts'],
  rules: {
    // This is the one designated wrapper FE-20 carves out the exception for.
    '@typescript-eslint/no-restricted-imports': 'off',
  },
}, {
  files: ['src/app/contexts/**/*.ts', 'src/app/contexts/**/*.vue'],
  rules: {
    // Contexts are the smart layer: they're allowed to construct and use the backend client.
    '@typescript-eslint/no-restricted-imports': [
      'error',
      {
        paths: [
          { name: 'axios', message: 'FE-19: use the generated backend client (~/services/backend), not axios.' },
          { name: 'ofetch', message: 'FE-19: use the generated backend client (~/services/backend), not ofetch.' },
        ],
        patterns: [
          {
            group: ['pinia'],
            message: 'FE-20: import the destructible-store wrapper from ~/composables/useDestructiblePinia, not pinia directly.',
          },
        ],
      },
    ],
  },
}, {
  files: ['src/app/components/**/*.vue'],
  rules: {
    // FE-01/FE-16: presentational components render links but never perform navigation themselves.
    '@typescript-eslint/no-restricted-imports': [
      'error',
      {
        paths: [
          { name: 'axios', message: 'FE-19: use the generated backend client (~/services/backend), not axios.' },
          { name: 'ofetch', message: 'FE-19: use the generated backend client (~/services/backend), not ofetch.' },
          { name: 'vue-router', importNames: ['useRouter', 'useRoute'], message: 'FE-16: navigation is performed by context components, not presentational ones.' },
          { name: '#app', importNames: ['useRouter', 'useRoute', 'navigateTo'], message: 'FE-16: navigation is performed by context components, not presentational ones.' },
        ],
        patterns: [
          {
            group: ['~/services/backend', '~/services/backend/*', '*/services/backend', '*/services/backend/*'],
            message: 'FE-19: the generated backend client is only imported from src/app/contexts/** (or its construction composable).',
            allowTypeImports: true,
          },
          {
            group: ['pinia'],
            message: 'FE-20: import the destructible-store wrapper from ~/composables/useDestructiblePinia, not pinia directly.',
          },
        ],
      },
    ],
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ClassDeclaration',
        message: 'FE-10: no JavaScript classes. Use plain functions/composables instead.',
      },
      {
        selector: 'ClassExpression',
        message: 'FE-10: no JavaScript classes. Use plain functions/composables instead.',
      },
      {
        selector: 'CallExpression[callee.name=\'useRouter\']',
        message: 'FE-16: navigation is performed by context components, not presentational ones.',
      },
      {
        selector: 'CallExpression[callee.name=\'useRoute\']',
        message: 'FE-16: navigation is performed by context components, not presentational ones.',
      },
      {
        selector: 'CallExpression[callee.name=\'navigateTo\']',
        message: 'FE-16: navigation is performed by context components, not presentational ones.',
      },
      {
        selector: 'CallExpression[callee.name=\'useAppConfig\']',
        message: 'FE-18: app-config values are read at the page/context level and passed down as props.',
      },
      {
        selector: 'VariableDeclarator[id.type=\'Identifier\'] > CallExpression[callee.name=\'defineProps\']',
        message: 'FE-11: never keep a `props` object. Destructure defineProps when a prop is used in the script or needs a default; otherwise call it bare.',
      },
      {
        selector: 'CallExpression[callee.name=\'withDefaults\']',
        message: 'FE-11: use destructuring defaults on defineProps instead of withDefaults.',
      },
    ],
  },
}, {
  files: ['src/app/composables/**/*.ts'],
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'CallExpression[callee.name=\'useAppConfig\']',
        message: 'FE-18: app-config values are read at the page/context level; composables should receive them as parameters.',
      },
    ],
  },
}, {
  files: ['src/app/utils/**/*.ts'],
  plugins: { 'shared-file-naming': sharedFileNaming },
  rules: {
    'shared-file-naming/filename-pattern': ['error', {
      pattern: '^[a-z][a-zA-Z0-9]*Util(\\.(nuxt\\.)?test)?\\.ts$',
      hint: 'camelCase ending in "Util" (for example dateUtil.ts, dateUtil.test.ts)',
    }],
  },
}, {
  files: ['src/app/composables/**/*.ts'],
  plugins: { 'shared-file-naming': sharedFileNaming },
  rules: {
    'shared-file-naming/filename-pattern': ['error', {
      pattern: '^use[A-Z][a-zA-Z0-9]*(\\.(nuxt\\.)?test)?\\.ts$',
      hint: 'camelCase starting with "use" (for example useStopWatch.ts, useStopWatch.test.ts)',
    }],
  },
}, {
  files: ['dangerfile.ts'],
  rules: {
    // danger-js dangerfiles are executed as a single awaited module evaluation; top-level await is the documented pattern.
    'antfu/no-top-level-await': 'off',
  },
});
