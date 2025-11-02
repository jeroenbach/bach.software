import type { Preview } from '@storybook/vue3-vite';
// types/importMeta.d.ts
/// <reference types="vite/client" />
import { setup } from '@storybook/vue3-vite';
import { createI18n } from 'vue-i18n';

import AppBackground from '../components/AppBackground.vue';
import en from '../locales/en.json';

import ContentRenderer from './mocks/ContentRenderer.vue';
import NuxtImg from './mocks/NuxtImg.vue';
import NuxtImgIntegrated from './mocks/NuxtImgIntegrated.vue';
import NuxtPicture from './mocks/NuxtPicture.vue';
import NuxtPictureIntegrated from './mocks/NuxtPictureIntegrated.vue';
import '../assets/css/tailwind.css';
import '../assets/css/main.scss';

const ComponentWithSlot = {
  template: `<slot />`,
};

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en,
  },
});

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      dynamicTitle: true,
      description: 'Global theme for components',
      toolbar: {
        icon: 'circlehollow',
        items: ['light', 'dark', 'both'],
      },
    },
  },
  initialGlobals: {
    theme: 'both',
  },
  decorators: [
    /**
     * Add the story twice, once for light mode and once for dark mode.
     * This decorator wraps the story in a flex container and applies the AppBackground component.
     */
    (story, context) => {
      const LOCAL_STORAGE_KEY = 'storybook-theme';
      const storedTheme = localStorage.getItem(LOCAL_STORAGE_KEY);
      const currentTheme = context.globals.theme || storedTheme || 'both';
      localStorage.setItem(LOCAL_STORAGE_KEY, currentTheme);

      const decorator = (theme: string) => ({
        components: { story, AppBackground },
        setup() {
          return { theme };
        },
        template: `<div class="flex flex-col gap-y-4" data-testid="component-story-wrapper">
          <div v-if="theme !== 'dark'" class="flex flex-col flex-1">
            <AppBackground class="flex-1 p-4"><story /></AppBackground>
          </div>
          <div v-if="theme !== 'light'" class="flex flex-col flex-1 dark">
            <AppBackground class="flex-1 p-4"><story /></AppBackground>
          </div>
        </div>`,
      });

      switch (currentTheme) {
        case 'light':
          return decorator('light');
        case 'dark':
          return decorator('dark');
        case 'both':
        default:
          return decorator('both');
      }
    },
  ],
};

export default preview;

setup((app) => {
  app.use(i18n);

  // Register some mocks for Nuxt components
  app.component('NuxtLinkLocale', {
    props: ['to'],
    template: `<a :href='to'><slot /></a>`,
  });
  app.component('ContentRenderer', ContentRenderer);
  app.component('ClientOnly', ComponentWithSlot);
  app.component('ContentQuery', ComponentWithSlot);

  if (
    import.meta.env.MODE === 'development'
      || import.meta.env.VITE_STANDALONE
  ) {
    app.component('NuxtImg', NuxtImg);
    app.component('NuxtPicture', NuxtPicture);
  }
  else {
    app.component('NuxtImg', NuxtImgIntegrated);
    app.component('NuxtPicture', NuxtPictureIntegrated);
  }

  registerAppComponents(app);
});

/**
 * Automatically imports and registers all components in the `src/components` directory.
 * This function is used to ensure that all components are available globally in the Storybook environment.
 * @param app Vue application instance
 */
function registerAppComponents(app: import('vue').App) {
  // Define the type for the modules returned by import.meta.glob
  interface ComponentModule {
    default: import('vue').Component & { name?: string }
  }

  const components = import.meta.glob<ComponentModule>('../components/*.vue', {
    eager: true,
  });

  Object.entries(components).forEach(([path, module]) => {
    const component = module.default;
    const name
      = component.name
        || path
          .split('/')
          .pop()
          ?.replace(/\.client\.vue$|\.vue$/, '');
    if (name) {
      app.component(name, component);
    }
  });
}
