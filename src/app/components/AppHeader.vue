<script lang="ts" setup>
import { ref, computed } from "vue";
import { Bars3Icon, XMarkIcon } from "@heroicons/vue/24/outline";
import {
  Dialog,
  DialogPanel,
  TransitionRoot,
  TransitionChild,
} from "@headlessui/vue";
import { useScroll } from "@vueuse/core";

import type { NavigationItem } from "~/types/NavigationItem";
import type { Notification } from "~/composables/useNotificationStore";
import type { ColorMode } from "~/components/ColorModeSwitcher.vue";

interface Props {
  border?: boolean;
  navigation?: NavigationItem[] | null;
  notifications?: Notification[];
}

const { border, navigation = [], notifications = [] } = defineProps<Props>();

const colorMode = defineModel<ColorMode>("colorMode", {
  default: "system",
});

const mobileMenuOpen = ref(false);
const close = () => (mobileMenuOpen.value = false);
const open = () => (mobileMenuOpen.value = true);

// Animate only during scroll of max 64px (the max height of the header)
const { y } = useScroll(window);
const scrollHeader = computed(() => Math.min(y.value / 64, 1));
</script>

<template>
  <header
    class="sticky inset-0 z-20 flex w-full justify-center border-gray-200 bg-white px-4 text-gray-900 dark:border-gray-400 dark:bg-slate-900 dark:text-gray-300 lg:px-6"
    :class="{ 'border-b': border }"
  >
    <nav
      class="mx-auto flex h-full w-full max-w-7xl items-center"
      aria-label="Global"
    >
      <div class="ml-auto flex pl-6 dark:text-gray-300 lg:ml-0 lg:pl-0">
        <AppLink to="/" class="-m-1.5 p-1.5 text-lg">
          <span class="sr-only">{{ $t("Bach.Software") }}</span>
          <AppImage class="logo inline dark:hidden" src="/logo.svg" />
          <AppImage class="logo hidden dark:inline" src="/logo-light.svg" />
        </AppLink>
      </div>
      <div class="ml-auto hidden lg:flex lg:gap-x-12">
        <AppLink
          v-for="item in navigation"
          :key="item.label"
          :to="item.to"
          class="text-sm font-semibold leading-6"
        >
          {{ item.label }}
        </AppLink>
        <ColorModeSwitcher v-model:colorMode="colorMode" />
      </div>
      <div class="ml-auto flex lg:hidden">
        <button
          type="button"
          class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
          @click="open"
        >
          <span class="sr-only">Open main menu</span>
          <Bars3Icon class="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
    </nav>

    <TransitionRoot :show="mobileMenuOpen" as="template">
      <Dialog as="div" class="relative z-50 lg:hidden" @close="close">
        <TransitionChild
          as="template"
          enter="duration-75 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="delay-200 duration-75 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div class="fixed inset-0 z-50 bg-black/30" aria-hidden="true" />
        </TransitionChild>
        <TransitionChild
          as="template"
          enter="delay-75 duration-200 ease-out transition-transform"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="duration-200 ease-in transition-transform"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
        >
          <DialogPanel
            class="fixed inset-y-0 right-0 z-50 w-11/12 overflow-y-auto bg-white px-6 py-6 ring-gray-900/10 dark:bg-slate-900 dark:ring-gray-50/10 sm:max-w-sm sm:ring-1"
          >
            <div class="flex items-center justify-between">
              <AppLink to="/" class="-m-1.5 p-1.5 text-lg" @click="close">
                <span class="sr-only">{{ $t("Bach.Software") }}</span>
                <AppImage class="inline h-8 dark:hidden" src="/logo.svg" />
                <AppImage
                  class="hidden h-8 dark:inline"
                  src="/logo-light.svg"
                />
              </AppLink>
              <AppButton
                type="button"
                class="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-400"
                @click="close"
              >
                <span class="sr-only">Close menu</span>
                <XMarkIcon class="h-6 w-6" aria-hidden="true" />
              </AppButton>
            </div>
            <div class="mt-6 flow-root">
              <div class="-my-6 divide-y divide-gray-500/10">
                <div class="space-y-2 py-6">
                  <AppLink
                    v-for="item in navigation"
                    :key="item.label"
                    :to="item.to"
                    class="-mx-3 block rounded-lg px-3 py-2 font-semibold leading-7 hover:bg-gray-50 dark:hover:bg-gray-800"
                    @click="close"
                  >
                    {{ item.label }}
                  </AppLink>
                </div>
                <div class="space-y-2 py-6">
                  <ColorModeSwitcher v-model:colorMode="colorMode" />
                </div>
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </TransitionRoot>
    <NotificationContainer />
    <NotificationMessage
      v-for="notification in notifications"
      :key="notification.notificationId"
      v-bind="notification"
    />
  </header>
</template>
<style lang="scss">
@keyframes reduce-height {
  to {
    height: var(--reduceHeight);
  }
}
@keyframes border-appear {
  from {
    border-color: transparent;
  }
  to {
    border-bottom-width: 1px;
  }
}

header {
  --height: 4rem;
  --reduceHeight: calc(var(--height) * 0.65);
  height: var(--height);
  animation: reduce-height 1s linear both paused;
  animation-delay: calc(v-bind(scrollHeader) * -1s);

  &:not(.border-b) {
    animation:
      reduce-height 1s linear both paused,
      border-appear 1s linear both paused;
    animation-delay: calc(v-bind(scrollHeader) * -1s);
  }

  .logo {
    --height: 2rem;
    --reduceHeight: calc(var(--height) * 0.85);
    height: var(--height);
    animation: reduce-height 1s linear both paused;
    animation-delay: calc(v-bind(scrollHeader) * -1s);
  }
}

@media (min-width: 1024px) {
  header {
    --height: 5rem;
    .logo {
      --height: 2.5rem;
    }
  }
}
</style>
