<script lang="ts" setup>
import {
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
} from "@heroicons/vue/24/outline";

const colorMode = useColorMode();
const toggleColorMode = () => {
  if (colorMode.preference === "system") {
    colorMode.preference = "dark";
  } else if (colorMode.preference === "dark") {
    colorMode.preference = "light";
  } else {
    colorMode.preference = "system";
  }
};
</script>

<template>
  <div class="flex size-6 flex-col overflow-hidden">
    <button class="absolute" @click="toggleColorMode">
      <Transition name="slide-up">
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
      </Transition>
    </button>
  </div>
</template>
<style lang="scss" scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
