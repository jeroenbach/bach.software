<script lang="ts" setup>
import Example from "~/examples/post2/example1/Parent.vue";
import type { PostExampleProps } from "~/components/content/PostExampleProps";
defineProps<PostExampleProps>();
defineOptions({ inheritAttrs: false });
</script>
<template><Example /></template>
