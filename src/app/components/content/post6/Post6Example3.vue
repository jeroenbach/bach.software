<script lang="ts" setup>
import type { PostExampleProps } from '~/components/content/PostExampleProps';
import Example from '~/examples/post6/example3/Example.vue';

defineOptions({ inheritAttrs: false });
defineProps<PostExampleProps>();
</script>

<template>
  <Example />
</template>
