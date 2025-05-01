<script lang="ts" setup>
const { locale } = useI18n();

interface Props {
  path?: string;
}

const { path } = defineProps<Props>();
</script>
<template>
  <ContentQuery
    :path="path"
    :where="{ _locale: locale }"
    find="one"
    v-slot="{ data }"
  >
    <ContentRenderer :value="data" />
  </ContentQuery>
</template>
