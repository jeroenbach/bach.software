<script lang="ts" setup>
import { DynamicFormTemplate } from '@bach.software/vue-dynamic-form';
import { metadata } from './MyFormTemplate';
</script>

<template>
  <DynamicFormTemplate :metadata-configuration="metadata">
    <!-- Section heading -->
    <template #heading="{ fieldMetadata, fieldContext: { label } }">
      <h3 class="mt-4 mb-2 text-base font-semibold">
        {{ label }}
      </h3>
      <p v-if="fieldMetadata.description" class="mb-2 text-sm opacity-70">
        {{ fieldMetadata.description }}
      </p>
      <slot />
    </template>

    <!-- Outer container for repeatable fields -->
    <template #default-array="{ fieldContext: { label, errorMessage }, required, canAddItems, addItem }">
      <section class="my-4">
        <h3 class="mb-2 text-base font-semibold">
          {{ label }}<span v-if="required"> *</span>
        </h3>
        <slot />
        <button
          v-if="canAddItems"
          type="button"
          class="cursor-pointer rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-slate-700"
          @click="addItem"
        >
          + Add
        </button>
        <p v-if="errorMessage.value" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ errorMessage.value }}
        </p>
      </section>
    </template>

    <!-- Each occurrence of a repeatable field -->
    <template #default-array-item="{ fieldContext: { errorMessage }, canRemoveItems, removeItem }">
      <div class="relative mb-3 rounded-md border border-gray-200 p-3 pt-1 dark:border-gray-700">
        <slot />
        <button
          v-if="canRemoveItems"
          type="button"
          class="absolute top-2 right-2 cursor-pointer text-sm opacity-60 hover:opacity-100"
          @click="removeItem"
        >
          ✕ Remove
        </button>
        <p v-if="errorMessage.value" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ errorMessage.value }}
        </p>
      </div>
    </template>

    <!-- Outer container for mutually exclusive choices -->
    <template #default-choice="{ fieldContext: { label, errorMessage }, required }">
      <fieldset class="my-4 rounded-md border border-gray-200 p-3 dark:border-gray-700">
        <legend class="px-1 text-sm font-semibold">
          {{ label }}<span v-if="required"> *</span>
        </legend>
        <slot />
        <p v-if="errorMessage.value" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ errorMessage.value }}
        </p>
      </fieldset>
    </template>

    <!-- Default wrapper: renders groups and single fields -->
    <template #default="{ fieldMetadata, fieldContext: { label, errorMessage }, required, disabled }">
      <!-- Group rendering -->
      <div v-if="fieldMetadata.children?.length">
        <h4 v-if="label" class="mt-2 mb-1 text-sm font-semibold">
          {{ label }}<span v-if="required"> *</span>
        </h4>
        <slot />
      </div>

      <!-- Input rendering -->
      <div v-else class="form-field !my-2" :class="{ 'opacity-50': disabled || fieldMetadata.disabled }">
        <label :for="fieldMetadata.path" class="text-sm font-medium">
          {{ label }}<span v-if="required"> *</span>
        </label>
        <slot />
        <p v-if="fieldMetadata.description" class="!m-0 text-sm opacity-70">
          {{ fieldMetadata.description }}
        </p>
        <p v-if="errorMessage.value" class="!m-0 text-sm text-red-600 dark:text-red-400">
          {{ errorMessage.value }}
        </p>
      </div>
    </template>

    <!-- Select input -->
    <template #select-input="{ fieldMetadata, fieldContext: { value, handleChange, handleBlur }, disabled }">
      <select
        :id="fieldMetadata.path"
        class="!my-0"
        :value="value.value"
        :disabled="fieldMetadata.disabled || disabled"
        @change="handleChange"
        @blur="handleBlur"
      >
        <option value="">
          — Select —
        </option>
        <option v-for="opt in fieldMetadata.options" :key="opt.key" :value="opt.key">
          {{ opt.value }}
        </option>
      </select>
    </template>

    <!-- Checkbox input -->
    <template #checkbox-input="{ fieldMetadata, fieldContext: { value, handleChange, handleBlur }, disabled }">
      <input
        :id="fieldMetadata.path"
        type="checkbox"
        class="!my-0 self-start"
        :checked="value.value"
        :disabled="fieldMetadata.disabled || disabled"
        @change="handleChange(($event.target as HTMLInputElement).checked)"
        @blur="handleBlur"
      >
    </template>

    <!-- Default text input (fallback for all other types) -->
    <template #default-input="{ fieldMetadata, fieldContext: { value, handleChange, handleBlur }, disabled }">
      <input
        :id="fieldMetadata.path"
        class="!my-0"
        :value="value.value"
        :disabled="fieldMetadata.disabled || disabled"
        @input="handleChange"
        @blur="handleBlur"
      >
    </template>
  </DynamicFormTemplate>
</template>
