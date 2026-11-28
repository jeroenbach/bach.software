import type { Component, Ref, VNode } from 'vue';
import type { Message } from '~/composables/useMessageStore';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { onTestFinished } from 'vitest';
import { defineComponent, h, ref } from 'vue';
import MessageBar from '~/components/MessageBar.vue';
import MessageBarOutlet from '~/components/MessageBarOutlet.vue';
import { useMessageStore } from '~/composables/useMessageStore';
import MessageBarContext from '~/contexts/MessageBarContext.vue';

interface HarnessOptions {
  /** Props passed to the component under test. */
  props?: Record<string, unknown>
  /** Slots passed to the component under test. */
  slots?: Record<string, () => VNode | VNode[] | string>
  /** A component that sets up before the outlet does. */
  before?: Component
}

/**
 * Mounts a component the way the app root does: inside the message context, next
 * to one outlet and a bar for every message in the store. Tests can then assert
 * what a visitor would see, not only what the store holds.
 */
export async function mountWithMessageBars(component: Component, options: HarnessOptions = {}) {
  const visible = ref(true);
  let messages!: Ref<Message[]>;
  let close!: (messageId: number) => void;
  let clearAll!: () => void;

  const host = defineComponent({
    setup() {
      ({ messages, close, clearAll } = useMessageStore());
      return () => h(MessageBarContext, null, {
        default: () => [
          options.before ? h(options.before) : undefined,
          h(MessageBarOutlet),
          ...messages.value.map(({ messageId, ...message }) => h(MessageBar, {
            ...message,
            key: messageId,
            baseDataTestid: `message-bar-${messageId}`,
            onClose: () => close(messageId),
          })),
          visible.value ? h(component, options.props, options.slots) : undefined,
        ],
      });
    },
  });

  const wrapper = await mountSuspended(host, {
    attachTo: document.body,
    // The real transition runs its leave hooks, so a dismissal is flagged as closed.
    global: { stubs: { transition: false } },
  });
  onTestFinished(() => {
    wrapper.unmount();
    clearAll();
  });

  return {
    wrapper,
    messages,
    /** Unmounts only the component under test; the outlet and bars stay. */
    unmountComponent: () => {
      visible.value = false;
    },
  };
}

export const renderedAlerts = () => Array.from(document.body.querySelectorAll<HTMLElement>('[role="alert"]'));

export const fixedOutlet = () => document.body.querySelector<HTMLElement>('[data-message-outlet$="-fixed"]')!;
