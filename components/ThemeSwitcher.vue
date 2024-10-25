<script lang="ts" setup>
import {
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
} from "@heroicons/vue/24/outline";

const colorMode = useColorMode();
const toggleColorMode = () => {
  if (colorMode.preference === "light") {
    colorMode.preference = "system";
  } else if (colorMode.preference === "dark") {
    colorMode.preference = "light";
  } else {
    colorMode.preference = "dark";
  }
};
</script>

<template>
  <div class="flex size-6 flex-col overflow-hidden">
    <ClientOnly>
      <button class="absolute" @click="toggleColorMode">
        <AppTransition name="slide-up">
          <ComputerDesktopIcon
            v-if="$colorMode.preference === 'system'"
            class="absolute size-6"
          />
          <SunIcon
            v-else-if="$colorMode.preference === 'light'"
            class="absolute size-6"
          />
          <MoonIcon
            v-else-if="$colorMode.preference === 'dark'"
            class="absolute size-6"
          />
        </AppTransition>
      </button>
    </ClientOnly>
  </div>
</template>
