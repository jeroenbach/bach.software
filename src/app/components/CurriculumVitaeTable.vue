<script setup lang="ts">
import type { CurriculumVitaeItem } from '~/types/CurriculumVitaeItem';

interface Props {
  curriculumVitae?: CurriculumVitaeItem[]
}

defineProps<Props>();
</script>

<template>
  <ol class="mx-auto flex max-w-prose flex-col gap-12">
    <li
      v-for="(
        { title, description, company, date, technologies }, i
      ) in curriculumVitae"
      :key="`${i}-${title}`"
      class="grid gap-y-2 transition-all sm:grid-cols-4 sm:gap-8 md:gap-4"
    >
      <header
        class="mt-1 h-fit text-xs font-semibold uppercase tracking-wide text-gray-500"
      >
        {{ date }}
      </header>
      <div class="flex flex-col gap-2 sm:col-span-3">
        <h3 class="font-medium leading-snug text-gray-900 dark:text-gray-50">
          {{ title }} - {{ company }}
        </h3>
        <AppMarkdown
          class="curriculum-vitae-markdown text-sm leading-normal tracking-wide text-gray-500 dark:text-gray-400"
          :text="description"
        />
        <ul class="flex flex-wrap gap-x-1.5 gap-y-2">
          <li v-for="technology in technologies" :key="technology">
            <AppChip
              class="bg-gradient-to-r from-gray-200 to-gray-100 font-medium text-sky-600 dark:from-gray-700 dark:to-gray-600 dark:text-sky-400"
            >
              {{ technology }}
            </AppChip>
          </li>
        </ul>
      </div>
    </li>
  </ol>
</template>

<style lang="scss" scoped>
.curriculum-vitae-markdown :deep(li) {
  margin-top: 0.625rem;

  &:last-child {
    margin-bottom: 0.625rem;
  }
}
</style>
