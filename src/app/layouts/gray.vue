<script setup lang="ts">
import DefaultLayout, { type Props } from "@/layouts/default.vue";

const { navigation, notifications } = defineProps<Props>();
</script>
<template>
  <DefaultLayout
    background="gray"
    :navigation="navigation"
    :notifications="notifications"
  >
    <slot />
  </DefaultLayout>
</template>
