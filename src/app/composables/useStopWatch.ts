import { useIntervalFn } from "@vueuse/core";
import { ref } from "vue";

/**
 * Options for configuring the stopwatch behavior
 */
export type StopWatchOptions = {
  /** The interval in milliseconds between timer updates (default: 100) */
  interval?: number;
  /** Whether the timer should start immediately (default: true) */
  immediate?: boolean;
};

export const useStopWatch = (options: StopWatchOptions = {}) => {
  const _options = {
    interval: 100,
    immediate: false,
    ...options,
  };
  const timer = ref(0);
  const { pause, resume, isActive } = useIntervalFn(
    () => {
      timer.value += _options.interval;
    },
    _options.interval,
    { immediate: _options.immediate },
  );

  return {
    pause,
    resume,
    isActive,
    timer,
  };
};
