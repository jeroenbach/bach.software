<script lang="ts" setup>
defineProps<{
  name: 'slide-up'
}>();
</script>

<template>
  <Transition :name="name">
    <slot />
  </Transition>
</template>

<style lang="scss" scoped>
/** slide-up */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(1.5rem);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-1.5rem);
}
</style>
