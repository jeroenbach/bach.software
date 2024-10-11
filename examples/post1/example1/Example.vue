<script lang="ts" setup>
import MultiSelect, { type KeyValue } from "./MultiSelect.vue";
const countries: KeyValue[] = [
  { key: "United States", value: "US" },
  { key: "Canada", value: "CA" },
  { key: "United Kingdom", value: "GB" },
  { key: "Australia", value: "AU" },
  { key: "Germany", value: "DE" },
  { key: "France", value: "FR" },
  { key: "Japan", value: "JP" },
  { key: "China", value: "CN" },
  { key: "India", value: "IN" },
  { key: "Brazil", value: "BR" },
  { key: "Netherlands", value: "NL" },
];

const selectedCountry = ref<string | undefined>();
const selectedCountries = ref<string[]>([]);
</script>
<template>
  <div class="form-field">
    <label>Single select</label>
    <MultiSelect
      :options="countries"
      v-model="selectedCountry"
      optionLabel="name"
    />
    <span
      >Selected country:
      <pre>{{ selectedCountry }}</pre>
    </span>
  </div>
  <div class="form-field">
    <label>Single select</label>
    <MultiSelect
      :options="countries"
      v-model="selectedCountries"
      optionLabel="name"
      multiple
    />
    <span
      >Selected countries:
      <pre>{{ selectedCountries.join(", ") }}</pre>
    </span>
  </div>
</template>
