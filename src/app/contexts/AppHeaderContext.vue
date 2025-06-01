<script setup lang="ts">
interface Props {
  border?: boolean;
}

const { border } = defineProps<Props>();
const { notifications } = useNotificationStore();
const { data: navigation } = await useContentNavigationContext();
</script>
<template>
  <AppHeader
    :navigation="navigation"
    :notifications="notifications"
    :border="border"
  />
</template>
