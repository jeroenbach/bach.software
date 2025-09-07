<script setup lang="ts">
import type { AboutPage } from '~/types/AboutPage';

definePageMeta({
  layout: 'gray-short-footer',
});

const { data: page } = await usePagesContext<AboutPage>('about');
const { data: author } = await useAuthorsContext('jeroenbach');
useMetadata('page', page.value);
</script>

<template>
  <div class="flex flex-col px-4 lg:px-6">
    <AppHero
      :intro="page?.greeting"
      :title="`${author?.fullName}.`"
      :subTitle="`${author?.role}.`"
      :imgSrc="author?.imageUrl"
      :imgAlt="author?.fullName"
    >
      <ContentRenderer :value="page" />
    </AppHero>
    <CurriculumVitaeTable :curriculumVitae="page?.curriculumVitae" />
  </div>
</template>
