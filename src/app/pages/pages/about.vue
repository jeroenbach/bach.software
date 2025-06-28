<script setup lang="ts">
import { type AboutPage } from "~/types/AboutPage";

definePageMeta({
  layout: "gray-short",
});

const { data: page } = await usePagesContext<AboutPage>("about");
const { data: author } = await useAuthorsContext("jeroenbach");
</script>
<template>
  <div class="flex flex-col px-4 lg:px-6">
    <AppHero
      :intro="$t('about.greeting')"
      :title="`${author?.fullName}.`"
      :subTitle="`${author?.role}.`"
      :imgSrc="author?.imageUrl"
      :imgAlt="author?.fullName"
    >
      <ContentRenderer :value="page" />
    </AppHero>
    <PortfolioTable :projects="page?.projects" />
  </div>
</template>
