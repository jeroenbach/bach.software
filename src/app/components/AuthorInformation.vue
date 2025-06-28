<script lang="ts" setup>
defineProps<{
  fullName?: string;
  role?: string;
  imageUrl?: string;
  homePage?: string;
  linkedIn?: string;
}>();
</script>

<template>
  <div
    class="relative flex items-center gap-x-4"
    itemscope
    itemtype="https://schema.org/Person"
    data-testid="author-information"
  >
    <ResponsiveImage
      v-if="imageUrl"
      :src="imageUrl"
      sizes="50px"
      aspectRatio="1/1"
      :alt="fullName"
      class="h-10 w-10 rounded-full"
    />
    <div class="text-sm leading-6">
      <p class="font-semibold text-gray-800 dark:text-gray-300">
        <slot name="topLine">
          <AppLink
            v-if="fullName"
            :to="homePage"
            itemprop="author"
            data-testid="author-name"
            >{{ fullName }}</AppLink
          >
          <span v-if="fullName && linkedIn"> · </span>
          <AppLink
            v-if="linkedIn"
            :to="linkedIn"
            color="blue"
            itemprop="url"
            data-testid="author-url"
          >
            {{ $t("Linkedin") }}
          </AppLink>
        </slot>
      </p>
      <p class="text-gray-500 dark:text-gray-400">
        <slot name="bottomLine">
          <span itemprop="jobTitle" data-testid="author-role">{{ role }}</span>
        </slot>
      </p>
    </div>
  </div>
</template>
