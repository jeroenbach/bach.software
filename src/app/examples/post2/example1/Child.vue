<script lang="ts" setup>
defineProps<{ test?: string }>();
defineEmits(["update:test"]);

const message = defineModel<{ message?: string; length?: number }>("message", {
  default: {
    message: "Hello world",
    length: 0,
  },
});
</script>
<template>
  Child 1
  <input v-model="message.message" />
  <input v-model="message.length" />
</template>
