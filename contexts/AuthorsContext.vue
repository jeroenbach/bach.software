<script lang="ts" setup generic="TSingle extends string | undefined">
import type { Author } from "~/types/Author";

type TSingleOrMultiple = undefined extends TSingle ? Author[] : Author;

interface Props {
  userName?: TSingle;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "load", authors: TSingleOrMultiple): void;
}>();

const { data: authors } = await useAsyncData("authors", async () => {
  const query = queryContent<Author>("authors");

  if (props.userName) {
    query.where({ userName: { $eq: props.userName } });
  }

  const results = await query.find();

  emit("load", (props.userName ? results?.[0] : results) as TSingleOrMultiple);

  return results;
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
