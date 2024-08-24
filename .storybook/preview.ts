import type { Preview } from "@storybook/vue3";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: "grey",
      values: [
        {
          name: "grey",
          value: "#f5f8fa",
        },
        {
          name: "white",
          value: "#ffffff",
        },
      ],
    },
  },
};

export default preview;
