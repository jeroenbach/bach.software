<script setup lang="ts">
// Note: this file cannot contain any async code at the top level,
// the static site generation didn't work when refreshing a page.
import type { Props as BackgroundProps } from '~/components/AppBackground.vue';
import type { Props as FooterProps } from '~/contexts/AppFooterContext.vue';

const {
  background = 'white',
  shortFooter = undefined,
  backgroundFooter = undefined,
} = defineProps<
  BackgroundProps & {
    shortFooter?: FooterProps['short']
    backgroundFooter?: FooterProps['backgroundColor']
  }
>();
</script>

<template>
  <AppBackground :background="background" class="flex min-h-screen flex-col">
    <AppHeaderContext :border="background === 'gray'" />
    <main class="pb-12 pt-6 text-base lg:py-20 lg:text-lg">
      <slot />
    </main>
    <AppFooterContext
      :short="shortFooter"
      :backgroundColor="backgroundFooter"
    />
  </AppBackground>
</template>
