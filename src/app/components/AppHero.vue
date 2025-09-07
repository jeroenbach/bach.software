<script lang="ts" setup>
export interface Props {
  intro?: string
  title?: string
  subTitle?: string
  text?: string
  imgSrc?: string
  imgAlt?: string
}
defineProps<Props>();
</script>

<template>
  <div
    class="mx-auto flex gap-x-10 gap-y-12 py-24 max-md:flex-col lg:gap-x-28 lg:py-28"
  >
    <div class="flex flex-col">
      <span
        v-if="intro"
        class="text-sm tracking-wide text-sky-600 dark:text-sky-400"
      >
        {{ intro }}
      </span>
      <h1 v-if="title" class="text-4xl text-gray-900 dark:text-gray-50">
        {{ title }}
      </h1>
      <h2
        v-if="subTitle"
        class="mt-4 text-4xl text-gray-600 dark:text-gray-400"
      >
        {{ subTitle }}
      </h2>
      <AppProse v-if="$slots.default ?? text">
        <slot>{{ text }}</slot>
      </AppProse>
    </div>
    <div v-if="imgSrc" class="mx-auto">
      <div
        class="size-60 shrink-0 grow-0 overflow-hidden rounded-full ring ring-white dark:ring-gray-900"
      >
        <ResponsiveImage
          :src="imgSrc"
          :alt="imgAlt"
          :aria-label="imgAlt"
          aspectRatio="1/1"
          :partOfScreen="1"
          :partOfScreenLarge="5"
          class="w-full"
        />
      </div>
    </div>
  </div>
</template>
