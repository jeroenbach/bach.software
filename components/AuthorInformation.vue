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
  <div class="relative flex items-center gap-x-4">
    <NuxtPicture
      v-if="imageUrl"
      :src="imageUrl"
      sizes="50px"
      :alt="fullName"
      :imgAttrs="{ class: 'h-10 w-10 rounded-full bg-gray-50' }"
    />
    <div class="text-sm leading-6">
      <p class="font-semibold text-gray-800 dark:text-gray-300">
        <slot name="topLine">
          <span v-if="fullName">{{ fullName }}</span>
          <span v-if="fullName && linkedIn"> · </span>
          <AppLink v-if="linkedIn" :to="linkedIn" color="blue">
            {{ $t("Linkedin") }}
          </AppLink>
        </slot>
      </p>
      <p class="text-gray-500 dark:text-gray-400">
        <slot name="bottomLine">
          <span>{{ role }}</span>
        </slot>
      </p>
    </div>
  </div>
</template>
