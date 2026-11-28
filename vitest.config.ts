import { fileURLToPath } from 'node:url';
import { defineVitestProject } from '@nuxt/test-utils/config';
import { defineConfig } from 'vitest/config';

const nuxtSetupFile = fileURLToPath(new URL('./src/app/tests/setup/nuxt-color-mode.ts', import.meta.url));

export default defineConfig({
  define: {
    'import.meta.test': true,
  },
  test: {
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.nuxt/**',
      '**/playwright/**',
      '**/.output/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      include: [
        'src/app/components/**',
        'src/app/composables/**',
        'src/app/contexts/**',
        'src/app/pages/**',
        'src/app/stores/**',
        'src/app/types/**',
        'src/app/utils/**',
      ],
      exclude: [
        '**/*.{test,spec}.{ts,js}',
        '**/*.nuxt.{test,spec}.{ts,js}',
        '**/*.stories.ts',
      ],
      thresholds: {
        autoUpdate: true,
        statements: 88.26,
        branches: 81.55,
        functions: 87.92,
        lines: 88.46,
      },
    },
    projects: [
      {
        resolve: {
          alias: {
            '~': fileURLToPath(new URL('./src/app', import.meta.url)),
            '@': fileURLToPath(new URL('./src/app', import.meta.url)),
            // Nuxt's virtual #imports module only exists in the Nuxt runtime;
            // point it at a mock so composables importing from it stay unit-testable.
            '#imports': fileURLToPath(new URL('./src/app/tests/mocks/nuxt-imports.ts', import.meta.url)),
          },
        },
        test: {
          name: 'unit',
          include: [
            'src/app/components/**/*.{test,spec}.{ts,js}',
            'src/app/composables/**/*.{test,spec}.{ts,js}',
            'src/app/contexts/**/*.{test,spec}.{ts,js}',
            'src/app/errors/**/*.{test,spec}.{ts,js}',
            'src/app/tests/config/**/*.{test,spec}.{ts,js}',
            'src/app/tests/lint/**/*.{test,spec}.{ts,js}',
            'src/app/tests/storybook/**/*.{test,spec}.{ts,js}',
            'src/app/types/**/*.{test,spec}.{ts,js}',
            'src/app/utils/**/*.{test,spec}.{ts,js}',
          ],
          exclude: [
            '**/*.nuxt.{test,spec}.{ts,js}',
          ],
          environment: 'happy-dom',
        },
      },
      await defineVitestProject({
        resolve: {
          alias: {
            '~': fileURLToPath(new URL('./src/app', import.meta.url)),
            '@': fileURLToPath(new URL('./src/app', import.meta.url)),
            '@plausible-analytics/tracker': fileURLToPath(new URL('./node_modules/@plausible-analytics/tracker/plausible.js', import.meta.url)),
            // The pagefind bundle only exists after a full static build; point
            // its runtime url at a controllable mock so useSearchContext is testable.
            '/pagefind/pagefind.js': fileURLToPath(new URL('./src/app/tests/mocks/pagefind.ts', import.meta.url)),
          },
        },
        test: {
          name: 'nuxt',
          // Each .nuxt.test.ts boots its own full Nuxt environment. Under v8
          // coverage the parallel setups starve the CPU and the default 10s
          // hook / 5s test timeouts flake intermittently (see `pnpm check`).
          // Give the Nuxt boot headroom while keeping full parallelism.
          testTimeout: 30_000,
          hookTimeout: 60_000,
          include: [
            'src/app/components/**/*.nuxt.{test,spec}.{ts,js}',
            'src/app/composables/**/*.nuxt.{test,spec}.{ts,js}',
            'src/app/contexts/**/*.nuxt.{test,spec}.{ts,js}',
            'src/app/utils/**/*.nuxt.{test,spec}.{ts,js}',
            'src/app/tests/nuxt/**/*.nuxt.{test,spec}.{ts,js}',
          ],
          setupFiles: [nuxtSetupFile],
          environment: 'nuxt',
          environmentOptions: {
            nuxt: {
              overrides: {
                // The tests must not share build output or the content database
                // with a running dev server: the test build rewrites .nuxt and
                // recreates the content sqlite, which makes the dev server reload
                // and answer content queries with errors or empty pages for a few
                // seconds on every test run (e.g. the editor's test extension).
                buildDir: fileURLToPath(new URL('./node_modules/.cache/vitest-nuxt/.nuxt', import.meta.url)),
                content: {
                  // _localDatabase is the parse-time database (the runtime `database`
                  // option does not cover it) and defaults to .data/content/contents.sqlite.
                  _localDatabase: { type: 'sqlite', filename: 'node_modules/.cache/vitest-nuxt/contents.sqlite' },
                  database: { type: 'sqlite', filename: 'node_modules/.cache/vitest-nuxt/contents.sqlite' },
                },
              },
            },
          },
        },
      }),
    ],
  },
});
