<script lang="ts" setup>
import type { Config } from '~/types/Config';
// Note: this file cannot contain any async code at the top level,
// the static site generation didn't work when refreshing a page.
import appConfig from '~/appConfig.json';

// Set the app config
useState<Config>('config', () => appConfig);
const { t, locale } = useI18n();

useSeoMeta({
  titleTemplate: (titleChunk) => {
    return titleChunk
      ? t('_metadata.titleTemplate', { titleChunk })
      : t('_metadata.titleTemplate_empty');
  },
});
useHead({
  htmlAttrs: {
    lang: locale,
    class: 'overflow-x-hidden',
  },
});
const route = useRoute();
const background = computed<'gray' | 'white'>(() => {
  switch (route.meta.layout) {
    case 'gray':
    case 'gray-short-footer':
      return 'gray';
    default:
      return 'white';
  }
});
const backgroundFooter = computed<'gray' | 'white'>(() => {
  switch (route.meta.layout) {
    case 'gray-short-footer':
    case 'white-footer':
      return 'white';
    default:
      return 'gray';
  }
});
const shortFooter = computed(() => route.meta.layout === 'gray-short-footer');
</script>

<template>
  <AppBackground :background="background" class="flex min-h-screen flex-col">
    <NuxtLoadingIndicator />
    <AppHeaderContext :border="background === 'gray'" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <AppFooterContext
      :short="shortFooter"
      :backgroundColor="backgroundFooter"
    />
  </AppBackground>
</template>

<style lang="scss" scoped>
.page-enter-active,
.page-leave-active {
  transition: all 50ms;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>

<style lang="scss" global>
.dark {
  color-scheme: dark;
}
</style>
