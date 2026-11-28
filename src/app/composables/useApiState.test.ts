import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope, nextTick, ref } from 'vue';
import { deferred, kiotaError } from '~/tests/helpers/apiErrors';
import { translate } from '~/tests/helpers/translate';
import { useApiState } from './useApiState';
import { createPinia, setActivePinia } from './useDestructiblePinia';
import { useMessageStore } from './useMessageStore';

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string, params?: Record<string, unknown>) => translate(key, params) }) }));

const unexpected = 'Something went wrong. Please try again later.';

function arrange<Data, Params extends any[] = []>(
  call: (...args: Params) => Promise<Data>,
  options: Parameters<typeof useApiState<Data, Params>>[2] = {},
) {
  const { messages } = useMessageStore();
  const scope = effectScope();
  const api = scope.run(() => useApiState(call, undefined as Data, options))!;
  return { messages, scope, ...api };
}

describe('useApiState', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('execution', () => {
    it('should not call on setup by default', () => {
      const call = vi.fn(async () => 'data');

      arrange(call);

      expect(call).not.toHaveBeenCalled();
    });

    it('should call on setup when immediate is set', async () => {
      const call = vi.fn(async () => 'data');

      const { state } = arrange(call, { immediate: true });

      await vi.waitFor(() => expect(state.value).toBe('data'));
      expect(call).toHaveBeenCalledOnce();
    });

    it('should return the data, call onSuccess and report nothing after a successful call', async () => {
      const onSuccess = vi.fn();
      const { messages, executeNow, state, isSuccessful } = arrange(async () => 'data', { onSuccess });

      const result = await executeNow();

      expect(result).toBe('data');
      expect(state.value).toBe('data');
      expect(isSuccessful.value).toBe(true);
      expect(onSuccess).toHaveBeenCalledWith('data', []);
      expect(messages.value).toHaveLength(0);
    });

    it('should pass the arguments of the call along and remember them', async () => {
      const call = vi.fn(async (id: number) => `item ${id}`);
      const { executeNow, lastParams } = arrange(call);

      await executeNow(7);

      expect(call).toHaveBeenCalledWith(7);
      expect(lastParams.value).toEqual([7]);
    });

    it('should feed mapData into mappedState and re-derive it when the state changes', async () => {
      let next = 1;
      const { executeNow, mappedState } = arrange(async () => next++, { mapData: (data: number) => data * 10 });
      await executeNow();
      expect(mappedState.value).toBe(10);

      await executeNow();
      expect(mappedState.value).toBe(20);
    });

    it('should reset the state to its initial value', async () => {
      const { executeNow, reset, state } = arrange(async () => 'data');
      await executeNow();

      reset();

      expect(state.value).toBeUndefined();
    });
  });

  describe('failures', () => {
    it('should resolve to null, report the error and call onError with the description and field errors', async () => {
      const onError = vi.fn();
      const error = kiotaError(400, { errors: { url: ['urlRequired'] } });
      const { messages, executeNow, isSuccessful } = arrange(async () => {
        throw error;
      }, { onError });

      const result = await executeNow();

      expect(result).toBeNull();
      expect(isSuccessful.value).toBe(false);
      expect(onError).toHaveBeenCalledWith(
        'Some of the input is not valid.',
        [],
        error,
        [{ label: 'url', values: ['A URL is required.'] }],
      );
      expect(messages.value).toHaveLength(1);
    });

    it('should never throw into the caller', async () => {
      const { executeNow } = arrange(async () => {
        throw new TypeError('Failed to fetch');
      });

      await expect(executeNow()).resolves.toBeNull();
    });

    it('should resolve a 404 to success without reporting anything', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();
      const { messages, executeNow, isSuccessful } = arrange(async () => {
        throw kiotaError(404);
      }, { onSuccess, onError });

      const result = await executeNow();

      expect(result).toBeNull();
      expect(isSuccessful.value).toBe(true);
      expect(onSuccess).toHaveBeenCalledWith(null, []);
      expect(onError).not.toHaveBeenCalled();
      expect(messages.value).toHaveLength(0);
    });

    it('should report nothing but still call onError when reporting is turned off', async () => {
      const onError = vi.fn();
      const error = kiotaError(400, { errors: { url: ['urlRequired'] } });
      const { messages, executeNow, isSuccessful } = arrange(async () => {
        throw error;
      }, { onError, reportErrors: false });

      const result = await executeNow();

      expect(result).toBeNull();
      expect(isSuccessful.value).toBe(false);
      expect(onError).toHaveBeenCalledWith(
        'Some of the input is not valid.',
        [],
        error,
        [{ label: 'url', values: ['A URL is required.'] }],
      );
      expect(messages.value).toHaveLength(0);
    });

    it('should clear a stale error before the retry runs', async () => {
      const retry = deferred<string>();
      const call = vi.fn()
        .mockRejectedValueOnce(kiotaError(500))
        .mockReturnValueOnce(retry.promise);
      const { messages, executeNow } = arrange(call);
      await executeNow();
      expect(messages.value.map(x => x.description)).toEqual([unexpected]);

      const retrying = executeNow();

      expect(messages.value).toHaveLength(0);
      retry.resolve('data');
      await retrying;
      expect(messages.value).toHaveLength(0);
    });
  });

  describe('success message', () => {
    it('should report a persisted success message from a string', async () => {
      const { messages, executeNow } = arrange(async () => 'data', { successMessage: 'Saved' });

      await executeNow();
      await nextTick();

      expect(messages.value[0]).toMatchObject({ severity: 'success', description: 'Saved', persist: true });
    });

    it('should report a persisted success message from a function of the result and params', async () => {
      const { messages, executeNow } = arrange(
        async (id: number) => `item ${id}`,
        { successMessage: (result, params) => `Saved ${result} (${params})` },
      );

      await executeNow(3);
      await nextTick();

      expect(messages.value[0]!.description).toBe('Saved item 3 (3)');
    });
  });

  describe('polling', () => {
    it('should repeat the call after the polling interval while pollWhile holds', async () => {
      vi.useFakeTimers();
      const call = vi.fn(async () => 'pending');
      arrange(call, { immediate: true, pollWhile: result => result === 'pending', pollingInterval: 1000 });
      await vi.advanceTimersByTimeAsync(0);
      expect(call).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(1000);
      expect(call).toHaveBeenCalledTimes(2);

      await vi.advanceTimersByTimeAsync(1000);
      expect(call).toHaveBeenCalledTimes(3);
    });

    it('should never start a second call while one is pending', async () => {
      vi.useFakeTimers();
      const pending = deferred<string>();
      const call = vi.fn(() => pending.promise);
      arrange(call, { immediate: true, pollWhile: () => true, pollingInterval: 1000 });

      await vi.advanceTimersByTimeAsync(10_000);

      expect(call).toHaveBeenCalledTimes(1);
    });

    it('should stop when pollWhile returns false', async () => {
      vi.useFakeTimers();
      const results = ['pending', 'done'];
      const call = vi.fn(async () => results.shift()!);
      const { isPolling } = arrange(call, { immediate: true, pollWhile: result => result === 'pending', pollingInterval: 1000 });

      await vi.advanceTimersByTimeAsync(10_000);

      expect(call).toHaveBeenCalledTimes(2);
      expect(isPolling.value).toBe(false);
    });

    it('should stop after the owning scope is disposed', async () => {
      vi.useFakeTimers();
      const call = vi.fn(async () => 'pending');
      const { scope } = arrange(call, { immediate: true, pollWhile: () => true, pollingInterval: 1000 });
      await vi.advanceTimersByTimeAsync(1000);
      const callsBefore = call.mock.calls.length;

      scope.stop();
      await vi.advanceTimersByTimeAsync(10_000);

      expect(call).toHaveBeenCalledTimes(callsBefore);
    });

    it('should stop and resume on request', async () => {
      vi.useFakeTimers();
      const call = vi.fn(async () => 'pending');
      const { pausePolling, resumePolling } = arrange(call, { pollWhile: () => true, pollingInterval: 1000 });

      resumePolling();
      await vi.advanceTimersByTimeAsync(1000);
      expect(call).toHaveBeenCalledTimes(2);

      pausePolling();
      await vi.advanceTimersByTimeAsync(5000);
      expect(call).toHaveBeenCalledTimes(2);
    });
  });

  describe('executeWhen', () => {
    it('should defer the first run until the source turns true and run once', async () => {
      const ready = ref(false);
      const call = vi.fn(async () => 'data');
      arrange(call, { executeWhen: ready });
      await nextTick();
      expect(call).not.toHaveBeenCalled();

      ready.value = true;
      await vi.waitFor(() => expect(call).toHaveBeenCalledOnce());
      ready.value = false;
      await nextTick();
      ready.value = true;
      await nextTick();

      expect(call).toHaveBeenCalledOnce();
    });
  });
});
