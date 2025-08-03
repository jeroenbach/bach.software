<script setup lang="ts">
import type { PortfolioItem } from "~/types/PortfolioItem";

interface Props {
  portfolio?: PortfolioItem[];
}
const { portfolio = [] } = defineProps<Props>();
</script>
<template>
  <div v-if="portfolio" class="bg-gray-50 dark:bg-gray-900">
    <div class="mx-auto max-w-2xl px-6 py-8 lg:max-w-7xl lg:px-8 lg:py-12">
      <ul
        class="group/list mt-10 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2"
      >
        <li
          v-for="portfolioItem in portfolio"
          :key="portfolioItem.title"
          class="delay-50 group transition-opacity duration-200 ease-in-out lg:hover:!opacity-100 lg:group-hover/list:opacity-50"
          :class="portfolioItem.liClass"
        >
          <AppLink
            :to="portfolioItem.link"
            target="_blank"
            class="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/15"
            :class="portfolioItem.linkClass"
          >
            <div class="px-8 pb-3 pt-8 sm:px-10 sm:pb-0 sm:pt-10">
              <p
                class="mt-2 text-lg font-medium tracking-tight text-gray-900 dark:text-gray-50 max-lg:text-center"
              >
                {{ portfolioItem.title }}
              </p>
              <AppMarkdown
                :text="portfolioItem.description"
                class="mt-2 max-w-lg text-sm/6 text-gray-600 dark:text-gray-400 max-lg:text-center"
              />
            </div>
            <template v-if="portfolioItem.imgOption === 'sofiaVera'">
              <div
                class="relative aspect-[3/4] w-full grow max-lg:mx-auto max-lg:max-w-md"
              >
                <div
                  class="absolute inset-x-10 bottom-0 top-10 h-full overflow-hidden rounded-[2.5rem] drop-shadow-2xl"
                >
                  <ResponsiveImage
                    src="/portfolio/iphone-sofia-vera.png"
                    :alt="portfolioItem.title"
                    aspectRatio="1/2"
                    :partOfScreen="1"
                    :partOfScreenLarge="3"
                    class="w-full"
                  />
                </div>
              </div>
            </template>
            <template v-else-if="portfolioItem.imgOption === 'travelBags'">
              <div class="relative flex flex-1 items-end">
                <ResponsiveImage
                  src="/portfolio/TravelBags.jpg"
                  :alt="portfolioItem.title"
                  aspectRatio="2/1"
                  :partOfScreen="1"
                  :partOfScreenMedium="3"
                  :partOfScreenLarge="6"
                  class="w-full"
                />
              </div>
            </template>
            <template v-else-if="portfolioItem.imgOption === 'pavo'">
              <div class="relative flex flex-1 items-end">
                <div
                  class="absolute inset-0 bg-gradient-to-b from-white from-15% to-50% dark:from-gray-800"
                ></div>
                <ResponsiveImage
                  src="/portfolio/Pavo.jpg"
                  :alt="portfolioItem.title"
                  aspectRatio="2/1"
                  :partOfScreen="1"
                  :partOfScreenMedium="3"
                  :partOfScreenLarge="6"
                  class="w-full"
                />
              </div>
            </template>
            <template v-else-if="portfolioItem.imgOption === 'beautyPlaza'">
              <div class="relative aspect-[3/4] w-full grow">
                <div
                  class="absolute bottom-0 left-10 right-0 top-10 overflow-hidden rounded-tl-xl bg-white shadow-2xl"
                >
                  <ResponsiveImage
                    src="/portfolio/BeautyPlaza.jpg"
                    :alt="portfolioItem.title"
                    class="h-full object-left"
                    aspectRatio="1/1"
                    :partOfScreen="1"
                  />
                </div>
              </div>
            </template>
          </AppLink>
        </li>
      </ul>
    </div>
  </div>
</template>
