import type { VNode } from 'vue';
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, reactive } from 'vue';
import MessageBar from '~/components/MessageBar.vue';
import MessageBarOutlet from '~/components/MessageBarOutlet.vue';
import MessageBarContext from './MessageBarContext.vue';

interface HostState {
  outlets: string[]
  bars: Array<{ id: string, fixed?: boolean }>
}

const mounted: Array<{ unmount: () => void }> = [];

function mountHost(state: HostState, slotProps: { value?: boolean } = {}) {
  const host = defineComponent({
    setup() {
      return () => h(MessageBarContext, null, {
        default: (props: { hasMessagesInRootOutlet: boolean }) => {
          slotProps.value = props.hasMessagesInRootOutlet;
          const children: VNode[] = [
            ...state.outlets.map(id => h(MessageBarOutlet, { key: id })),
            ...state.bars.map(bar => h(MessageBar, { key: bar.id, description: bar.id, fixed: bar.fixed })),
          ];
          return children;
        },
      });
    },
  });
  const wrapper = mount(host, {
    attachTo: document.body,
    global: { mocks: { $t: (key: string) => key } },
  });
  mounted.push(wrapper);
  return wrapper;
}

function outletIds() {
  return Array.from(document.body.querySelectorAll('[data-message-outlet]'))
    .map(element => element.getAttribute('data-message-outlet')!);
}

const mainOutlets = () => outletIds().filter(id => !id.endsWith('-sticky') && !id.endsWith('-fixed'));
function textIn(outletId: string) {
  return document.body.querySelector(`[data-message-outlet='${outletId}']`)?.textContent?.trim();
}

describe('messageBarContext', () => {
  afterEach(() => {
    mounted.splice(0).forEach(wrapper => wrapper.unmount());
  });

  describe('outlet', () => {
    it('should render the main, sticky and fixed targets', () => {
      mountHost(reactive({ outlets: ['page'], bars: [] }));

      const [main] = mainOutlets();
      expect(outletIds()).toEqual([main, `${main}-sticky`, `${main}-fixed`]);
    });

    it('should give the outlet an id that does not depend on random values', () => {
      mountHost(reactive({ outlets: ['page'], bars: [] }));
      const first = outletIds();
      mounted.splice(0).forEach(wrapper => wrapper.unmount());

      mountHost(reactive({ outlets: ['page'], bars: [] }));

      expect(outletIds()).toEqual(first);
    });
  });

  describe('message placement', () => {
    it('should teleport a bar into the active outlet', async () => {
      const state = reactive<HostState>({ outlets: ['page'], bars: [] });
      mountHost(state);
      const [main] = mainOutlets();

      state.bars.push({ id: 'first' });
      await vi.waitFor(() => expect(textIn(main!)).toContain('first'));
    });

    it('should teleport a fixed bar into the fixed target', async () => {
      const state = reactive<HostState>({ outlets: ['page'], bars: [] });
      mountHost(state);
      const [main] = mainOutlets();

      state.bars.push({ id: 'floating', fixed: true });

      await vi.waitFor(() => expect(textIn(`${main}-fixed`)).toContain('floating'));
      expect(textIn(main!)).toBe('');
    });

    it('should send new bars only to the most recently registered outlet and fall back when it is gone', async () => {
      const state = reactive<HostState>({ outlets: ['page'], bars: [] });
      mountHost(state);
      const [page] = mainOutlets();

      state.outlets.push('modal');
      await vi.waitFor(() => expect(mainOutlets()).toHaveLength(2));
      const modal = mainOutlets().find(id => id !== page)!;
      state.bars.push({ id: 'inModal' });
      await vi.waitFor(() => expect(textIn(modal)).toContain('inModal'));
      expect(textIn(page!)).toBe('');

      state.outlets.pop();
      await vi.waitFor(() => expect(mainOutlets()).toEqual([page]));
      state.bars.push({ id: 'onPage' });
      await vi.waitFor(() => expect(textIn(page!)).toContain('onPage'));
    });
  });

  describe('without a context', () => {
    it('should render a bar into the fallback outlets', async () => {
      const wrapper = mount(defineComponent({
        setup: () => () => [h(MessageBarOutlet), h(MessageBar, { description: 'standalone' })],
      }), { attachTo: document.body, global: { mocks: { $t: (key: string) => key } } });
      mounted.push(wrapper);

      await vi.waitFor(() => expect(textIn('main')).toContain('standalone'));
    });
  });

  describe('hasMessagesInRootOutlet', () => {
    it('should reflect in-flow bars only and ignore fixed bars', async () => {
      const slotProps: { value?: boolean } = {};
      const state = reactive<HostState>({ outlets: ['page'], bars: [] });
      mountHost(state, slotProps);
      expect(slotProps.value).toBe(false);

      state.bars.push({ id: 'floating', fixed: true });
      await vi.waitFor(() => expect(textIn(`${mainOutlets()[0]}-fixed`)).toContain('floating'));
      expect(slotProps.value).toBe(false);

      state.bars.push({ id: 'inFlow' });
      await vi.waitFor(() => expect(slotProps.value).toBe(true));
    });
  });
});
