<script lang="ts" setup>
const counter = useState("counter", () => Math.round(Math.random() * 1000));
</script>

<template>
  <footer class="flex">{{ counter }}</footer>
</template>
