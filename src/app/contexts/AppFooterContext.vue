<script setup lang="ts">
import type { Props } from '~/components/AppFooter.vue';

defineProps<Props>();
const { locale } = useI18n();

const { data: footer, refresh: refreshFooter } = await usePagesContext(2); // footer page has contentId 2
const { data: footerAbout, refresh: refreshFooterAbout } = await usePagesContext(3); // footer page has contentId 3
const { data: author, refresh: refreshAuthor } = await useAuthorsContext('jeroenbach');

// Watch locale changes and refresh all footer data
watch(locale, async () => {
  await Promise.all([
    refreshFooter(),
    refreshFooterAbout(),
    refreshAuthor(),
  ]);
});

export type { Props };
</script>

<template>
  <AppFooter
    v-bind="$props"
    :title="footer?.title"
    :linkedInUrl="author?.linkedIn"
    :githubUrl="author?.github"
    :imgSrc="author?.imageUrl"
    :imgAlt="author?.fullName"
  >
    <template #about>
      <ContentRenderer v-if="footerAbout" :value="footerAbout" />
    </template>
    <template #footer>
      <ContentRenderer v-if="footer" :value="footer" />
    </template>
  </AppFooter>
</template>
