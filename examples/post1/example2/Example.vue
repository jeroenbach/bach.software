<script lang="ts" setup>
import MultiSelect from "./MultiSelect.vue";
type Country = { id: number; name: string; code: string };
const countries: Country[] = [
  { id: 1, name: "United States", code: "US" },
  { id: 2, name: "Canada", code: "CA" },
  { id: 3, name: "United Kingdom", code: "GB" },
  { id: 4, name: "Australia", code: "AU" },
  { id: 5, name: "Germany", code: "DE" },
  { id: 6, name: "France", code: "FR" },
  { id: 7, name: "Japan", code: "JP" },
  { id: 8, name: "China", code: "CN" },
  { id: 9, name: "India", code: "IN" },
  { id: 10, name: "Brazil", code: "BR" },
  { id: 11, name: "Netherlands", code: "NL" },
];

const selectedCountry = ref<string | undefined>();
const selectedCountries = ref<number[]>([]);
</script>
<template>
  <div class="form-field">
    <label>Single select</label>
    <MultiSelect
      :options="countries"
      v-model="selectedCountry"
      optionLabel="name"
      optionValue="code"
    />
    <span>
      Selected country:
      <pre>{{ selectedCountry }}</pre>
    </span>
  </div>
  <div class="form-field">
    <label>Multiple select</label>
    <MultiSelect
      :options="countries"
      v-model="selectedCountries"
      optionLabel="name"
      optionValue="id"
      multiple
    />
    <span>
      Selected countries:
      <pre>{{ selectedCountries.join(", ") }}</pre>
    </span>
  </div>
</template>
