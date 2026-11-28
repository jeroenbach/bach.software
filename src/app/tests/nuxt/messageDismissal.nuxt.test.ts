import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { useMessageStore } from '~/composables/useMessageStore';
import { mountWithMessageBars, renderedAlerts } from '~/tests/helpers/messageBarHarness';

const idle = defineComponent({ setup: () => () => h('div') });

describe('messageBar harness', () => {
  it('should stop rendering a message once it is closed and flag it closed', async () => {
    const { messages } = await mountWithMessageBars(idle);
    const { addSuccess } = useMessageStore();

    await addSuccess('Saved');
    await vi.waitFor(() => expect(renderedAlerts()).toHaveLength(1));

    renderedAlerts()[0]!.click();

    await vi.waitFor(() => expect(renderedAlerts()).toHaveLength(0));
    await vi.waitFor(() => expect(messages.value[0]!.closed).toBe(true));
  });

  it('should not lose a message added before the outlet mounted', async () => {
    const earlyAdder = defineComponent({
      setup() {
        useMessageStore().addInfo('Added before the outlet');
        return () => h('div');
      },
    });

    await mountWithMessageBars(idle, { before: earlyAdder });

    await vi.waitFor(() => expect(renderedAlerts()).toHaveLength(1));
    expect(renderedAlerts()[0]!.textContent).toContain('Added before the outlet');
  });
});
