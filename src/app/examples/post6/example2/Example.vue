<script lang="ts" setup>
import type { Metadata } from '../MyFormTemplate';
import { DynamicForm, useDynamicForm } from '@bach.software/vue-dynamic-form';
import { ref } from 'vue';
import MyFormTemplate from '../MyFormTemplate.vue';
import { settings } from '../settings';

const { handleSubmit } = useDynamicForm();
const submitted = ref<string>();

const fields: Metadata[] = [
  {
    name: 'contacts',
    fieldOptions: { label: 'Project contacts' },
    minOccurs: 1,
    maxOccurs: 3,
    children: [
      {
        name: 'name',
        type: 'text',
        fieldOptions: { label: 'Name' },
        restriction: { minLength: 2 },
      },
      {
        name: 'email',
        type: 'text',
        fieldOptions: { label: 'Email' },
        restriction: { pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$' },
      },
    ],
  },
  {
    name: 'contactMethod',
    fieldOptions: { label: 'How should we reach you?' },
    minOccurs: 1,
    choice: [
      { name: 'email', type: 'text', fieldOptions: { label: 'Email address' } },
      { name: 'phone', type: 'text', fieldOptions: { label: 'Phone number' } },
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
