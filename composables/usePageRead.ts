import { useDocumentVisibility, useScroll } from "@vueuse/core";
import { useStopWatch } from "./useStopWatch";

export type PageReadOptions = {
  /**
   * The percentage of the page that needs to be scrolled to be considered read.
   * @default 70
   */
  scrollThreshold?: number;
  /**
   * The percentage of the minimum time that needs to be spent to be considered read.
   * The minimum time is calculated by the word count.
   * @default 70
   */
  timeThreshold?: number;
  /** The number of words on the page */
  wordCount?: number;
  /**
   * The minimum time in milliseconds that needs to be spent even if the calculated minimum time based
   * on the word count is lower.
   * @default 30_000
   */
  minimumTime?: number;
  /** The interval in milliseconds to update the read status @default 500 */
  updateInterval?: number;
};

export type PageReadReturn = {
  /** Indicates whether the user has read the page */
  hasRead: Ref<boolean>;
  /** The percentage of the page that has been scrolled */
  percentageScrolled: Ref<number>;
  /** The time spent on the page in milliseconds */
  timeSpent: Ref<number>;
};

export const usePageRead = (options: PageReadOptions = {}): PageReadReturn => {
  const _options = {
    scrollThreshold: 70,
    timeThreshold: 70,
    wordCount: 0,
    minimumTime: 30_000,
    updateInterval: 500,
    ...options,
  };

  // If we are not in the browser, return default values
  if (!import.meta.client)
    return {
      hasRead: ref(false),
      percentageScrolled: ref(0),
      timeSpent: ref(0),
    };

  const visibility = useDocumentVisibility();

  // We use the updateInterval to make sure the value's are only calculated every x milliseconds
  const { y: scrollY } = useScroll(window, {
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

  // Calculate how far the user has scrolled
  const percentageScrolled = ref(0);
  watch(
    scrollY,
    () => {
      const element = document.documentElement;
      const scrollHeight = element.scrollHeight - element.clientHeight;
      const currentScrollPercentage = Math.round(
        (scrollY.value / scrollHeight) * 100,
      );
      if (percentageScrolled.value < currentScrollPercentage) {
        percentageScrolled.value = currentScrollPercentage;
      }
    },
    {
      immediate: true,
      flush: "sync",
    },
  );

  // Medium.com uses roughly 275 words per minute as a reading speed.
  // If we know the word count, we can adjust the minimum time accordingly
  // by dividing the words by the average reading speed per second.
  // Reading time can never be less then the minimumTime (which is by default 30 seconds).
  const adjustedMinimumTime = Math.max(
    _options.minimumTime,
    (_options.wordCount / 275) * 60 * 1000, // milliseconds
  );

  const hasRead = computed(() => {
    // We consider the page read if the user has spent the indicated percentages of time and scroll
    const minimumTimeReached =
      timeSpent.value >= (adjustedMinimumTime * _options.timeThreshold) / 100;
    const minimumScrollReached =
      percentageScrolled.value >= _options.scrollThreshold;

    return minimumTimeReached && minimumScrollReached;
  });

  return {
    hasRead,
    percentageScrolled,
    timeSpent,
  };
};
