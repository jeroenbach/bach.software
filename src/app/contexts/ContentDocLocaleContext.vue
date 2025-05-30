<script lang="ts" setup>
const { locale } = useI18n();

interface Props {
  path: string;
}

const { path } = defineProps<Props>();
</script>
<template>
  <ContentQuery
    v-slot="{ data }"
    :path="path"
    :where="{ _locale: locale }"
    find="one"
  >
    <ContentRenderer :value="data" />
  </ContentQuery>
</template>
