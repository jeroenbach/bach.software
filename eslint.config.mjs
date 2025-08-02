// @ts-check
import prettier from "eslint-config-prettier";

import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(prettier, {
  rules: {
    "vue/attribute-hyphenation": ["error", "never"],
    "vue/v-on-event-hyphenation": ["error", "never"],
    "vue/multi-word-component-names": [
      "error",
      {
        ignores: [
          "index",
          "default",
          "app",
          "home",
          "about",
          "portfolio",
          "plausible",
          "contact",
          "[id][[slug]]",
          "[slug]",
          "gray",
          "Parent",
          "Child",
          "Example",
        ],
      },
    ],
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "import/order": [
      "warn",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "always",
      },
    ],
  },
});
