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
import { computed } from "vue";
import MultiSelect, { type MultiSelectProps } from "primevue/multiselect";
import Select from "primevue/select";

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

// Use the MultiSelectProps type from PrimeVue, but with some better typing
interface Props
  extends Omit<MultiSelectProps, "modelValue" | "options" | "optionValue"> {
  modelValue?: TSingleOrMultiple;
  optionValue?: TOptionValue;
  options?: TOptionType[];
  multiple?: TMultiple;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "update:modelValue", value: TSingleOrMultiple): void;
}>();

// Note: an empty attribute will result in an empty string "" value,
// therefore we check for false and undefined explicitly
const isMultiple = computed(
  () => props.multiple !== false && props.multiple !== undefined,
);

const update = (value: unknown) => {
  emit("update:modelValue", value as TSingleOrMultiple);
};
</script>

<template>
  <MultiSelect
    v-if="isMultiple"
    v-bind="props"
    :modelValue="modelValue"
    @update:modelValue="update"
  />
  <Select
    v-else
    v-bind="props"
    :modelValue="modelValue"
    @update:modelValue="update"
  />
</template>
