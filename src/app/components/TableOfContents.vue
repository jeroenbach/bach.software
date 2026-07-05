<script lang="ts" setup>
import type { TocLink } from '@nuxt/content';
import { ChevronRightIcon } from '@heroicons/vue/24/outline';

interface Props {
  /**
   * The table of contents links to display (e.g. post.body.toc.links)
   */
  links: TocLink[]
  /**
   * The id of the section currently in view, which gets highlighted
   */
  activeId?: string
  /**
   * Renders the table of contents as a disclosure that is collapsed by
   * default, so it doesn't take up space on small screens
   */
  collapsible?: boolean
}

defineProps<Props>();

const emit = defineEmits<{
  select: [id: string]
}>();

const open = ref(false);

function select(id: string) {
  // Collapse the disclosure again after jumping, so it doesn't obstruct the content
  open.value = false;
  emit('select', id);
}
</script>

<template>
  <nav :aria-label="$t('On this page')" class="text-sm">
    <details
      v-if="collapsible"
      :open="open"
      class="rounded-lg border border-gray-200 dark:border-gray-500"
      @toggle="open = ($event.target as HTMLDetailsElement).open"
    >
      <summary
        class="flex cursor-pointer select-none items-center gap-1 px-3 py-2 font-medium text-gray-700 marker:hidden dark:text-gray-300 [&::-webkit-details-marker]:hidden"
      >
        <ChevronRightIcon
          class="size-4 transition-transform"
          :class="{ 'rotate-90': open }"
        />
        {{ $t("On this page") }}
      </summary>
      <TableOfContentsList
        :links="links"
        :activeId="activeId"
        class="px-3 pb-3 pt-1"
        @select="select"
      />
    </details>
    <template v-else>
      <p class="mb-3 font-medium text-gray-700 dark:text-gray-300">
        {{ $t("On this page") }}
      </p>
      <TableOfContentsList
        :links="links"
        :activeId="activeId"
        @select="select"
      />
    </template>
  </nav>
</template>
