import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    include: [
      "**/app/components/**/*.{test,spec}.{ts,js}",
      "**/app/composables/**/*.{test,spec}.{ts,js}",
      "**/app/contexts/**/*.{test,spec}.{ts,js}",
      "**/app/utils/**/*.{test,spec}.{ts,js}",
    ],
  },
});
