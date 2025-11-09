<script lang="ts" setup>
// Note: this file cannot contain any async code at the top level,
// the static site generation didn't work when refreshing a page.

const { t } = useI18n();

useSeoMeta({
  titleTemplate: (titleChunk) => {
    return titleChunk
      ? t('_metadata.titleTemplate', { titleChunk })
      : t('_metadata.titleTemplate_empty');
  },
});
useHead({
  htmlAttrs: {
    class: 'overflow-x-hidden',
  },
});

const route = useRoute();
const appConfig = useAppConfig();
const pageLayout = computed(() => appConfig.showNoBottomPadding?.includes(Number(route.params.id)) ? 'no-bottom-padding' : 'default');

const background = computed<'gray' | 'white'>(() => {
  if (appConfig.showGrayBackground?.includes(Number(route.params.id))) {
    return 'gray';
  }
  return 'white';
});
const backgroundFooter = computed<'gray' | 'white'>(() => {
  if (appConfig.showWhiteFooter?.includes(Number(route.params.id))) {
    return 'white';
  }
  return 'gray';
});
const shortFooter = computed(() => appConfig.showShortFooter?.includes(Number(route.params.id)));
</script>

<template>
  <AppBackground :background="background" class="flex min-h-screen flex-col">
    <NuxtLoadingIndicator />
    <AppHeaderContext :border="background === 'gray'" />
    <NuxtLayout :name="pageLayout">
      <slot>
        <NuxtPage />
      </slot>
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
