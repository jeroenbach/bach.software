<script setup lang="ts">
import type { Props } from '~/components/AppFooter.vue';

defineProps<Props>();
const { data: about } = await usePagesContext('about');
const { data: footer } = await usePagesContext('_footer');
const { data: author } = await useAuthorsContext('jeroenbach');
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
      <ContentRenderer :value="about" :excerpt="true" />
    </template>
    <template #footer>
      <ContentRenderer :value="footer" />
    </template>
  </AppFooter>
</template>
