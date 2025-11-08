<script setup lang="ts">
import type { NuxtError } from '#app';
import AppComponent from '~/app.vue';

const { error } = defineProps<{
  error: NuxtError
}>();

const { t } = useI18n();
const is404 = computed(() => error.statusCode === 404);
</script>

<template>
  <AppComponent>
    <div class="flex items-center justify-center">
      <App404 v-if="is404" />
      <AppError
        v-else
        :title="String(error.statusCode)"
        class="min-h-[60vh]"
        :subTitle="t('error.errorOccurred')"
        :description="error.message || t('error.somethingWentWrong')"
        :linkText="t('error.goBackHome')"
        linkLocation="/"
      />
    </div>
  </AppComponent>
</template>
