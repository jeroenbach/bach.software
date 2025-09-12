<script lang="ts" setup>
const { slug } = useRoute().params as { slug: string };

const { data: page } = await usePagesContext(slug);

useMetadata('page', page.value);
</script>

<template>
  <PageContent>
    <AppProse>
      <ContentRenderer v-if="page" :value="page" />
    </AppProse>
  </PageContent>
</template>
