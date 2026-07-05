<script lang="ts" setup>
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline';
import { computed, onMounted, ref } from 'vue';

const emits = defineEmits<{ (e: 'click'): void }>();

const { t } = useI18n();

const isMac = ref(false);
onMounted(() => {
  isMac.value = /Mac/.test(navigator.userAgent);
});

const title = computed(() => `${t('search.open')} (${isMac.value ? '⌘K' : 'Ctrl+K'})`);
</script>

<template>
  <AppButton
    class="-m-1 flex items-center rounded p-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
    :title="title"
    @click="emits('click')"
  >
    <MagnifyingGlassIcon class="size-5" aria-hidden="true" />
    <span class="sr-only">{{ $t('search.open') }}</span>
  </AppButton>
</template>
