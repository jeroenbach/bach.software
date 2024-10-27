<script lang="ts">
export type KeyValue = { key: string; value: string };
</script>
<script lang="ts" setup generic="TMultiple extends true | false | undefined">
// Lets return the correct type based on the TMultiple value.
// - TMultiple === undefined => string
// - TMultiple === false => string
// - TMultiple === true => string[]
type TSingleOrMultiple = undefined extends TMultiple
  ? string
  : TMultiple extends false
    ? string
    : string[];

interface Props {
  modelValue?: TSingleOrMultiple;
  options?: KeyValue[];
  multiple?: TMultiple;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "update:modelValue", value: TSingleOrMultiple): void;
}>();

// Note: an empty attribute will result in an empty string "" value, therefore we check for false and undefined explicitly
const isMultiple = computed(() => !isFalseOrUndefined(props.multiple));

const value = ref<any>(props.modelValue);
watch(value, (v) => emit("update:modelValue", v));
</script>

<template>
  <select v-model="value" :multiple="multiple">
    <option disabled value="">
      Please select {{ isMultiple ? "multiple" : "one" }}
    </option>
    <option v-for="{ key, value } in options" :value="key">
      {{ value }}
    </option>
  </select>
</template>
