<script lang="ts" setup>
import type { Props as AppLinkProps } from '~/components/AppLink.vue';

interface Props extends AppLinkProps {
  chipColor?: 'gray' | 'blue'
}

const props = defineProps<Props>();
</script>

<template>
  <AppLink v-bind="props">
    <AppChip :color="chipColor">
      <slot> {{ text }} </slot>
    </AppChip>
  </AppLink>
</template>
