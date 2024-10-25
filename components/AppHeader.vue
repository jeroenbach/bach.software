<script lang="ts" setup>
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/vue";
import {
  Bars3Icon,
  BellIcon,
  XMarkIcon,
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
} from "@heroicons/vue/24/outline";
import { Dialog, DialogPanel } from "@headlessui/vue";
const navigation = [
  { label: "Blog", to: "/posts" },
  { label: "Articles", to: "/articles" },
  { label: "Open source", to: "/open-source" },
  { label: "Projects", to: "/projects" },
  { label: "About", to: "/pages/about" },
];

//https://srwiez.com/projects

// - sofia-vera.com
// - travelbags
// - pavo
// - hbb24

const mobileMenuOpen = ref(false);
const close = () => (mobileMenuOpen.value = false);
const open = () => (mobileMenuOpen.value = true);
</script>

<template>
  <header class="flex justify-center">
    <nav
      class="flex w-full max-w-screen-2xl items-center py-6 lg:justify-between lg:py-8"
      aria-label="Global"
    >
      <div class="dark: ml-auto flex dark:text-gray-300 lg:flex-1">
        <NuxtLink to="/" class="-m-1.5 p-1.5">
          <span class="sr-only">{{ $t("Bach.Software") }}</span>
          {{ $t("Bach.Software") }}
        </NuxtLink>
      </div>
      <div class="hidden lg:flex lg:gap-x-12">
        <NuxtLink
          v-for="item in navigation"
          :key="item.label"
          :to="item.to"
          class="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-300"
        >
          {{ item.label }}
        </NuxtLink>
        <ThemeSwitcher />
      </div>
      <div class="ml-auto flex lg:hidden">
        <button
          type="button"
          class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          @click="open"
        >
          <span class="sr-only">Open main menu</span>
          <Bars3Icon class="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
    </nav>
    <Dialog class="lg:hidden" @close="close" :open="mobileMenuOpen">
      <div class="fixed inset-0 z-50" />
      <DialogPanel
        class="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10"
      >
        <div class="flex items-center justify-between">
          <a href="#" class="-m-1.5 p-1.5">
            <span class="sr-only">Bach.Software</span>
            <!-- <img
              class="h-8 w-auto"
              src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
              alt=""
            /> -->
          </a>
          <button
            type="button"
            class="-m-2.5 rounded-md p-2.5 text-gray-700"
            @click="close"
          >
            <span class="sr-only">Close menu</span>
            <XMarkIcon class="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div class="mt-6 flow-root">
          <div class="-my-6 divide-y divide-gray-500/10">
            <div class="space-y-2 py-6">
              <NuxtLink
                v-for="item in navigation"
                :key="item.label"
                :href="item.to"
                @click="close"
                class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 dark:text-gray-300"
              >
                {{ item.label }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </DialogPanel>
    </Dialog>
  </header>
</template>
