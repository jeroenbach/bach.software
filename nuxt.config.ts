// https://nuxt.com/docs/api/configuration/nuxt-config
import process from 'node:process';
import Aura from '@primevue/themes/aura';
import tailwindcss from '@tailwindcss/vite';

import { defaultLocale, locales } from './locales.config';
import { screens } from './src/app/utils/screen';

export default defineNuxtConfig({
  $development: {
    app: {
      head: {
        script: [{ innerHTML: `console.log("development environment");` }],
      },
    },
  },
  imports: {
    dirs: ['./composables', './utils', './contexts', './types'],
  },
  srcDir: 'src/app',
  dir: {
    public: 'src/app/public',
  },
  serverDir: 'src/app/server',
  compatibilityDate: '2025-10-18',
  devtools: { enabled: true },
  vite: {
    plugins: [tailwindcss()],
  },
  modules: [
    '@nuxt/content',
    '@nuxtjs/i18n',
    '@nuxt/image',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    '@nuxt/test-utils/module',
    'dayjs-nuxt',
    '@primevue/nuxt-module',
    '@nuxtjs/plausible',
  ],
  components: [{ path: '~/contexts', pathPrefix: false }, '~/components'],
  primevue: {
    autoImport: false,
    options: {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: 'html.dark',
        },
      },
    },
  },
  colorMode: {
    classSuffix: '',
  },
  css: ['~/assets/css/tailwind.css', '~/assets/css/main.scss'],
  plausible: {
    apiHost: 'https://plausible.bach.software',
    // Tracking always on
    ignoredHostnames: [],
  },
  app: {
    head: {
      viewport:
        'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no', // Used in Sofia Vera
      link: [
        { rel: 'icon', sizes: '192x192', href: '/ico/192.png' },
        { rel: 'icon', sizes: '128x128', href: '/ico/128.png' },
        { rel: 'icon', type: 'image/png', href: '/ico/favicon.png' },
        {
          rel: 'icon',
          sizes: 'any',
          type: 'image/svg+xml',
          href: '/ico/favicon.svg',
        },
        { rel: 'apple-touch-icon', sizes: '76x76', href: '/ico/76.png' },
        { rel: 'apple-touch-icon', sizes: '120x120', href: '/ico/120.png' },
        { rel: 'apple-touch-icon', sizes: '152x152', href: '/ico/152.png' },
        { rel: 'apple-touch-icon', sizes: '167x167', href: '/ico/167.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/ico/180.png' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'page', mode: 'out-in' },
  },
  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: 'github-light',
            dark: 'github-dark',
          },
          langs: [
            'typescript',
            'javascript',
            'json',
            'csharp',
            'vue',
            'html',
            'css',
            'terraform',
            'bash',
            'sh',
            'hcl',
          ],
        },
        remarkPlugins: { 'remark-reading-time': {} },
      },
    },
  },
  image: {
    dir: 'assets/images',
    quality: 80,
    format: ['avif', 'webp', 'jpeg', 'jpg'],
    screens,
  },
  i18n: {
    baseUrl: process.env.NUXT_PUBLIC_BASE_URL || 'https://bach.software',
    langDir: '../src/app/locales',
    locales,
    strategy: 'prefix_except_default',
    defaultLocale,
  },
  dayjs: {
    locales: locales.map(locale => locale.code),
    plugins: ['relativeTime', 'utc', 'timezone'],
    defaultLocale,
    defaultTimezone: 'Europe/Amsterdam',
  },
  runtimeConfig: {
    public: {
      baseUrl: 'https://bach.software', // can be overridden by NUXT_PUBLIC_BASE_URL environment variable
      apiBase: '', // can be overridden by NUXT_PUBLIC_API_BASE environment variable
      plausibleDomain: '', // can be overridden by NUXT_PUBLIC_PLAUSIBLE_DOMAIN environment variable
    },
  },
  nitro: {
    prerender: {
      routes: ['/sitemap.xml', '/api/content-urls'],
    },
  },
  routeRules: {
    '/pages/portfolio': { redirect: { to: '/content/20-portfolio', statusCode: 301 } },
    '/pages/about': { redirect: { to: '/content/30-about', statusCode: 301 } },
  },
});
