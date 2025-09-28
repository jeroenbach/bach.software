<script setup lang="ts">
import type { ColorMode } from '~/components/ColorModeSwitcher.vue';

interface Props {
  border?: boolean
}

const { border } = defineProps<Props>();
const { notifications } = useNotificationStore();
const { data: navigation } = await useContentNavigationContext();

const colorMode = useColorMode();
function updateColorMode(value: ColorMode) {
  colorMode.preference = value;
}
</script>

<template>
  <AppHeader
    :navigation="navigation"
    :notifications="notifications"
    :border="border"
    :colorMode="colorMode.preference as ColorMode"
    @update:colorMode="updateColorMode"
  />
</template>
