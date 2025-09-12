<script lang="ts" setup>
import type { PostExampleProps } from '~/components/content/PostExampleProps';
import Example from '~/examples/post2/example2/Parent.vue';

defineOptions({ inheritAttrs: false });
defineProps<PostExampleProps>();
</script>

<template>
  <Example />
</template>
