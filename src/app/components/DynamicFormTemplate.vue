<script lang="ts" setup>
import { DynamicFormTemplate } from '@bach.software/vue-dynamic-form';
import { metadata } from '@/components/DynamicFormTemplate';
</script>

<template>
  <DynamicFormTemplate :metadata-configuration="metadata">
    <template #default="{ fieldMetadata, fieldContext: { errorMessage, label }, required }">
      <label :for="fieldMetadata.path">{{ label }} <span v-if="required">*</span></label>
      <slot />
      <span v-if="errorMessage.value">{{ errorMessage.value }}</span>
    </template>

    <template #default-input="{ fieldMetadata, fieldContext: { value, handleChange, handleBlur } }">
      <input
        :id="fieldMetadata.path"
        :value="value.value"
        @input="handleChange"
        @blur="handleBlur"
      >
    </template>
  </DynamicFormTemplate>
</template>
