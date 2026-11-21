<script lang="ts" setup>
import {
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
} from '@heroicons/vue/24/outline';

export type ColorMode = 'light' | 'dark' | 'system';

interface Props {
  colorMode?: ColorMode
  baseDataTestid?: string
}

const { colorMode = 'system', baseDataTestid = 'color-mode-switcher' } = defineProps<Props>();
const emits = defineEmits<{
  (e: 'update:colorMode', value: ColorMode): void
}>();

function toggleColorMode() {
  if (colorMode === 'light') {
    emits('update:colorMode', 'system');
  }
  else if (colorMode === 'dark') {
    emits('update:colorMode', 'light');
  }
  else {
    emits('update:colorMode', 'dark');
  }
}
</script>

<template>
  <div class="flex size-6 flex-col overflow-hidden">
    <ClientOnly>
      <AppButton
        :title="$t('Switch color mode')"
        :data-testid="`${baseDataTestid}-toggle-button`"
        class="absolute cursor-pointer"
        @click="toggleColorMode"
      >
        <AppTransition name="slide-up">
          <ComputerDesktopIcon
            v-if="colorMode === 'system'"
            class="absolute size-6"
          />
          <SunIcon v-else-if="colorMode === 'light'" class="absolute size-6" />
          <MoonIcon v-else-if="colorMode === 'dark'" class="absolute size-6" />
        </AppTransition>
      </AppButton>
    </ClientOnly>
  </div>
</template>
