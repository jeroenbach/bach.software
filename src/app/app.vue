<script lang="ts" setup>
import appConfig from "~/appConfig.json";
import type { Config } from "~/types/Config";

const config = useState<Config>("config", () => appConfig);
const { notifications } = useNotification();
const { t, locale } = useI18n();

const { data: navigation } = await useContentNavigationContext();

useSeoMeta({
  titleTemplate: (titleChunk) => {
    return titleChunk
      ? t("_metadata.titleTemplate", { titleChunk })
      : t("_metadata.titleTemplate_empty");
  },
});
useHead({
  htmlAttrs: {
    lang: locale,
  },
});
useMetadata({
  baseUrl: config.value.baseUrl,
  title: t("_metadata.title"),
  description: t("_metadata.description"),
  imageUrl: "JEROEN-4238-SQUARE.jpeg",
  imageAlt: t("_metadata.title"),
  url: "/",
  structuredData: createWebsiteMetadataContext({
    name: t("_metadata.title"),
    url: config.value.baseUrl,
  }),
});
</script>
<template>
  <NotificationContainer />
  <NotificationMessage
    v-for="notification in notifications"
    v-bind="notification"
  />
  <NuxtLoadingIndicator />
  <NuxtLayout :navigation="navigation">
    <NuxtPage />
  </NuxtLayout>
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
