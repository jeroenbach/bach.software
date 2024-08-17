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
</script>

<template>
  <header>
    <nav
      class="flex items-center justify-between p-6 lg:px-8"
      aria-label="Global"
    >
      <div class="dark: dark:text-gray-300 flex lg:flex-1">
        <NuxtLink to="/" class="-m-1.5 p-1.5">
          <span class="sr-only">Bach.Software</span>
          <img
            class="h-8 w-auto"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
            alt=""
          />
        </NuxtLink>
        <button @click="$colorMode.preference = 'system'">
          <ComputerDesktopIcon class="size-6" />
        </button>
        <button @click="$colorMode.preference = 'light'">
          <SunIcon class="size-6" />
        </button>
        <button @click="$colorMode.preference = 'dark'">
          <MoonIcon class="size-6" />
        </button>
      </div>
      <div class="flex lg:hidden">
        <button
          type="button"
          class="text-gray-700 -m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
          @click="mobileMenuOpen = true"
        >
          <span class="sr-only">Open main menu</span>
          <Bars3Icon class="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
      <div class="hidden lg:flex lg:gap-x-12">
        <NuxtLink
          v-for="item in navigation"
          :key="item.label"
          :to="item.to"
          class="text-gray-900 dark:text-gray-300 text-sm font-semibold leading-6"
        >
          {{ item.label }}
        </NuxtLink>
      </div>
    </nav>
    <Dialog
      class="lg:hidden"
      @close="mobileMenuOpen = false"
      :open="mobileMenuOpen"
    >
      <div class="fixed inset-0 z-50" />
      <DialogPanel
        class="sm:ring-gray-900/10 fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1"
      >
        <div class="flex items-center justify-between">
          <a href="#" class="-m-1.5 p-1.5">
            <span class="sr-only">Bach.Software</span>
            <img
              class="h-8 w-auto"
              src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
              alt=""
            />
          </a>
          <button
            type="button"
            class="text-gray-700 -m-2.5 rounded-md p-2.5"
            @click="mobileMenuOpen = false"
          >
            <span class="sr-only">Close menu</span>
            <XMarkIcon class="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div class="mt-6 flow-root">
          <div class="divide-gray-500/10 -my-6 divide-y">
            <div class="space-y-2 py-6">
              <NuxtLink
                v-for="item in navigation"
                :key="item.label"
                :href="item.to"
                class="text-gray-900 dark:text-gray-300 hover:bg-gray-50 -mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7"
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
