<script lang="ts" setup>
import NotificationContainer from "~/components/NotificationContainer.vue";
import Notification from "~/components/Notification.vue";
import { useNotification } from "~/composables/useNotification";
import appConfig from "~/appConfig.json";
import type { Config } from "./types/Config";

useState<Config>("config", () => appConfig);
const { notifications } = useNotification();

useHeadSafe({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Bach.Software` : "Bach.Software";
  },
  meta: [
    {
      name: "description",
      content: "Full stack software development services",
    },
  ],
});
useSeoMeta({
  title: "My Amazing Site",
  ogTitle: "My Amazing Site",
  description: "This is my amazing site, let me tell you all about it.",
  ogDescription: "This is my amazing site, let me tell you all about it.",
  ogImage: "https://example.com/image.png",
  twitterCard: "summary_large_image",
});
</script>
<template>
  <NotificationContainer />
  <Notification v-for="notification in notifications" v-bind="notification" />
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
