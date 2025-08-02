<script lang="ts" setup>
defineOptions({ inheritAttrs: false });
</script>

<template>
  <div class="px-4 lg:px-6">
    <div v-bind="$attrs" class="mx-auto w-full max-w-prose">
      <slot />
    </div>
  </div>
</template>
