<script setup lang="ts">
import { DynamicForm, useDynamicForm } from '@bach.software/vue-dynamic-form';
import DynamicFormTemplate from '@/components/DynamicFormTemplate.vue';

const { handleSubmit } = useDynamicForm();

const metadata = [
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
</script>

<template>
  <form @submit="handleSubmit(values => console.log(values))">
    <DynamicForm :metadata="metadata" :template="DynamicFormTemplate" />
  </form>
</template>
