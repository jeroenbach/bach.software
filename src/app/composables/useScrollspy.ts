import type { MaybeRefOrGetter, Ref } from 'vue';
import { useScroll } from '@vueuse/core';
import { getCurrentInstance, onMounted, ref, toValue, watch } from 'vue';

export interface ScrollspyOptions {
  /**
   * Distance in pixels from the top of the viewport at which a heading is
   * considered "active". Should be slightly larger than the scroll-padding-top
   * of the page, so a heading becomes active right after jumping to it.
   * @default 104
   */
  offset?: number
  /** The interval in milliseconds to re-evaluate the active heading while scrolling @default 100 */
  throttle?: number
}

export interface Scrollspy {
  /** The id of the heading currently in view, undefined while above the first heading */
  activeId: Ref<string | undefined>
}

/**
 * Tracks which section of the page is currently in view, based on the ids of
 * the section headings. The active heading is the last one that has scrolled
 * past the offset line at the top of the viewport.
 *
 * @param ids - The ids of the headings to track, in document order.
 * @param options - Configuration options for the scrollspy.
 * @returns The id of the currently active heading.
 */
export function useScrollspy(ids: MaybeRefOrGetter<string[]>, options: ScrollspyOptions = {}): Scrollspy {
  const activeId = ref<string>();

  // If we are not in the browser, return default values
  if (!import.meta.client) {
    return { activeId };
  }

  const { offset = 104, throttle = 100 } = options;
  const { y: scrollY } = useScroll(window, { throttle });

  const update = () => {
    let current: string | undefined;
    for (const id of toValue(ids)) {
      const element = document.getElementById(id);
      if (!element)
        continue;
      // Headings are in document order, so we can stop at the first one below the offset line
      if (element.getBoundingClientRect().top > offset)
        break;
      current = id;
    }
    activeId.value = current;
  };

  watch([scrollY, () => toValue(ids)], update, { immediate: true, flush: 'sync' });

  // The headings only exist in the DOM after mounting
  if (getCurrentInstance()) {
    onMounted(update);
  }

  return { activeId };
}
