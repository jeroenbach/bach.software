import type { InjectionKey } from 'vue';
import type { Message } from '~/composables/useMessageStore';

/** The three teleport targets a MessageBarOutlet renders. */
export interface MessageOutlets {
  main: string
  sticky: string
  fixed: string
}

/**
 * The registry of outlets and active message bars, provided by the
 * MessageBarContext component and injected by the presentational
 * MessageBar/MessageBarOutlet components. Through it a MessageBar never needs
 * to know where to teleport to: it asks for the current (= most recently
 * registered) outlets, which belong to the modal when one is open and to the
 * page otherwise.
 */
export interface MessageBarRegistry {
  currentOutlets: () => MessageOutlets
  registerOutlet?: () => MessageOutlets
  unregisterOutlet?: (outletId: string) => void
  registerMessage?: (outletId: string, message: Partial<Message>) => string
  unregisterMessage?: (messageId: string) => void
}

export const messageBarRegistryKey: InjectionKey<MessageBarRegistry>
  = Symbol('messageBarRegistry');

/** Used when no MessageBarContext is mounted (tests, stories). */
export function fallbackOutlets(): MessageOutlets {
  return { main: 'main', sticky: 'main-sticky', fixed: 'main-fixed' };
}
