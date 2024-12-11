<script lang="ts" setup>
import Child from "./Child.vue";
const value = ref("Hello world");
const message = ref({ message: "test", length: 4 });
</script>
<template>
  <div class="flex flex-col">
    <label>Updating these components work {{ value }}</label>
    <Child :modelValue="value" @update:modelValue="value = $event" />
    <Child v-model="value" />
    <Child :modelValue="value" />
    <label>This component is broken {{ message }}</label>
    <Child :message="message" />
  </div>
</template>
