<script lang="ts" setup>
import { useStorage } from "@vueuse/core";
const plausibleIgnore = useStorage("plausible_ignore", false);
</script>
<template>
  <div class="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
    <div class="hidden sm:mb-8 sm:flex sm:justify-center">
      <div
        class="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20"
      >
        <i18n-t keypath="plausible.current.text" tag="p">
          <template #status>
            <span
              v-if="plausibleIgnore"
              class="font-bold text-red-600 dark:text-red-400"
            >
              {{ $t("plausible.current.not") }}
            </span>
            <span v-else class="font-bold text-green-600 dark:text-green-400">
              {{ $t("plausible.current.are") }}
            </span>
          </template>
        </i18n-t>
      </div>
    </div>
    <div class="text-center">
      <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
        {{ $t("plausible.title") }}
      </h1>
      <p class="mt-6 text-lg leading-8 text-gray-600">
        {{ $t("plausible.description") }}
      </p>
      <div class="mt-10 flex items-center justify-center gap-x-6">
        <AppButton
          class="rounded-md bg-sky-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          @click="plausibleIgnore = !plausibleIgnore"
        >
          {{
            $t("plausible.button.text", {
              action: plausibleIgnore
                ? $t("plausible.button.include", "Include")
                : $t("plausible.button.exclude", "Exclude"),
            })
          }}
        </AppButton>
      </div>
    </div>
  </div>
</template>
