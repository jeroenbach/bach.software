<script lang="ts" setup></script>

<template>
  <div>My component</div>
  <ContentSlot :use="$slots.default" unwrap="p" />
  <ContentSlot :use="$slots.named" unwrap="p" />
  <!-- <NuxtImg src="/JEROEN-4238-HD.jpeg" /> -->
  <NuxtPicture src="/JEROEN-4238-HD.jpeg" />
</template>
