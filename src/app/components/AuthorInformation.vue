<script lang="ts" setup>
const { fullName, role, imageUrl, homePage, linkedIn, baseDataTestid = 'author-information' } = defineProps<{
  fullName?: string
  role?: string
  imageUrl?: string
  homePage?: string
  linkedIn?: string
  baseDataTestid?: string
}>();
</script>

<template>
  <div
    class="relative flex items-center gap-x-4"
    :data-testid="`${baseDataTestid}-card`"
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
          <AppLink v-if="fullName" :to="homePage" :data-testid="`${baseDataTestid}-name-link`">
            {{
              fullName
            }}
          </AppLink>
          <span v-if="fullName && linkedIn"> · </span>
          <AppLink
            v-if="linkedIn"
            :to="linkedIn"
            color="blue"
            :data-testid="`${baseDataTestid}-linkedin-link`"
          >
            {{ $t("Linkedin") }}
          </AppLink>
        </slot>
      </p>
      <p class="text-gray-500 dark:text-gray-400">
        <slot name="bottomLine">
          <span :data-testid="`${baseDataTestid}-role-value`">{{ role }}</span>
        </slot>
      </p>
    </div>
  </div>
</template>
