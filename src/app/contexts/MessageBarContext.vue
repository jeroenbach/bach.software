<script lang="ts" setup>
/**
 * The messaging UI is three components:
 * - MessageBar: the bar the visitor sees, rendered per message (presentational)
 * - MessageBarOutlet: the placeholder the bars teleport into (presentational)
 * - MessageBarContext (this file): the context component that tracks which
 *   outlet is active and tells the bars where to go
 *
 * It is mounted once, at the app root above the layout, and talks to the
 * presentational components below through provide/inject (messageBarRegistry),
 * so a MessageBar needs no prop for its placement.
 *
 * Several outlets can exist at once, but only the most recently registered one
 * is active: when a modal opens, its outlet goes on top of the stack and new
 * messages appear inside the modal; when it closes, they fall back to the page.
 */
import type { MessageBarRegistry } from '~/components/messageBarRegistry';
import type { Message } from '~/composables/useMessageStore';
import { computed, provide, ref } from 'vue';
import { messageBarRegistryKey } from '~/components/messageBarRegistry';

interface ActiveMessage extends Partial<Message> {
  outletId: string
}

const outletStack = ref<string[]>([]);
const activeMessages = ref(new Map<string, ActiveMessage>());

// Ids come from counters scoped to this instance, never from random values: the
// server-rendered outlet markup and the client registry must agree on the id,
// or the teleport target cannot be found after hydration.
let nextOutletId = 0;
let nextMessageId = 0;

const activeOutlet = computed(() => outletStack.value.at(-1));

// The layout reserves space for in-flow bars on the page itself; fixed bars
// float top-right and don't count.
const hasMessagesInRootOutlet = computed(() =>
  Array.from(activeMessages.value.values()).some(
    message => message.outletId === outletStack.value[0] && !message.fixed,
  ),
);

function currentOutlets() {
  return {
    main: activeOutlet.value!,
    sticky: `${activeOutlet.value}-sticky`,
    fixed: `${activeOutlet.value}-fixed`,
  };
}

function registerOutlet() {
  outletStack.value.push(`messageOutlet${nextOutletId++}`);
  return currentOutlets();
}

function unregisterOutlet(outletId: string) {
  outletStack.value = outletStack.value.filter(x => x !== outletId);
  // Messages teleported into a removed outlet have nowhere to render.
  for (const [id, message] of activeMessages.value) {
    if (message.outletId === outletId)
      activeMessages.value.delete(id);
  }
}

function registerMessage(outletId: string, message: Partial<Message>) {
  const id = `message${nextMessageId++}`;
  activeMessages.value.set(id, { ...message, outletId });
  return id;
}

function unregisterMessage(messageId: string) {
  activeMessages.value.delete(messageId);
}

provide<MessageBarRegistry>(messageBarRegistryKey, {
  currentOutlets,
  registerOutlet,
  unregisterOutlet,
  registerMessage,
  unregisterMessage,
});
</script>

<template>
  <slot :hasMessagesInRootOutlet />
</template>
