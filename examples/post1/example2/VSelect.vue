<script
  lang="ts"
  setup
  generic="
    TOptionType,
    TOptionValue extends keyof TOptionType,
    TMultiple extends true | false | undefined
  "
>
import MultiSelect, { type MultiSelectProps } from "primevue/multiselect";
import Select from "primevue/select";

type TSingleOrMultiple = undefined extends TMultiple
  ? TOptionType[TOptionValue]
  : TMultiple extends true
    ? TOptionType[TOptionValue][]
    : TOptionType[TOptionValue];

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

// Also take into account that an empty attribute will result in a "" value
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
