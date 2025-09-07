<script setup lang="ts">
import type { PortfolioPage } from '~/types/PortfolioPage';

definePageMeta({
  layout: 'white-footer',
});
const { data: page } = await usePagesContext<PortfolioPage>('portfolio');

useMetadata('page', page.value);
</script>

<template>
  <div>
    <PageContent class="pb-8 lg:pb-14">
      <AppProse>
        <ContentRenderer :value="page" />
      </AppProse>
    </PageContent>
    <PortfolioGrid
      :portfolio="page?.portfolio"
      class="-mb-12 pb-12 lg:-mb-20 lg:pb-20"
    />
  </div>
</template>
