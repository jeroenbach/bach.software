<script lang="ts" setup>
import { Bars3Icon, XMarkIcon } from "@heroicons/vue/24/outline";
import {
  Dialog,
  DialogPanel,
  TransitionRoot,
  TransitionChild,
} from "@headlessui/vue";
const navigation = [
  { label: "Blog", to: "/posts" },
  { label: "Articles", to: "/pages/articles" },
  { label: "Open source", to: "/pages/open-source" },
  { label: "Projects", to: "/pages/projects" },
  { label: "About", to: "/pages/about" },
];

const mobileMenuOpen = ref(false);
const close = () => (mobileMenuOpen.value = false);
const open = () => (mobileMenuOpen.value = true);
</script>

<template>
  <header class="flex justify-center text-gray-900 dark:text-gray-300">
    <nav
      class="flex w-full max-w-screen-2xl items-center py-6 lg:py-8"
      aria-label="Global"
    >
      <div class="ml-auto flex pl-6 dark:text-gray-300 lg:ml-0 lg:pl-0">
        <NuxtLink to="/" class="-m-1.5 p-1.5 text-lg">
          <span class="sr-only">{{ $t("Bach.Software") }}</span>
          {{ $t("Bach.Software") }}
        </NuxtLink>
      </div>
      <div class="ml-auto hidden lg:flex lg:gap-x-12">
        <NuxtLink
          v-for="item in navigation"
          :key="item.label"
          :to="item.to"
          class="text-sm font-semibold leading-6"
        >
          {{ item.label }}
        </NuxtLink>
        <ThemeSwitcher />
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
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="delay-200 duration-75 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 z-50 bg-black/30" aria-hidden="true" />
        </TransitionChild>
        <TransitionChild
          as="template"
          enter="delay-75 duration-200 ease-out transition-transform"
          enter-from="translate-x-full"
          enter-to="translate-x-0"
          leave="duration-200 ease-in transition-transform"
          leave-from="translate-x-0"
          leave-to="translate-x-full"
        >
          <DialogPanel
            class="fixed inset-y-0 right-0 z-50 w-11/12 overflow-y-auto bg-white px-6 py-6 dark:bg-slate-900 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10"
          >
            <div class="flex items-center justify-between">
              <NuxtLink @click="close" to="/" class="-m-1.5 p-1.5 text-lg">
                <span class="sr-only">{{ $t("Bach.Software") }}</span>
                {{ $t("Bach.Software") }}
              </NuxtLink>
              <button
                type="button"
                class="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-400"
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
                    class="-mx-3 block rounded-lg px-3 py-2 font-semibold leading-7 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {{ item.label }}
                  </NuxtLink>
                </div>
                <div class="space-y-2 py-6">
                  <ThemeSwitcher />
                </div>
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </TransitionRoot>
  </header>
</template>
