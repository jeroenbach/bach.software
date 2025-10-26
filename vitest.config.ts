import { defineVitestProject } from '@nuxt/test-utils/config';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: [
            'src/app/components/**/*.{test,spec}.{ts,js}',
            'src/app/composables/**/*.{test,spec}.{ts,js}',
            'src/app/contexts/**/*.{test,spec}.{ts,js}',
            'src/app/utils/**/*.{test,spec}.{ts,js}',
          ],
          exclude: [
            '**/*.nuxt.{test,spec}.{ts,js}',
          ],
          environment: 'node',
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: [
            'src/app/components/**/*.nuxt.{test,spec}.{ts,js}',
            'src/app/composables/**/*.nuxt.{test,spec}.{ts,js}',
            'src/app/contexts/**/*.nuxt.{test,spec}.{ts,js}',
            'src/app/utils/**/*.nuxt.{test,spec}.{ts,js}',
            'src/app/tests/nuxt/**/*.nuxt.{test,spec}.{ts,js}',
          ],
          environment: 'nuxt',
        },
      }),
    ],
  },
});
