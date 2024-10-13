<script lang="ts" setup>
import NotificationContainer from "~/components/NotificationContainer.vue";
import NotificationMessage from "~/components/NotificationMessage.vue";
import { useNotification } from "~/composables/useNotification";
import appConfig from "~/appConfig.json";
import type { Config } from "./types/Config";

useState<Config>("config", () => appConfig);
const { notifications } = useNotification();
const { t } = useI18n();

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
.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
