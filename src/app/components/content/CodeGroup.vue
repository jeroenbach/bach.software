<script setup lang="ts">
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
} from '@heroicons/vue/24/outline';
import { useClipboard } from '@vueuse/core';

const { t } = useI18n();
const { add: addNotification } = useNotificationStore();
const slots = useSlots();
const { copy: copyInternal, isSupported, copied } = useClipboard();

function copy(code: string) {
  copyInternal(code);
  addNotification('success', t('Copied to clipboard!'), undefined, {
    closeIn: 3000,
  });
}

const tabs = computed(() => {
  const _slots = slots?.default?.() ?? [];

  // Create a tab for each element in the slots
  return _slots.map((slot, index) => {
    return {
      label: slot?.props?.filename || slot?.props?.label || `${index}`,
      code: slot?.props?.code,
      component: slot,
    };
  });
});

const activeTabIndex = ref(0);
const activeTab = computed(() => tabs.value?.[activeTabIndex.value]);
const hasMultipleTabs = computed(() => tabs.value?.length > 1);
const fullScreen = ref(false);

function nextTab() {
  activeTabIndex.value
    = (activeTabIndex.value + 1) % (tabs.value?.length ?? 1);
}

function previousTab() {
  activeTabIndex.value
    = (activeTabIndex.value - 1 + (tabs.value?.length ?? 1)) % (tabs.value?.length ?? 1);
}

function tabClick(index: number) {
  if (index < 0 || index >= (tabs.value?.length ?? 0))
    return;

  activeTabIndex.value = index;
}

function maximizeClick() {
  fullScreen.value = !fullScreen.value;
}

function copyCode() {
  if (activeTab.value?.code)
    copy(activeTab.value.code);
}
</script>

<template>
  <div
    class="transition-all duration-300 ease-in-out w-full left-1/2 -translate-x-1/2 relative"
    :class="{ 'w-screen px-3 lg:px-6': fullScreen }"
  >
    <div
      role="tablist"
      aria-orientation="horizontal"
      class="flex items-center overflow-hidden overflow-x-auto rounded-t-md border border-b-0 border-gray-200 pe-4 dark:border-gray-700"
    >
      <template v-if="hasMultipleTabs">
        <AppButton
          v-for="(tab, index) in tabs"
          :key="tab.label"
          tabindex="-1"
          class="flex items-center px-4 py-2 text-sm text-gray-700 focus:outline-none dark:text-gray-200"
          :class="{
            'bg-gray-100 dark:bg-gray-600': activeTabIndex === index,
            'hover:bg-gray-50 dark:hover:bg-gray-600/50':
              activeTabIndex !== index,
          }"
          @click="tabClick(index)"
        >
          {{ tab.label }}
        </AppButton>
      </template>
      <span v-else class="p-2 px-4 text-sm">
        {{ activeTab.label }}
      </span>
      <ClientOnly>
        <div class="ml-auto flex">
          <AppButton
            v-if="isSupported && activeTab?.code"
            type="button"
            class="p-2"
            aria-label="Copy code to clipboard"
            tabindex="-1"
            @click="copyCode"
          >
            <ClipboardDocumentIcon v-if="!copied" class="size-4 text-gray-500" />
            <ClipboardDocumentCheckIcon v-else class="size-4 text-gray-500" />
          </AppButton>
          <AppButton
            type="button"
            class="p-2"
            aria-label="Maximize code block"
            tabindex="-1"
            @click="maximizeClick"
          >
            <ArrowsPointingOutIcon v-if="!fullScreen" class="size-4 text-gray-500" />
            <ArrowsPointingInIcon v-else class="size-4 text-gray-500" />
          </AppButton>
        </div>
      </ClientOnly>
    </div>
    <div class="relative">
      <div v-if="hasMultipleTabs" class="absolute cursor-w-resize top-0 h-full w-8 -left-4 -lg:left-6" @click="previousTab" />
      <div v-if="hasMultipleTabs" class="absolute cursor-e-resize top-0 h-full w-8 -right-4 -lg:right-6" @click="nextTab" />
      <div
        class="code-group rounded-b border border-gray-200 bg-stone-50 text-xs dark:border-gray-700 dark:bg-slate-700 sm:text-sm"
        :class="{
          'p-8': !activeTab?.code,
          'not-prose overflow-auto px-4 py-6': activeTab?.code,
        }"
      >
        <div class="flex">
          <div
            v-for="(tab, index) in tabs"
            :key="tab.label"
            :class="{
              'w-0 overflow-hidden': activeTabIndex !== index,
              'block w-full': activeTabIndex === index,
            }"
          >
            <component :is="tab?.component" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
