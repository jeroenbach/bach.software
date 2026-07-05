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
    name: 'person',
    type: 'heading',
    fieldOptions: { label: 'Person' },
    children: [
      { name: 'firstName', type: 'text', fieldOptions: { label: 'First name' } },
      { name: 'lastName', type: 'text', fieldOptions: { label: 'Last name' } },
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
