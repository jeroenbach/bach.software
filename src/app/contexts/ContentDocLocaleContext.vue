<script lang="ts" setup>
const { locale } = useI18n();

interface Props {
  path: string;
}

const { path } = defineProps<Props>();
</script>
<template>
  <ContentQuery :path="path" :where="{ _locale: locale }" find="one">
    <template #default="{ data }">
      <slot :data="data">
        <ContentRenderer v-if="data" :value="data" />
        <p v-else>{{ $t("Loading...") }}</p>
      </slot>
    </template>
  </ContentQuery>
</template>
