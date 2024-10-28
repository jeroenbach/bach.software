<script
  lang="ts"
  setup
  generic="
    TOptionType,
    TOptionValue extends keyof TOptionType = any,
    TMultiple extends true | false = any
  "
>
import MultiSelect, { type MultiSelectProps } from "primevue/multiselect";
import Select from "primevue/select";

type TReturnType = undefined extends TOptionValue
  ? TOptionType
  : TOptionType[TOptionValue];

type TSingleOrMultiple = undefined extends TMultiple
  ? TReturnType
  : TMultiple extends false
    ? TReturnType
    : TReturnType[];

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

// Note: an empty attribute will result in an empty string "" value, therefore we check for false and undefined explicitly
const isMultiple = computed(() => !isFalseOrUndefined(props.multiple));

const update = (value: any) => {
  emit("update:modelValue", value);
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
