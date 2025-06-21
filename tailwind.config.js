/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/app/**/*.{vue,js,ts}",
    "./src/app/.storybook/**/*.{js,ts,vue}",
  ],
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            "--tw-prose-pre-code": theme("colors.gray[400]"),
            "--tw-prose-pre-bg": theme("colors.stone[50]"),
            "--tw-prose-invert-pre-bg": theme("colors.slate[700]"),
          },
        },
      }),
      fontSize: {
        "xs-em": "0.75em",
        "sm-em": "0.875em",
      },
      aspectRatio: {
        "16/9": "16 / 9",
        "2/1": "2 / 1",
        "1/2": "1 / 2",
        "1/1": "1 / 1",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("tailwindcss-primeui")],
};
