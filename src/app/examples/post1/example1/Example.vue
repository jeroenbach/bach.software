<script lang="ts" setup>
import VSelect from './VSelect.vue';

const countries = [
  { key: 'United States', value: 'US' },
  { key: 'Canada', value: 'CA' },
  { key: 'United Kingdom', value: 'GB' },
  { key: 'Australia', value: 'AU' },
  { key: 'Germany', value: 'DE' },
  { key: 'France', value: 'FR' },
  { key: 'Japan', value: 'JP' },
  { key: 'China', value: 'CN' },
  { key: 'India', value: 'IN' },
  { key: 'Brazil', value: 'BR' },
  { key: 'Netherlands', value: 'NL' },
];

const selectedCountry = ref<string | undefined>();
const selectedCountries = ref<string[]>([]);
</script>

<template>
  <div class="form-field">
    <label>Single select</label>
    <VSelect
      v-model="selectedCountry"
      :options="countries"
      optionLabel="name"
    />
    <span>Selected country:
      <pre>{{ selectedCountry }}</pre>
    </span>
  </div>
  <div class="form-field">
    <label>Single select</label>
    <VSelect
      v-model="selectedCountries"
      :options="countries"
      optionLabel="name"
      multiple
    />
    <span>Selected countries:
      <pre>{{ selectedCountries.join(", ") }}</pre>
    </span>
  </div>
</template>
