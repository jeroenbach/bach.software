<script lang="ts" setup>
const { id, slug } = useRoute().params;
</script>
<template>
  <!-- add the medium styles and also have a look at https://feather.so/blog/medium-alternatives-->
  <div class="prose dark:prose-invert">
    <ContentDoc :path="`/posts/${id}`" />
  </div>
</template>
