import type { Ref } from 'vue';
import type { Message } from '~/composables/useMessageStore';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { onTestFinished } from 'vitest';
import { defineComponent, h } from 'vue';
import { useMessageStore } from '~/composables/useMessageStore';

type Results<T extends Array<() => unknown>> = { [K in keyof T]: ReturnType<T[K]> };

/**
 * Calls the given context composables inside a real component, so lifecycle hooks
 * (unmount cleanup, scope disposal) have an owner, and exposes the shared messages.
 */
export async function mountWithContexts<T extends Array<() => unknown>>(...contexts: T) {
  let messages!: Ref<Message[]>;
  let clearAll!: () => void;
  let results!: Results<T>;

  const host = defineComponent({
    setup() {
      ({ messages, clearAll } = useMessageStore());
      results = contexts.map(context => context()) as Results<T>;
      return () => h('div');
    },
  });

  const wrapper = await mountSuspended(host);
  onTestFinished(() => {
    wrapper.unmount();
    clearAll();
  });
  return { wrapper, messages, results };
}
