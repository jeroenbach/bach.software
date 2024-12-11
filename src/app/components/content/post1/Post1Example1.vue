<script lang="ts" setup>
import Example from "~/examples/post1/example1/Example.vue";
import type { PostExampleProps } from "~/components/content/PostExampleProps";
defineProps<PostExampleProps>();
defineOptions({ inheritAttrs: false });
</script>
<template><Example /></template>
