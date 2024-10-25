<script lang="ts" setup>
import NotificationContainer from "~/components/NotificationContainer.vue";
import NotificationMessage from "~/components/NotificationMessage.vue";
import { useNotification } from "~/composables/useNotification";
import appConfig from "~/appConfig.json";
import type { Config } from "./types/Config";

useState<Config>("config", () => appConfig);
const { notifications } = useNotification();
const { t, locale } = useI18n();

useSeoMeta({
  title: t("_metadata.title"),
  titleTemplate: (titleChunk) => {
    return titleChunk
      ? t("_metadata.titleTemplate", { titleChunk })
      : t("_metadata.titleTemplate_empty");
  },
  ogTitle: t("_metadata.title"),
  description: t("_metadata.description"),
  ogDescription: t("_metadata.description"),
  ogImage: "https://bach.software/JEROEN-4238-SQUARE.jpeg",
  twitterCard: "summary_large_image",
});
useHead({
  htmlAttrs: {
    lang: locale,
  },
});
</script>
<template>
  <NotificationContainer />
  <NotificationMessage
    v-for="notification in notifications"
    v-bind="notification"
  />
  <NuxtLoadingIndicator />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
<style lang="scss" scoped>
.page-enter-active,
.page-leave-active {
  transition: all 0.1s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
