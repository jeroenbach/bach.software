import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import autoImport from 'unplugin-auto-import/vite';
import { defineConfig } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';

import postcss from './postcss.config.js';

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    autoImport({
      // targets to transform
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/, // .vue
        /\.vue\.[tj]sx?\?vue/, // .vue (vue-loader with experimentalInlineMatchResource enabled)
        /\.md$/, // .md
      ],
      imports: ['vue'],
      dirs: ['./utils', './composables'],
      dts: false,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('../', import.meta.url)),
      '~': fileURLToPath(new URL('../', import.meta.url)),
      '#imports': fileURLToPath(new URL('./mocks/imports.ts', import.meta.url)),
      '#dayjs': fileURLToPath(new URL('./mocks/dayjs.ts', import.meta.url)),
    },
  },
  css: {
    postcss,
  },
});
