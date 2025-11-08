<script setup lang="ts">
interface Props {
  title?: string
  subTitle?: string
  description?: string
  linkText?: string
  linkLocation?: string
}
const { title, subTitle, description } = defineProps<Props>();

const computedTitle = computed(() => `${title} - ${subTitle}`);

useSeoMeta(
  {
    title: () => computedTitle.value,
    ogTitle: () => computedTitle.value,
    description,
    ogDescription: description,
  },
);
</script>

<template>
  <div class="max-w-520px text-center flex flex-col justify-center">
    <h1 class="font-semibold leading-none mb-4 sm:text-[110px] tabular-nums text-[80px]">
      {{ title }}
    </h1><h2 class="font-semibold mb-2 sm:text-3xl text-2xl">
      {{ subTitle }}
    </h2><p class="mb-4 px-2 text-[#64748B] text-md">
      {{ description }}
    </p><div class="flex items-center justify-center w-full">
      <AppLink :to="linkLocation" class="font-medium text-sm underline underline-offset-3">
        {{ linkText }}
      </AppLink>
    </div>
  </div>
</template>
