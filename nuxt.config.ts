// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from "@primevue/themes/aura";

import { screens } from "./src/app/utils/screen";
export default defineNuxtConfig({
  $development: {
    app: {
      head: {
        script: [{ innerHTML: `console.log("development environment");` }],
      },
    },
  },
  imports: {
    dirs: ["./composables", "./utils", "./contexts", "./types"],
  },
  srcDir: "src/app",
  compatibilityDate: "2024-11-03",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "nuxt-content-twoslash", // this needs to be before `@nuxt/content`
    "@nuxt/content",
    "@nuxt/image",
    "@nuxtjs/color-mode",
    "@pinia/nuxt",
    "@nuxtjs/i18n",
    "@nuxt/test-utils/module",
    "dayjs-nuxt",
    "@primevue/nuxt-module",
    "@nuxtjs/plausible",
    "@nuxt/eslint",
  ],
  components: [{ path: "~/contexts", pathPrefix: false }, "~/components"],
  primevue: {
    autoImport: false,
    options: {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: "html.dark",
        },
      },
    },
  },
  colorMode: {
    classSuffix: "",
  },
  css: ["~/assets/css/main.scss"],
  plausible: {
    apiHost: "https://plausible.bach.software",
    // Tracking always on
    ignoredHostnames: [],
  },
  app: {
    head: {
      viewport:
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no", // Used in Sofia Vera
      link: [
        { rel: "icon", sizes: "192x192", href: "/ico/192.png" },
        { rel: "icon", sizes: "128x128", href: "/ico/128.png" },
        { rel: "icon", type: "image/png", href: "/ico/favicon.png" },
        {
          rel: "icon",
          sizes: "any",
          type: "image/svg+xml",
          href: "/ico/favicon.svg",
        },
        { rel: "apple-touch-icon", sizes: "76x76", href: "/ico/76.png" },
        { rel: "apple-touch-icon", sizes: "120x120", href: "/ico/120.png" },
        { rel: "apple-touch-icon", sizes: "152x152", href: "/ico/152.png" },
        { rel: "apple-touch-icon", sizes: "167x167", href: "/ico/167.png" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/ico/180.png" },
      ],
    },
    pageTransition: { name: "page", mode: "out-in" },
    layoutTransition: { name: "page", mode: "out-in" },
  },
  content: {
    highlight: {
      theme: {
        // Default theme (same as single string)
        default: "github-light",
        // Theme used if `html.dark`
        dark: "github-dark",
      },
    },
    markdown: {
      anchorLinks: true,
      remarkPlugins: ["remark-reading-time"],
    },
    experimental: {
      search: {},
    },
    api: {
      baseURL: "/_content",
    },
    locales: ["en"],
    defaultLocale: "en",
  },
  twoslash: {
    enableInDev: true,
  },
  image: {
    dir: "assets/images",
    quality: 80,
    format: ["avif", "webp", "jpeg", "jpg"],
    screens: {
      ...screens,
      "2xl": screens.xxl,
    },
  },
  i18n: {
    langDir: "../src/app/locales",
    locales: [{ code: "en", language: "en-US", file: "en.json" }],
    defaultLocale: "en",
    strategy: "prefix_except_default",
    lazy: true,
    bundle: {
      optimizeTranslationDirective: false,
    },
  },
  dayjs: {
    locales: ["en"],
    plugins: ["relativeTime", "utc", "timezone"],
    defaultLocale: "en",
    defaultTimezone: "Europe/Amsterdam",
  },
  runtimeConfig: {
    public: {
      apiBase: "", // can be overridden by NUXT_PUBLIC_API_BASE environment variable
      plausibleDomain: "", // can be overridden by NUXT_PUBLIC_PLAUSIBLE_DOMAIN environment variable
    },
  },
  nitro: {
    prerender: {
      routes: ["/sitemap.xml"],
    },
  },
});
