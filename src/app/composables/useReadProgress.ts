import { useDocumentVisibility, useScroll } from "@vueuse/core";

import { useStopWatch } from "@/composables/useStopWatch";

export type ReadProgressOptions = {
  /** The number of words on the page */
  wordCount?: number;
  /**
   * The amount of time the reader needs to read the article in ms.
   * This is used to calculate the time spent percentage.
   * If not provided, it will be calculated based on the word count and average reading speed.
   */
  readingTime?: number;
  /**
   * The average reading speed in words per minute
   * Medium.com uses roughly 275 words per minute as a reading speed.
   * @default 275
   */
  averageReadingSpeed?: number;
  /**
   * The minimum time in milliseconds that needs to be spent even if the calculated minimum time based
   * on the word count is lower.
   * @default 30_000
   */
  minimumTime?: number;
  /** The interval in milliseconds to update the read status @default 500 */
  updateInterval?: number;
};

export type ReadProgress = {
  /** Indicates whether the user has read the page */
  hasRead: Ref<boolean>;
  /** The percentage of the page that has been scrolled */
  scrollPercentage: Ref<number>;
  /** The percentage of the time spent compared to the time it takes to read the article */
  timeSpentPercentage: Ref<number>;
  /** The time spent on the page in milliseconds */
  timeSpent: Ref<number>;
  /** The time needed to read the page in milliseconds */
  minimumReadingTime: number;
};

/**
 * Tracks the read progress of a page based on scroll position and time spent.
 *
 * @param options - Configuration options for tracking read progress.
 * @returns An object representing the read progress.
 */
export const useReadProgress = (
  options: ReadProgressOptions = {},
): ReadProgress => {
  const _options = {
    wordCount: 0,
    minimumTime: 30_000,
    averageReadingSpeed: 275,
    updateInterval: 500,
    ...options,
  };

  // If we are not in the browser, return default values
  if (!import.meta.client)
    return {
      hasRead: ref(false),
      scrollPercentage: ref(0),
      timeSpentPercentage: ref(0),
      timeSpent: ref(0),
      minimumReadingTime: 0,
    };

  const visibility = useDocumentVisibility();
  const { y: scrollY } = useScroll(window, {
    // We use the updateInterval to make sure the value's are only calculated every x milliseconds
    throttle: _options.updateInterval,
  });

  const {
    pause,
    resume,
    timer: timeSpent,
  } = useStopWatch({
    interval: _options.updateInterval,
    immediate: true,
  });

  // Only activate the timer when the page is visible
  watch(
    visibility,
    () => {
      if (visibility.value === "visible") {
        resume();
      } else {
        pause();
      }
    },
    { immediate: true, flush: "sync" },
  );

  // Calculate how far the user has scrolled down
  const scrollPercentage = ref(0);
  watch(
    scrollY,
    () => {
      const element = document.documentElement;
      const scrollingSpace = Math.max(
        element.scrollHeight - element.clientHeight,
        0,
      );
      const currentScrollPercentage = (scrollY.value / scrollingSpace) * 100;
      if (isNaN(currentScrollPercentage)) {
        // In case we can't scroll, we set the percentage to 100
        scrollPercentage.value = 100;
      } else if (scrollPercentage.value < currentScrollPercentage) {
        scrollPercentage.value = currentScrollPercentage;
      }
    },
    { immediate: true, flush: "sync" },
  );

  // If a readingTime is specified, we use that value, otherwise we calculate it based on the word count
  // and the average reading speed.
  let minimumReadingTime =
    _options.readingTime ??
    (_options.wordCount / _options.averageReadingSpeed) * 60 * 1000; // milliseconds

  // Reading time can never be less then the minimumTime (which is by default 30 seconds).
  minimumReadingTime = Math.max(_options.minimumTime, minimumReadingTime);

  const timeSpentPercentage = computed(() =>
    Math.min(100, (timeSpent.value / minimumReadingTime) * 100),
  );

  const hasRead = computed(
    () => timeSpentPercentage.value >= 100 && scrollPercentage.value >= 100,
  );

  return {
    hasRead,
    scrollPercentage,
    timeSpentPercentage,
    timeSpent,
    minimumReadingTime,
  };
};
