<script lang="ts" setup>
import type { Author } from "~/types/Author";

interface Props {
  userName?: string;
}

const props = defineProps<Props>();

defineEmits<{
  (e: "load", authors: Author[]): void;
}>();

const { data: authors } = await useAsyncData("authors", async () => {
  const query = queryContent<Author>("authors");

  if (props.userName) {
    query.where({ userName: { $eq: props.userName } });
  }

  return await query.find();
});
</script>
<template>
  <slot :authors="authors" />
  <slot
    name="author"
    v-for="author in authors"
    :key="author.userName"
    :author="author"
  />
</template>
