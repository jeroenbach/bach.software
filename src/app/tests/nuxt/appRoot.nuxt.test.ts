import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it, vi } from 'vitest';
import { h } from 'vue';
import App from '~/app.vue';
import { useMessageStore } from '~/composables/useMessageStore';

// The page slot replaces the router page, which has no route to resolve in this environment.
const mountApp = () => mountSuspended(App, { attachTo: document.body, slots: { default: () => h('div') } });

describe('app root', () => {
  it('should mount exactly one message outlet at the app root', async () => {
    const wrapper = await mountApp();

    const outlets = document.body.querySelectorAll('[data-message-outlet]');
    expect(outlets).toHaveLength(3);
    wrapper.unmount();
  });

  it('should render a message added to the store once', async () => {
    const wrapper = await mountApp();
    const { addError, clearAll } = useMessageStore();

    await addError('Something failed at the root');

    await vi.waitFor(() => {
      const alerts = Array.from(document.body.querySelectorAll('[role="alert"]'))
        .filter(alert => alert.textContent?.includes('Something failed at the root'));
      expect(alerts).toHaveLength(1);
    });
    clearAll();
    wrapper.unmount();
  });

  it('should not leak the message id into the rendered bar as an attribute', async () => {
    const wrapper = await mountApp();
    const { addError, clearAll } = useMessageStore();

    await addError('Attribute leak check');

    await vi.waitFor(() => {
      const alert = Array.from(document.body.querySelectorAll('[role="alert"]'))
        .find(candidate => candidate.textContent?.includes('Attribute leak check'));
      expect(alert).toBeDefined();
      expect(alert!.hasAttribute('messageid')).toBe(false);
    });
    clearAll();
    wrapper.unmount();
  });
});
