import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import { createPinia, setActivePinia } from './useDestructiblePinia';
import { useMessageStore } from './useMessageStore';

function mountWithStore(setup: (store: ReturnType<typeof useMessageStore>) => void) {
  return mount(defineComponent({
    setup() {
      const store = useMessageStore();
      setup(store);
      return () => h('div');
    },
  }));
}

describe('useMessageStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('adding', () => {
    it('should add a message with its severity and details', async () => {
      const { messages, addExtendedError } = useMessageStore();

      await addExtendedError('Failed', [{ label: 'url', values: ['required'] }]);

      expect(messages.value).toEqual([
        expect.objectContaining({
          severity: 'error',
          description: 'Failed',
          details: [{ label: 'url', values: ['required'] }],
          closed: false,
        }),
      ]);
    });

    it('should not expose the owning instance of a message', async () => {
      const { messages, addError } = useMessageStore();

      await addError('Failed');

      expect(messages.value[0]).not.toHaveProperty('instanceId');
    });

    it('should keep the messages reactive for a consumer that destructured them earlier', async () => {
      const { messages } = useMessageStore();
      const { addError } = useMessageStore();

      expect(messages.value).toHaveLength(0);
      await addError('Late message');

      expect(messages.value).toHaveLength(1);
    });

    it('should not auto-close an error', async () => {
      const { messages, addError } = useMessageStore();

      await addError('Failed');

      expect(messages.value[0]!.closeIn).toBeUndefined();
    });

    it('should keep the reference defaults when no closeIn is given', async () => {
      const { messages, addInfo, addSuccess, addWarning } = useMessageStore();

      await addInfo('info');
      await addSuccess('success');
      await addWarning('warning');

      expect(messages.value.map(x => x.closeIn)).toEqual([2000, 2000, 10000]);
      expect(messages.value.every(x => x.fixed && x.persist)).toBe(true);
    });

    it.each([3000, 4000, 2500])('should store the exact closeIn passed by the caller (%i)', async (closeIn) => {
      const { messages, addInfo, addSuccess } = useMessageStore();

      await addSuccess('success', { closeIn });
      await addInfo('info', { closeIn });

      expect(messages.value.map(x => x.closeIn)).toEqual([closeIn, closeIn]);
    });
  });

  describe('closing and clearing', () => {
    it('should mark a message as closed', async () => {
      const { messages, addError, close } = useMessageStore();
      await addError('Failed');

      close(messages.value[0]!.messageId);

      expect(messages.value[0]!.closed).toBe(true);
    });

    it('should clear every message with clearAll', async () => {
      const { messages, addError, clearAll } = useMessageStore();
      await addError('one');
      await addError('two');

      clearAll();

      expect(messages.value).toHaveLength(0);
    });

    it('should clear only the messages of its own instance', async () => {
      const first = useMessageStore();
      const second = useMessageStore();
      await first.addError('from first');
      await second.addError('from second');

      first.clear();

      expect(second.messages.value.map(x => x.description)).toEqual(['from second']);
    });
  });

  describe('addOnce', () => {
    it('should drop an identical message that is still visible', async () => {
      const { messages, addError } = useMessageStore();

      await addError('Failed', { addOnce: true });
      await addError('Failed', { addOnce: true });

      expect(messages.value).toHaveLength(1);
    });

    it('should keep a message with other details', async () => {
      const { messages, addExtendedError } = useMessageStore();

      await addExtendedError('Failed', [{ label: 'a', values: ['x'] }], { addOnce: true });
      await addExtendedError('Failed', [{ label: 'b', values: ['x'] }], { addOnce: true });

      expect(messages.value).toHaveLength(2);
    });

    it('should show the message again once the identical one was closed', async () => {
      const { messages, addError, close } = useMessageStore();
      await addError('Failed', { addOnce: true });
      close(messages.value[0]!.messageId);

      await addError('Failed', { addOnce: true });

      expect(messages.value).toHaveLength(2);
    });

    it('should drop the duplicate when two components report the same message at once', async () => {
      const first = useMessageStore();
      const second = useMessageStore();

      await Promise.all([
        first.addError('Failed', { addOnce: true }),
        second.addError('Failed', { addOnce: true }),
      ]);

      expect(first.messages.value).toHaveLength(1);
    });
  });

  describe('grouping', () => {
    it('should collapse grouped messages into one bar with a heading and a detail list', async () => {
      const { messages, addError, addExtendedError } = useMessageStore();

      await addError('First failure', { group: 'saving', groupMessage: 'Saving failed' });
      await addExtendedError('Second failure', [{ label: 'url', values: ['required'] }], {
        group: 'saving',
        groupMessage: 'Saving failed',
      });

      expect(messages.value).toHaveLength(1);
      expect(messages.value[0]).toEqual(expect.objectContaining({
        description: 'Saving failed',
        details: [
          { values: ['First failure'] },
          { values: ['Second failure'] },
          { label: 'url', values: ['required'] },
        ],
      }));
    });
  });

  describe('unmounting the owning component', () => {
    it('should remove the messages of a component when it unmounts', async () => {
      let store!: ReturnType<typeof useMessageStore>;
      const wrapper = mountWithStore(s => (store = s));
      await store.addError('Failed');
      expect(store.messages.value).toHaveLength(1);

      wrapper.unmount();

      expect(store.messages.value).toHaveLength(0);
    });

    it('should keep the messages of another component when one unmounts', async () => {
      const other = useMessageStore();
      await other.addError('from another');
      let store!: ReturnType<typeof useMessageStore>;
      const wrapper = mountWithStore(s => (store = s));
      await store.addError('from the component');

      wrapper.unmount();

      expect(other.messages.value.map(x => x.description)).toEqual(['from another']);
    });

    it('should keep a persisted message after the component unmounts', async () => {
      let store!: ReturnType<typeof useMessageStore>;
      const wrapper = mountWithStore(s => (store = s));
      await store.addSuccess('Saved');

      wrapper.unmount();

      expect(store.messages.value.map(x => x.description)).toEqual(['Saved']);
    });

    it('should drop a message reported after the component already unmounted', async () => {
      let store!: ReturnType<typeof useMessageStore>;
      const wrapper = mountWithStore(s => (store = s));

      const pending = store.addError('Too late');
      wrapper.unmount();
      await pending;
      await nextTick();

      expect(store.messages.value).toHaveLength(0);
    });

    it('should still keep a persisted message that is added while the component unmounts', async () => {
      let store!: ReturnType<typeof useMessageStore>;
      const wrapper = mountWithStore(s => (store = s));

      const pending = store.addSuccess('Saved');
      wrapper.unmount();
      await pending;

      expect(store.messages.value.map(x => x.description)).toEqual(['Saved']);
    });
  });
});
