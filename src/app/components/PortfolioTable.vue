<script setup lang="ts">
import type { Project } from "~/types/Project";

interface Props {
  title?: string;
  projects?: Project[];
}

defineProps<Props>();
</script>
<template>
  <ol class="mx-auto flex max-w-prose flex-col gap-12">
    <li
      v-for="(
        { title, description, company, date, technologies }, i
      ) in projects"
      :key="`${i}-${title}`"
      class="grid transition-all sm:grid-cols-4 sm:gap-8 md:gap-4"
    >
      <header
        class="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-500"
      >
        {{ date }}
      </header>
      <div class="flex flex-col gap-2 sm:col-span-3">
        <h3 class="font-medium leading-snug text-gray-900 dark:text-gray-50">
          {{ title }} - {{ company }}
        </h3>
        <p
          class="text-sm leading-normal tracking-wide text-gray-500 dark:text-gray-400"
        >
          {{ description }}
        </p>
        <ul class="flex flex-wrap gap-x-1.5 gap-y-2">
          <li v-for="technology in technologies" :key="technology">
            <AppChip
              class="bg-gradient-to-r from-gray-200 to-gray-100 font-medium text-sky-600 dark:from-gray-700 dark:to-gray-600 dark:text-sky-400"
              >{{ technology }}</AppChip
            >
          </li>
        </ul>
      </div>
    </li>
  </ol>
</template>
