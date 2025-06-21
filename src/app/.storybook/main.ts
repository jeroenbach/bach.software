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
  viteFinal: async (config) => {
    const mergedConfig = mergeConfig(viteConfig, config);
    return mergedConfig;
  },
};
export default config;
