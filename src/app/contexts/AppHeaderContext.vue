<script setup lang="ts">
import type { ColorMode } from '~/components/ColorModeSwitcher.vue';
import type { LocaleStructure } from '~/locales.config';
import type { NavigationItem } from '~/types/NavigationItem';
import { defaultLocale } from '~/locales.config';

interface Props {
  border?: boolean
}

const { border } = defineProps<Props>();
const { notifications, add } = useNotificationStore();
const { locale, setLocale, t } = useI18n();

const { data: contentNavigation, refresh: refreshNavigation } = await useContentNavigationContext();

const navigation = computed<NavigationItem[]>(() => {
  const items = contentNavigation.value ?? [];
  return [
    ...items,
    {
      label: t('OpenSource.VueDynamicForm'),
      to: 'https://vue-dynamic-form.bach.software/',
      external: true,
    },
  ];
});

// Watch locale changes and refresh navigation
watch(locale, async () => {
  await refreshNavigation();
});

const colorMode = useColorMode();
function updateColorMode(value: ColorMode) {
  colorMode.preference = value;
}
async function setLocaleAndShowNotification(locale: LocaleStructure['code']) {
  await setLocale(locale);

  if (locale !== defaultLocale) {
    add('info', t('notifications.info.languageAiTranslated'), undefined, { closeIn: 4000 });
  }
}
</script>

<template>
  <AppHeader
    :navigation="navigation"
    :notifications="notifications"
    :border="border"
    :colorMode="colorMode.preference as ColorMode"
    :language="locale"
    @update:colorMode="updateColorMode"
    @update:language="setLocaleAndShowNotification"
  />
</template>
