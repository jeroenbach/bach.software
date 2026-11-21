import type { UseAsyncStateOptions } from '@vueuse/core';
import type { WatchSource } from 'vue';
import type { ApiErrorReporterOptions } from '~/composables/useApiErrorReporter';
import type { MessageDetail } from '~/composables/useMessageStore';
import { tryOnScopeDispose, useAsyncState } from '@vueuse/core';
import { computed, nextTick, ref, watch } from 'vue';
import { useApiErrorReporter } from '~/composables/useApiErrorReporter';

const defaultPollingInterval = 5000;

export interface UseApiStateOptions<
  Shallow extends boolean,
  Data = any,
  Params = any,
  Mapped = any,
> extends UseAsyncStateOptions<Shallow, Data>,
  ApiErrorReporterOptions {
  /**
   * While this returns true for the last result, the call is repeated after
   * every `pollingInterval`. The interval starts when the previous call
   * finishes, so calls never overlap.
   */
  pollWhile?: (result: Data) => boolean
  /** Milliseconds between the end of one call and the start of the next poll. */
  pollingInterval?: number
  /** Reported as a success message after the call completes; persists past unmount. */
  successMessage?: string | ((result?: Data, params?: Params) => string)
  /** Defer the first execution until this source becomes true (runs once). */
  executeWhen?: WatchSource<boolean>
  onError?: (
    description: unknown,
    params?: Params,
    error?: unknown,
    fieldErrors?: MessageDetail[],
  ) => void
  onSuccess?: (data: Data, params?: Params) => void
  /** Derives `mappedState` from the raw API response. */
  mapData?: (data: Data) => Mapped
}

/**
 * The one way we call the backend: wraps VueUse's `useAsyncState` around a
 * Kiota-generated client call, so every request gets the same error handling
 * (problem-details parsing, error-code translation, reporting to the message
 * store) and optional polling.
 *
 * Differences from plain `useAsyncState`:
 * - `immediate` defaults to false; data fetches opt in, commands never run on setup.
 * - errors never throw into the component: they are reported, `onError` fires,
 *   and the call resolves to null.
 * - a 404 resolves to null without being reported (see useApiErrorReporter).
 *
 * The returned object has a `then` (from `useAsyncState`); never spread it into
 * something that gets awaited.
 *
 * @see https://vueuse.org/useAsyncState
 */
export function useApiState<
  Data,
  Params extends any[] = [],
  Shallow extends boolean = true,
  Mapped = Data,
>(
  call: Promise<Data> | ((...args: Params) => Promise<Data>),
  initialState: Data = undefined as Data,
  options: UseApiStateOptions<Shallow, Data, Params, Mapped> = {},
) {
  const {
    pollWhile = () => false,
    pollingInterval = defaultPollingInterval,
    successMessage,
    executeWhen,
    onError = () => {},
    onSuccess = () => {},
    mapData = data => data as unknown as Mapped,
  } = options;

  const { reportError, reportSuccess, clear } = useApiErrorReporter(options);

  const isSuccessful = ref(false);
  const hasExecuted = ref(false);
  const lastParams = ref<Params>();

  // Our error handling lives in this wrapper; useAsyncState only orchestrates it.
  const run = async (...args: Params) => {
    isSuccessful.value = false;
    clear(); // a re-execution invalidates whatever the previous one reported
    lastParams.value = args;

    try {
      const response = await (typeof call === 'function' ? call(...args) : call);
      hasExecuted.value = true;

      if (successMessage) {
        const description
          = typeof successMessage === 'function'
            ? successMessage(response, args)
            : successMessage;
        // Persist: the success of a save should outlive the dialog that triggered it.
        reportSuccess(description, { persist: true });
      }

      isSuccessful.value = true;
      onSuccess(response, args);
      return response;
    }
    catch (error) {
      const outcome = await reportError(error);

      if (outcome.status === 'notFound') {
        // "It does not exist" is a valid answer, not a failure.
        isSuccessful.value = true;
        onSuccess(null as Data, args);
      }
      else if (outcome.status === 'error') {
        onError(outcome.description, args, error, outcome.validationErrors);
      }
      // 'redirected' needs nothing further; the reporter already navigated.

      return null;
    }
  };

  const { isLoading, isReady, execute, state, then } = useAsyncState(
    run,
    initialState,
    {
      ...options,
      immediate: false, // execution always goes through the polling loop below
      onSuccess: () => {},
      onError: () => {},
    },
  );

  const mappedState = computed(() => mapData(state.value as Data));

  // The polling loop doubles as the immediate runner: the first iteration is the
  // initial call, and `pollWhile` decides per result whether another follows.
  // Re-polls reuse the parameters of the last execution.
  const isPolling = ref(false);
  let pollTimer: ReturnType<typeof setTimeout> | undefined;

  const poll = async () => {
    if (!isPolling.value)
      return;
    const result = await execute(options.delay, ...(lastParams.value ?? ([] as unknown as Params)));
    if (!isPolling.value)
      return; // paused while the call was in flight

    if (pollWhile(result as Data))
      pollTimer = setTimeout(poll, pollingInterval);
    else isPolling.value = false;
  };

  const resumePolling = () => {
    if (isPolling.value)
      return;
    isPolling.value = true;
    poll();
  };

  const pausePolling = () => {
    isPolling.value = false;
    clearTimeout(pollTimer);
  };

  tryOnScopeDispose(pausePolling);

  if (options.immediate)
    resumePolling();

  // `executeWhen` defers the immediate execution until a condition holds
  // (e.g. a feature flag loaded, a parent id became available). Runs once.
  if (executeWhen) {
    const unwatch = watch(
      executeWhen,
      async (ready) => {
        if (!ready || hasExecuted.value)
          return;
        resumePolling();
        // With immediate: true the watcher can fire before `unwatch` exists.
        await nextTick();
        unwatch();
      },
      { immediate: true },
    );
  }

  return {
    isLoading,
    isReady,
    state,
    /** `state` passed through the `mapData` option. */
    mappedState,
    isSuccessful,
    execute,
    executeNow: (...args: Params) => execute(0, ...args),
    lastParams,
    then,
    isPolling,
    resumePolling,
    pausePolling,
    reset: () => {
      state.value = initialState;
    },
  };
}
