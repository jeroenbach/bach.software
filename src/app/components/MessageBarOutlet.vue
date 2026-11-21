<script lang="ts" setup>
/**
 * The placeholder every MessageBar teleports into. Mount one in the main layout
 * and one inside each modal; the most recently mounted outlet receives all new
 * messages (see MessageBarContext).
 */
import { inject, onUnmounted } from 'vue';
import {
  fallbackOutlets,
  messageBarRegistryKey,
} from '~/components/messageBarRegistry';

const { baseDataTestid = 'message-bar-outlet' } = defineProps<{ baseDataTestid?: string }>();

const {
  registerOutlet = fallbackOutlets,
  unregisterOutlet = () => {},
} = inject(messageBarRegistryKey, { currentOutlets: fallbackOutlets });

const { main, sticky, fixed } = registerOutlet();

onUnmounted(() => unregisterOutlet(main));
</script>

<template>
  <div
    :data-message-outlet="main"
    :data-testid="`${baseDataTestid}-main-panel`"
    class="overflow-hidden"
  />
  <div
    :data-message-outlet="sticky"
    :data-testid="`${baseDataTestid}-sticky-panel`"
    class="sticky top-16 z-10 overflow-hidden"
  />
  <div
    :data-message-outlet="fixed"
    :data-testid="`${baseDataTestid}-fixed-panel`"
    class="pointer-events-none fixed top-[calc(var(--headerHeight)*0.65)] right-6 left-auto z-50 flex w-[calc(100%-3rem)] max-w-md flex-col"
  />
</template>
