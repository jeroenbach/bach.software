<script lang="ts" setup>
import type { Metadata } from '../MyFormTemplate';
import { DynamicForm, useDynamicForm } from '@bach.software/vue-dynamic-form';
import { ref } from 'vue';
import MyFormTemplate from '../MyFormTemplate.vue';
import { settings } from '../settings';

const { handleSubmit, useFieldValue } = useDynamicForm();
const submitted = ref<string>();

// Subscribe to the accountType field, so we can use it in computedProps
const accountType = useFieldValue('accountType');

const fields: Metadata[] = [
  {
    name: 'accountType',
    type: 'select',
    fieldOptions: { label: 'Account type' },
    options: [
      { key: 'personal', value: 'Personal' },
      { key: 'business', value: 'Business' },
    ],
  },
  {
    name: 'vatNumber',
    type: 'text',
    fieldOptions: { label: 'VAT number' },
    computedProps: [
      (field) => {
        const isBusiness = accountType.value === 'business';
        field.disabled = !isBusiness;
        field.minOccurs = isBusiness ? 1 : 0; // only required for business accounts
        field.description = isBusiness
          ? undefined
          : 'Only applicable to business accounts';
      },
    ],
  },
];

const onSubmit = handleSubmit((values) => {
  submitted.value = JSON.stringify(values, null, 2);
});
</script>

<template>
  <form @submit="onSubmit">
    <DynamicForm :metadata="fields" :template="MyFormTemplate" :settings="settings" />
    <button
      type="submit"
      class="mt-2 cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
    >
      Submit
    </button>
  </form>
  <div v-if="submitted" class="mt-4">
    <span class="text-sm font-medium">Submitted values:</span>
    <pre class="text-sm">{{ submitted }}</pre>
  </div>
</template>
