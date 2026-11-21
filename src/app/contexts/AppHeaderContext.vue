<script setup lang="ts">
import type { ColorMode } from '~/components/ColorModeSwitcher.vue';
import type { LocaleStructure } from '~/locales.config';
import type { NavigationItem } from '~/types/NavigationItem';
import { defaultLocale } from '~/locales.config';

interface Props {
  border?: boolean
}

defineProps<Props>();
const { addInfo } = useMessageStore();
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

const {
  isOpen: searchOpen,
  open: openSearch,
  close: closeSearch,
  query: searchQuery,
  results: searchResults,
  status: searchStatus,
  setQuery: setSearchQuery,
} = useSearchContext();

// Watch locale changes and refresh navigation
watch(locale, async () => {
  await refreshNavigation();
});

const colorMode = useColorMode();
function updateColorMode(value: ColorMode) {
  colorMode.preference = value;
}
async function setLocaleAndShowMessage(locale: LocaleStructure['code']) {
  await setLocale(locale);

  if (locale !== defaultLocale) {
    addInfo(t('notifications.info.languageAiTranslated'), { closeIn: 4000 });
  }
}
</script>

<template>
  <AppHeader
    :navigation="navigation"
    :border="border"
    :colorMode="colorMode.preference as ColorMode"
    :language="locale"
    @update:colorMode="updateColorMode"
    @update:language="setLocaleAndShowMessage"
  >
    <template #searchButton>
      <SearchButton @open="openSearch" />
    </template>
    <template #searchModal>
      <SearchModal
        :open="searchOpen"
        :query="searchQuery"
        :results="searchResults"
        :status="searchStatus"
        @update:query="setSearchQuery"
        @close="closeSearch"
      />
    </template>
  </AppHeader>
</template>
