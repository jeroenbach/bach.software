<script lang="ts" setup></script>

<template>
  <div class="mx-auto max-w-prose" itemscope itemtype="https://schema.org/Blog">
    <div
      class="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none"
    >
      <slot />
    </div>
  </div>
</template>
