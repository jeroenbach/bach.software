<script lang="ts" setup>
import type { TocLink } from '@nuxt/content';

interface Props {
  /**
   * The links to display, including their nested children
   */
  links: TocLink[]
  /**
   * The id of the link to highlight as currently active
   */
  activeId?: string
}

defineProps<Props>();

defineEmits<{
  select: [id: string]
}>();
</script>

<template>
  <ul class="space-y-2">
    <li v-for="link in links" :key="link.id">
      <a
        :href="`#${link.id}`"
        class="block leading-snug transition-colors hover:text-sky-600 dark:hover:text-sky-400"
        :class="link.id === activeId
          ? 'font-medium text-sky-600 dark:text-sky-400'
          : 'text-gray-500 dark:text-gray-400'"
        :aria-current="link.id === activeId ? 'location' : undefined"
        @click="$emit('select', link.id)"
      >
        {{ link.text }}
      </a>
      <TableOfContentsList
        v-if="link.children?.length"
        :links="link.children"
        :activeId="activeId"
        class="mt-2 ps-4"
        @select="$emit('select', $event)"
      />
    </li>
  </ul>
</template>
