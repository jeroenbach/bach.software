<script lang="ts" setup>
export interface Props {
  title?: string
  short?: boolean
  linkedInUrl?: string
  githubUrl?: string
  imgSrc?: string
  imgAlt?: string
  backgroundColor?: 'white' | 'gray'
}
const {
  title = undefined,
  short = false,
  linkedInUrl = undefined,
  githubUrl = undefined,
  imgSrc = undefined,
  imgAlt = undefined,
  backgroundColor = 'gray',
} = defineProps<Props>();
</script>

<template>
  <footer
    class="border-t border-t-slate-200 py-12 text-base dark:border-gray-500 dark:bg-gray-800 lg:py-20 lg:text-lg"
    :class="{
      'bg-white dark:bg-slate-900': backgroundColor === 'white',
      'bg-gray-50 dark:bg-gray-800': backgroundColor === 'gray',
    }"
  >
    <PageContent class="flex flex-col gap-y-8 lg:gap-y-12">
      <div v-if="!short" class="flex gap-4 max-md:flex-col lg:gap-6">
        <div class="flex flex-col">
          <h1 class="mb-2 text-2xl">
            {{ title }}
          </h1>
          <div class="max-w-lg text-sm/7">
            <slot name="about" />
          </div>
        </div>
        <div class="mx-auto">
          <div
            class="size-40 shrink-0 grow-0 overflow-hidden rounded-full ring ring-white dark:ring-gray-900"
          >
            <ResponsiveImage
              :src="imgSrc"
              :alt="imgAlt"
              aspectRatio="1/1"
              :partOfScreen="1"
              :partOfScreenLarge="5"
              class="w-full"
            />
          </div>
        </div>
      </div>
      <div class="mx-auto flex gap-4 lg:gap-6">
        <AppLink :to="linkedInUrl">
          <AppIcon class="size-7" icon="Linkedin" />
        </AppLink>
        <AppLink :to="githubUrl">
          <AppIcon class="size-7" icon="GitHub" />
        </AppLink>
      </div>
      <div class="mx-auto max-w-lg text-sm/7">
        <slot name="footer" />
      </div>
    </PageContent>
  </footer>
</template>
