<script lang="ts" setup>
import type { Props as AppLinkProps } from '~/components/AppLink.vue';

interface Props extends AppLinkProps {
  chipColor?: 'gray' | 'blue'
}

defineProps<Props>();
</script>

<template>
  <AppLink
    :to="to"
    :text="text"
    :color="color"
    :target="target"
    :title="title"
    :ariaLabel="ariaLabel"
  >
    <AppChip :color="chipColor">
      <slot> {{ text }} </slot>
    </AppChip>
  </AppLink>
</template>
