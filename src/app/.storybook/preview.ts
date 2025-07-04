// types/importMeta.d.ts
/// <reference types="vite/client" />
import { setup, type Preview } from "@storybook/vue3-vite";
import { createI18n } from "vue-i18n";

import en from "../locales/en.json";
import AppBackground from "../components/AppBackground.vue";

import NuxtImg from "./mocks/NuxtImg.vue";
import NuxtPicture from "./mocks/NuxtPicture.vue";
import ContentRenderer from "./mocks/ContentRenderer.vue";
import "./input.css";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en,
  },
});

const preview: Preview = {
  decorators: [
    /**
     * Add the story twice, once for light mode and once for dark mode.
     * This decorator wraps the story in a flex container and applies the AppBackground component.
     */
    (story, _) => {
      return {
        components: { story, AppBackground },
        template: `<div class="flex flex-col gap-y-4">
          <div class="flex flex-col flex-1">
            <AppBackground class="flex-1 p-4"><story /></AppBackground>
          </div>
          <div class="flex flex-col flex-1 dark">
            <AppBackground class="flex-1 p-4"><story /></AppBackground>
          </div>
        </div>`,
      };
    },
  ],
};

export default preview;

setup((app) => {
  app.use(i18n);

  // Register some mocks for Nuxt components
  app.component("NuxtLinkLocale", {
    props: ["to"],
    template: `<a :href='to'><slot /></a>`,
  });
  app.component("NuxtImg", NuxtImg);
  app.component("NuxtPicture", NuxtPicture);
  app.component("ContentRenderer", ContentRenderer);
  app.component("ClientOnly", {
    template: `<slot />`,
  });

  registerAppComponents(app);
});

/**
 * Automatically imports and registers all components in the `src/components` directory.
 * This function is used to ensure that all components are available globally in the Storybook environment.
 * @param app Vue application instance
 */
const registerAppComponents = (app: import("vue").App) => {
  // Define the type for the modules returned by import.meta.glob
  type ComponentModule = {
    default: import("vue").Component & { name?: string };
  };

  const components = import.meta.glob<ComponentModule>("../components/*.vue", {
    eager: true,
  });

  Object.entries(components).forEach(([path, module]) => {
    const component = module.default;
    const name =
      component.name ||
      path
        .split("/")
        .pop()
        ?.replace(/\.client\.vue$|\.vue$/, "");
    if (name) {
      app.component(name, component);
    }
  });
};
