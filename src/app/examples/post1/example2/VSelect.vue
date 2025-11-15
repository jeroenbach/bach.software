<script
  lang="ts"
  setup
  generic="
    TMultiple extends boolean | undefined,
    TOptionType,
    // As we cannot use undefined as a keyof type, we use
    // a workaround to just specify any and then check it
    // for undefined
    TOptionValue extends keyof TOptionType = any
  "
>
import { computed } from 'vue';

// Check whether we need to return the entire option object
// or just a property of that object
type TReturnType = undefined extends TOptionValue
  ? TOptionType
  : TOptionType[TOptionValue];

// Then we check whether we need to return a single value
// or an array of values
type TSingleOrMultiple = undefined extends TMultiple
  ? TReturnType
  : TMultiple extends false
    ? TReturnType
    : TReturnType[];

interface Props {
  modelValue?: TSingleOrMultiple
  optionValue?: TOptionValue
  optionLabel?: keyof TOptionType
  options?: TOptionType[]
  multiple?: TMultiple
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  filterable?: boolean
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: TSingleOrMultiple): void
}>();

// Note: an empty attribute will result in an empty string "" value,
// therefore we check for false and undefined explicitly
const isMultiple = computed(
  () => props.multiple !== false && props.multiple !== undefined,
);

function update(value: unknown) {
  emit('update:modelValue', value as TSingleOrMultiple);
}

// Function to help work with ElementPlus
function getAsString(value: unknown): string {
  return value as string;
}
</script>

<template>
  <ElSelect
    :modelValue="(modelValue as any)"
    :multiple="isMultiple"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :filterable="filterable"
    @update:modelValue="update"
  >
    <ElOption
      v-for="(option, index) in options"
      :key="index"
      :label="getAsString(props.optionLabel ? option[props.optionLabel!] : option)"
      :value="getAsString(props.optionValue ? option[props.optionValue!] : option)"
    />
  </ElSelect>
</template>
