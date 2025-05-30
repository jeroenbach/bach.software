export const useAsyncStateWithErrorHandling = <T>(
  asyncFunction: () => Promise<T>,
) => {
  const state = ref<T | null>(null);
  const error = ref<Error | null>(null);
  const loading = ref<boolean>(true);

  const execute = async () => {
    loading.value = true;
    error.value = null;
    try {
      state.value = await asyncFunction();
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
    } finally {
      loading.value = false;
    }
  };

  return {
    state,
    error,
    loading,
    execute,
  };
};
