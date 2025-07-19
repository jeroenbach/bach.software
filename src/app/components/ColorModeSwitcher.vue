<script lang="ts" setup>
import {
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
} from "@heroicons/vue/24/outline";

export type ColorMode = "light" | "dark" | "system";

interface Props {
  colorMode?: ColorMode;
}

const { colorMode = "system" } = defineProps<Props>();
const emits = defineEmits<{
  (e: "update:colorMode", value: ColorMode): void;
}>();

const toggleColorMode = () => {
  if (colorMode === "light") {
    emits("update:colorMode", "system");
  } else if (colorMode === "dark") {
    emits("update:colorMode", "light");
  } else {
    emits("update:colorMode", "dark");
  }
};
</script>

<template>
  <div class="flex size-6 flex-col overflow-hidden">
    <ClientOnly>
      <AppButton
        title="Switch color mode"
        class="absolute"
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
