import {
  useReadProgress,
  type ReadProgressOptions,
} from "~/composables/useReadProgress";
import { useTrackEvent } from "#imports";

export interface ReadProgressTrackingOptions extends ReadProgressOptions {
  /**
   * In case you don't want to track the actual event, like for demo purposes
   * */
  disableEventTracking?: boolean;
}

export type Progress =
  | "opened"
  | "peeked"
  | "quarter-read"
  | "half-read"
  | "three-quarter-read"
  | "read";

const getProgress = (percentage: number): Progress => {
  if (percentage >= 100) return "read";
  if (percentage >= 75) return "three-quarter-read";
  if (percentage >= 50) return "half-read";
  if (percentage >= 25) return "quarter-read";
  if (percentage >= 10) return "peeked";
  return "opened";
};

/**
 * Tracks the reading progress of a user based on scroll and time spent.
 * This composable is a wrapper around `useReadProgress` and adds tracking capabilities with plausible.io,
 * sending tracking events automatically.
 *
 * @param {ReadProgressTrackingOptions} [options={}] - Options for configuring read progress tracking.
 * @param {MaybeRefOrGetter<Record<string, any>>} [extraTrackingProps] - Additional properties to include in tracking events.
 * @returns {Object} An object containing the following properties:
 * - `hasRead`: A boolean indicating if the content has been read.
 * - `scrollPercentage`: A computed ref representing the scroll percentage.
 * - `timeSpentPercentage`: A computed ref representing the percentage of time spent.
 * - `timeSpent`: A computed ref representing the time spent.
 * - `timeProgress`: A computed ref representing the progress based on time spent.
 * - `scrollProgress`: A computed ref representing the progress based on scroll percentage.
 */
export const useReadProgressTracking = (
  options: ReadProgressTrackingOptions = {},
  extraTrackingProps?: MaybeRefOrGetter<Record<string, unknown>>,
) => {
  const {
    hasRead,
    scrollPercentage,
    timeSpentPercentage,
    timeSpent,
    minimumReadingTime,
  } = useReadProgress(options);

  const timeProgress = computed<Progress>(() =>
    getProgress(timeSpentPercentage.value),
  );
  const scrollProgress = computed<Progress>(() =>
    getProgress(scrollPercentage.value),
  );
  const totalProgress = computed<Progress>(() =>
    getProgress(Math.min(scrollPercentage.value, timeSpentPercentage.value)),
  );

  // Track progress changes
  watch(
    totalProgress,
    (progress, oldProgress) => {
      if (progress === oldProgress) return;

      if (options.disableEventTracking) return;

      const trackingProps = toValue(extraTrackingProps) ?? {};
      useTrackEvent(progress, {
        props: {
          scrolled: scrollProgress.value,
          timeSpend: timeProgress.value,
          ...trackingProps,
        },
      });
    },
    { immediate: true, flush: "sync" },
  );

  return {
    hasRead,
    scrollPercentage,
    timeSpentPercentage,
    timeSpent,
    timeProgress,
    scrollProgress,
    totalProgress,
    minimumReadingTime,
  };
};
