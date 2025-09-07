import antfu from '@antfu/eslint-config';

export default antfu({
  formatters: true,
  stylistic: true,
  nuxt: true,
  ignores: [
    'src/app/services/backend/**',
    '**/*.md',
  ],
  rules: {
    // Allow throwing non-Error objects in test files
    'no-throw-literal': 'off',
    'style/semi': ['error', 'always'],

    'vue/attribute-hyphenation': ['error', 'never'],
    'vue/v-on-event-hyphenation': ['error', 'never'],
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
        ],
      },
    ],
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
});
