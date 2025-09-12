<script lang="ts" setup>
import { refReactiveDefault } from '~/composables/refReactiveDefault';

const props = defineProps<{ modelValue?: string }>();
defineEmits(['update:modelValue']);

const modelValue = refReactiveDefault(() => props.modelValue);
</script>

<template>
  Child2
  <input v-model="modelValue" @input="$emit('update:modelValue', modelValue)">
</template>
