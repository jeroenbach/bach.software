<script lang="ts" setup>
import Child from './Child.vue';

const value = ref('Hello world');
</script>

<template>
  <div class="flex flex-col">
    <label>Updating these components work</label>
    <Child :modelValue="value" @update:modelValue="value = $event" />
    <Child v-model="value" />
    <label>This component is broken</label>
    <Child :modelValue="value" />
  </div>
</template>
