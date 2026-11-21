import { tryOnUnmounted } from '@vueuse/core';
import { computed, nextTick, ref } from 'vue';
import { defineDestructibleStore } from '~/composables/useDestructiblePinia';

export const MessageDuration = {
  short: 2000,
  medium: 5000,
  long: 10000,
  untilClosed: 0,
} as const;

/** One line of extra detail under a message, e.g. a field with its errors. */
export interface MessageDetail {
  label?: string
  values: string[]
  indent?: boolean
}

export interface MessageOptions {
  /** Auto-close after this many milliseconds; 0 keeps the message until closed. */
  closeIn?: number
  /** Stick the message to the top of the viewport. */
  sticky?: boolean
  /** Float the message in the top-right corner. */
  fixed?: boolean
  /** Whether the user can dismiss the message. Default: true. */
  isClosable?: boolean
  /** Dismiss on a click anywhere in the bar, not just the close button. Default: true. */
  closeOnClick?: boolean
  /**
   * Messages normally disappear when the component that added them unmounts.
   * Set this to keep the message alive past that lifecycle (e.g. "saved"
   * confirmations added from a dialog that closes itself).
   */
  persist?: boolean
  /** Messages sharing a group key collapse into a single bar. */
  group?: string
  /** Heading of the collapsed bar; pass a translated string. */
  groupMessage?: string
  /** Drop the message if an identical one is already showing. */
  addOnce?: boolean
}

export interface Message extends MessageOptions {
  messageId: number
  severity?: 'info' | 'warning' | 'error' | 'success'
  description?: string
  details?: MessageDetail[]
  closed?: boolean
}

interface StoredMessage extends Message {
  /** Which useMessageStore() instance added it; used for unmount cleanup. */
  instanceId?: number
}

function isSameMessage(stored: StoredMessage, severity: Message['severity'], description: string, details: MessageDetail[] | undefined) {
  return !stored.closed
    && stored.severity === severity
    && stored.description === description
    && JSON.stringify(stored.details ?? []) === JSON.stringify(details ?? []);
}

/**
 * The shared store stays private: every consumer goes through useMessageStore(),
 * which scopes cleanup to the component that added the messages.
 * Defined as a destructible store, so the destructures below keep their reactivity.
 */
const useSharedMessageStore = defineDestructibleStore('message', () => {
  let nextMessageId = 0;
  let nextInstanceId = 0;
  const disposedInstances = new Set<number>();
  const stored = ref<StoredMessage[]>([]);

  const messages = computed(() =>
    stored.value.map(({ instanceId: _omitted, ...message }) => message as Message),
  );

  const addMessage = async (
    instanceId: number,
    description: string,
    details: MessageDetail[] | undefined,
    severity: Message['severity'],
    options: MessageOptions = {},
  ) => {
    // When a dialog closes, its MessageBarOutlet only unregisters on the next
    // tick. Waiting here makes sure a message added during the close lands in
    // the outlet that remains, instead of in the one about to disappear.
    await nextTick();

    // A request that fails after its component unmounted has nobody left to
    // clear the message, so it would linger on an unrelated page.
    if (!options.persist && disposedInstances.has(instanceId))
      return;

    if (options.addOnce && stored.value.some(x => isSameMessage(x, severity, description, details)))
      return;

    const groupHead = options.group
      ? stored.value.find(x => x.group === options.group && !x.closed)
      : undefined;

    if (!groupHead) {
      stored.value.push({
        messageId: nextMessageId++,
        instanceId,
        description,
        details,
        severity,
        closed: false,
        ...options,
      });
      return;
    }

    // Collapse into the existing group bar: its heading becomes the group
    // message and every description moves into the detail list.
    const heading = groupHead.groupMessage ?? groupHead.group;
    const mergedDetails: MessageDetail[] = [];

    if (groupHead.description != null && groupHead.description !== heading)
      mergedDetails.push({ values: [groupHead.description] });
    mergedDetails.push(...(groupHead.details ?? []));

    if (description != null)
      mergedDetails.push({ values: [description] });
    mergedDetails.push(...(details ?? []));

    // Added from several components? Then no single unmount may clear it.
    if (groupHead.instanceId !== instanceId)
      groupHead.instanceId = undefined;

    groupHead.description = heading;
    groupHead.details = mergedDetails;
  };

  return {
    messages,
    addMessage,
    newInstanceId: () => nextInstanceId++,
    clearInstance: (instanceId: number) => {
      stored.value = stored.value.filter(
        x => x.instanceId !== instanceId || x.persist,
      );
    },
    disposeInstance: (instanceId: number) => {
      disposedInstances.add(instanceId);
    },
    clearAll: () => {
      stored.value = [];
    },
    close: (messageId: number) => {
      const message = stored.value.find(x => x.messageId === messageId);
      if (message)
        message.closed = true;
    },
  };
});

/**
 * Show messages, warnings and errors to the user; MessageBarOutlet renders
 * them. Everything added through one instance is removed when the owning
 * component unmounts, unless the message was persisted.
 */
export function useMessageStore() {
  const { messages, addMessage, newInstanceId, clearInstance, disposeInstance, clearAll, close }
    = useSharedMessageStore();

  const instanceId = newInstanceId();
  const clear = () => clearInstance(instanceId);

  tryOnUnmounted(() => {
    disposeInstance(instanceId);
    clear();
  });

  // Transient severities close themselves and float top-right; they outlive
  // the adding component because the user still has to get to read them.
  const transient = (overrides: MessageOptions = {}): MessageOptions => ({
    fixed: true,
    persist: true,
    ...overrides,
  });

  return {
    messages,
    addMessage: (
      description: string,
      severity: Message['severity'],
      options?: MessageOptions,
    ) => addMessage(instanceId, description, undefined, severity, options),
    /** An error bar that stays until the user closes it. */
    addError: (description: string, options?: MessageOptions) =>
      addMessage(instanceId, description, undefined, 'error', options),
    /** An error bar with a detail list, e.g. one line per failed field. */
    addExtendedError: (
      description: string,
      details: MessageDetail[],
      options?: MessageOptions,
    ) => addMessage(instanceId, description, details, 'error', options),
    addInfo: (description: string, options?: MessageOptions) =>
      addMessage(
        instanceId,
        description,
        undefined,
        'info',
        transient({ closeIn: MessageDuration.short, ...options }),
      ),
    /** Warnings stay a little longer than info messages. */
    addWarning: (description: string, options?: MessageOptions) =>
      addMessage(
        instanceId,
        description,
        undefined,
        'warning',
        transient({ closeIn: MessageDuration.long, ...options }),
      ),
    addSuccess: (description: string, options?: MessageOptions) =>
      addMessage(
        instanceId,
        description,
        undefined,
        'success',
        transient({ closeIn: MessageDuration.short, ...options }),
      ),
    clear,
    clearAll,
    close,
  };
}

export type UseMessageStore = ReturnType<typeof useMessageStore>;
