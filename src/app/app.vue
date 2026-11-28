<script lang="ts" setup>
// Note: this file cannot contain any async code at the top level,
// the static site generation didn't work when refreshing a page.

const { t } = useI18n();

useSeoMeta({
  titleTemplate: (titleChunk) => {
    return titleChunk
      ? t('metadata.titleTemplate', { titleChunk })
      : t('metadata.titleTemplateEmpty');
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

const { messages, close } = useMessageStore();
</script>

<template>
  <MessageBarContext>
    <AppBackground :background="background" class="flex min-h-screen flex-col">
      <NuxtLoadingIndicator />
      <AppHeaderContext :border="background === 'gray'" />
      <MessageBarOutlet />
      <!-- Store-driven bars: whatever is reported through the message store renders
           here and teleports to the active outlet by itself. -->
      <MessageBar
        v-for="{ messageId, ...message } in messages"
        :key="messageId"
        v-bind="message"
        :baseDataTestid="`message-bar-${messageId}`"
        @close="close(messageId)"
      />
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
  </MessageBarContext>
</template>

<style lang="scss" global>
.dark {
  color-scheme: dark;
}
</style>
