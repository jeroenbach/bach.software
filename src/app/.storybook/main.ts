import type { StorybookConfig } from "@storybook/vue3-vite";
import { mergeConfig } from "vite";

import viteConfig from "./vite.config";

const config: StorybookConfig = {
  stories: ["../components/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-a11y"],
  framework: {
    name: "@storybook/vue3-vite",
    options: {},
  },
  staticDirs: ["../public", "../assets/images"],
  docs: {},
  viteFinal: async (config, { configType }) => {
    const mergedConfig = mergeConfig(viteConfig, config);

    if (configType === "DEVELOPMENT") {
      // Your development configuration goes here
    }
    if (configType === "PRODUCTION") {
      // Your production configuration goes here.
      mergedConfig.base = "/_storybook/";
    }

    return mergedConfig;
  },
};
export default config;
