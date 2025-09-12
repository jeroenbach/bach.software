<script lang="ts" setup>
import type { PostExampleProps } from '~/components/content/PostExampleProps';
import Example from '~/examples/post1/example1/Example.vue';

defineOptions({ inheritAttrs: false });
defineProps<PostExampleProps>();
</script>

<template>
  <Example />
</template>
