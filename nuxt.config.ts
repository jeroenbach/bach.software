// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/storybook",
    "@nuxt/content",
    "@nuxt/image",
  ],
  css: ["animate.css"],
  app: {
    head: {
      // Used in Sofia Vera
      viewport:
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
    },
  },
  image: {
    dir: "assets/images",
    quality: 80,
    format: ["avif", "webp"],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
      "2xl": 1536,
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
});
