<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <AppError
    title="404"
    class="min-h-[60vh]"
    :subTitle="t('error.pageNotFound')"
    :description="t('error.pageNotFoundDescription')"
    :linkText="t('error.goBackHome')"
    linkLocation="/"
  />
</template>
