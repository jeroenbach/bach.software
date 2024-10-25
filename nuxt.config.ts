// https://nuxt.com/docs/api/configuration/nuxt-config
import { screens } from "./utils/screen";
import Aura from "@primevue/themes/aura";
export default defineNuxtConfig({
  // ssr: false,
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/storybook",
    "nuxt-content-twoslash", // this needs to be before `@nuxt/content`
    "@nuxt/content",
    "@nuxt/image",
    "@nuxtjs/color-mode",
    "@pinia/nuxt",
    "@nuxtjs/i18n",
    "@nuxt/test-utils/module",
    "dayjs-nuxt",
    "@primevue/nuxt-module",
  ],
  components: [
    // ~/contexts/account/UserDeleteDialog.vue => <UserDeleteDialog />
    { path: "~/contexts", pathPrefix: false },
    "~/components",
  ],
  primevue: {
    autoImport: false,
    options: {
      theme: {
        preset: Aura,
        // options: {
        //   cssLayer: {
        //     name: "primevue",
        //     order: "tailwind-base, primevue, tailwind-utilities",
        //   },
        // },
      },
    },
  },
  colorMode: {
    classSuffix: "",
  },
  css: ["~/assets/css/main.scss", "animate.css"],
  app: {
    head: {
      // Used in Sofia Vera
      viewport:
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
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
    experimental: {
      search: {},
    },
  },
  twoslash: {
    enableInDev: true,
  },
  image: {
    dir: "assets/images",
    quality: 80,
    format: ["avif", "webp"],
    screens: {
      ...screens,
      "2xl": screens.xxl,
    },
  },
  // experimental: {
  //   viewTransition: true,
  // },
  routeRules: {
    // Generated at build time for SEO purpose
    "/": { prerender: true },
    // Cached for 1 hour
    "/api/*": { cache: { maxAge: 60 * 60 } },
    // Redirection to avoid 404
    "/old-page": {
      redirect: { to: "/new-page", statusCode: 302 },
    },
    // ...
  },
  nitro: {
    prerender: {
      routes: ["/sitemap.xml"],
    },
  },
  i18n: {
    locales: [{ code: "en", language: "en-US", file: "./locales/en.json" }],
    defaultLocale: "en",
    strategy: "prefix_except_default",
  },
  dayjs: {
    locales: ["en"],
    plugins: ["relativeTime", "utc", "timezone"],
    defaultLocale: "en",
    defaultTimezone: "Europe/Amsterdam",
  },
});
