<script lang="ts" setup generic="TSingle extends string | undefined">
import type { Author } from "~/types/Author";

type TSingleOrMultiple = undefined extends TSingle ? Author[] : Author;

interface Props {
  userName?: TSingle;
}

const props = defineProps<Props>();

const uniqueId = computed(() => `authorsContext-${props.userName}`);

const emit = defineEmits<{
  (e: "load", authors: TSingleOrMultiple): void;
}>();

const { data: authors } = await useAsyncData(uniqueId.value, async () => {
  const query = queryContent<Author>("authors");

  if (props.userName) {
    query.where({ userName: { $eq: props.userName } });
  }

  return await query.find();
});

// Added a watch, to make sure SSR also works
watch(
  authors,
  (a) => emit("load", (props.userName ? a?.[0] : a) as TSingleOrMultiple),
  { immediate: true },
);
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
