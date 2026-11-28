import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { useMessageStore } from '~/composables/useMessageStore';
import { collectTestIds, expectConventionalTestIds, expectUniqueWithinScope } from '~/tests/helpers/dataTestid';
import { mountWithMessageBars, renderedAlerts } from '~/tests/helpers/messageBarHarness';
import MessageBar from './MessageBar.vue';

type MessageBarProps = InstanceType<typeof MessageBar>['$props'];

function mountBar(props: MessageBarProps = {}) {
  return mount(MessageBar, {
    props: { teleport: false, description: 'Something failed', ...props },
    global: {
      mocks: { $t: (key: string) => key },
      // The real transition runs its leave hooks, so the close emit can be observed.
      stubs: { transition: false },
    },
  });
}

/** happy-dom has no Web Animations API; capture what the countdown asks for instead. */
function fakeAnimate() {
  const animations: Array<EventTarget & Record<string, any>> = [];
  const animate = vi.fn(() => {
    const animation = Object.assign(new EventTarget(), {
      onfinish: null as null | (() => void),
      persist: vi.fn(),
      pause: vi.fn(),
      play: vi.fn(),
      cancel: vi.fn(),
      currentTime: 0,
    });
    animations.push(animation);
    return animation;
  });
  Object.defineProperty(HTMLElement.prototype, 'animate', { value: animate, configurable: true, writable: true });
  return { animate, animations };
}

describe('messageBar', () => {
  afterEach(() => {
    delete (HTMLElement.prototype as any).animate;
  });

  describe('severity', () => {
    it.each([
      ['error', 'bg-red-50'],
      ['warning', 'bg-yellow-50'],
      ['info', 'bg-blue-50'],
      ['success', 'bg-green-50'],
    ] as const)('should render a role alert for the %s severity', (severity, expectedClass) => {
      const wrapper = mountBar({ severity });

      const alert = wrapper.find('[role="alert"]');
      expect(alert.exists()).toBe(true);
      expect(alert.classes()).toContain(expectedClass);
      expect(alert.text()).toContain('Something failed');
    });

    it('should render an error when no severity is given', () => {
      const wrapper = mountBar();

      expect(wrapper.find('[role="alert"]').classes()).toContain('bg-red-50');
    });
  });

  describe('close button', () => {
    it('should label the close button through the translation function', () => {
      const wrapper = mountBar();

      expect(wrapper.find('button').attributes('aria-label')).toBe('messageBar.close');
    });

    it('should expose the bar, its content and the close button under the convention ids', () => {
      const wrapper = mountBar();

      expect(wrapper.find('[data-testid="message-bar-card"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="message-bar-content-value"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="message-bar-close-button"]').exists()).toBe(true);
      expectConventionalTestIds(collectTestIds(wrapper.find('[role="alert"]').element), 'message-bar');
    });

    it('should not expose the retired ids', () => {
      const wrapper = mountBar();

      for (const retired of ['message-bar', 'message-bar-close', 'message-bar-content'])
        expect(wrapper.find(`[data-testid="${retired}"]`).exists()).toBe(false);
    });

    it('should derive its ids from a custom baseDataTestid', () => {
      const wrapper = mountBar({ baseDataTestid: 'saved-notice' });

      expect(collectTestIds(wrapper.find('[role="alert"]').element)).toEqual([
        'saved-notice-card',
        'saved-notice-content-value',
        'saved-notice-close-button',
      ]);
    });

    it('should leave no id with the default base after the base changes', async () => {
      const wrapper = mountBar();

      await wrapper.setProps({ baseDataTestid: 'saved-notice' });

      const ids = collectTestIds(wrapper.find('[role="alert"]').element);
      expect(ids).toHaveLength(3);
      expect(ids.filter(id => id.startsWith('message-bar-'))).toEqual([]);
    });

    it('should emit close when the close button is clicked', async () => {
      const wrapper = mountBar();

      await wrapper.find('[data-testid="message-bar-close-button"]').trigger('click');

      await vi.waitFor(() => expect(wrapper.emitted('close')).toHaveLength(1));
      expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    });

    it('should emit close when the bar itself is clicked', async () => {
      const wrapper = mountBar();

      await wrapper.find('[role="alert"]').trigger('click');

      await vi.waitFor(() => expect(wrapper.emitted('close')).toHaveLength(1));
    });

    it('should not close on a click of the bar when closeOnClick is off', async () => {
      const wrapper = mountBar({ closeOnClick: false });

      await wrapper.find('[role="alert"]').trigger('click');

      expect(wrapper.find('[role="alert"]').exists()).toBe(true);
    });

    it('should not render a close button when it is not closable', async () => {
      const wrapper = mountBar({ isClosable: false });

      await wrapper.find('[role="alert"]').trigger('click');

      expect(wrapper.find('button').exists()).toBe(false);
      expect(wrapper.find('[role="alert"]').exists()).toBe(true);
    });

    it('should render nothing for a message that is already closed', () => {
      const wrapper = mountBar({ closed: true });

      expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    });
  });

  describe('content', () => {
    it('should render a field with several messages as a nested list', () => {
      const wrapper = mountBar({
        details: [
          { label: 'url', values: ['A URL is required.', 'The URL is not valid.'] },
          { values: ['Without label'] },
        ],
      });

      const lists = wrapper.findAll('ul');
      expect(lists).toHaveLength(2);
      expect(lists[0]!.text()).toContain('url:');
      expect(lists[0]!.text()).toContain('Without label');
      expect(lists[1]!.findAll('li').map(li => li.text())).toEqual([
        'A URL is required.',
        'The URL is not valid.',
      ]);
    });

    it('should render a field with a single message on one line without a nested list', () => {
      const wrapper = mountBar({
        details: [{ label: 'url', values: ['A URL is required.'] }],
      });

      expect(wrapper.findAll('ul')).toHaveLength(1);
      expect(wrapper.find('li').text()).toContain('url:');
      expect(wrapper.find('li').text()).toContain('A URL is required.');
    });

    it('should mark every detail line with a dash so it reads as a list', () => {
      const wrapper = mountBar({
        details: [{ label: 'url', values: ['A'] }, { values: ['B'] }],
      });

      expect(wrapper.find('ul').classes()).toContain(`list-['-_']`);
    });

    it('should put every detail on a line of its own', () => {
      const wrapper = mountBar({
        details: [{ label: 'url', values: ['A'] }, { label: 'name', values: ['B'] }],
      });

      const items = wrapper.findAll('li');
      expect(items).toHaveLength(2);
      for (const item of items) {
        expect(item.classes()).not.toContain('inline');
        expect(item.classes()).not.toContain('inline-flex');
      }
    });

    it('should render the slot instead of the description', () => {
      const wrapper = mount(MessageBar, {
        props: { teleport: false, description: 'Ignored' },
        slots: { default: '<span data-testid="custom-content-value">Custom content</span>' },
        global: { mocks: { $t: (key: string) => key } },
      });

      expect(wrapper.find('[data-testid="custom-content-value"]').exists()).toBe(true);
      expect(wrapper.text()).not.toContain('Ignored');
    });

    it('should render in place when teleport is off', () => {
      const wrapper = mountBar({ teleport: false });

      expect(wrapper.find('[role="alert"]').exists()).toBe(true);
    });

    it('should render floating bars as a card', () => {
      const wrapper = mountBar({ fixed: true, severity: 'info' });

      expect(wrapper.find('[role="alert"]').classes()).toEqual(expect.arrayContaining(['rounded-lg', 'shadow-lg']));
    });
  });

  describe('floating look', () => {
    it.each([
      ['info', 'bg-white', 'bg-blue-50', 'border-l-blue-400'],
      ['success', 'bg-white', 'bg-green-50', 'border-l-green-300'],
      ['error', 'bg-red-50', 'bg-white', 'border-l-red-400'],
      ['warning', 'bg-yellow-50', 'bg-white', 'border-l-yellow-400'],
    ] as const)('should render a floating %s bar with %s and an accent edge', (severity, expectedBackground, unexpectedBackground, accent) => {
      const classes = mountBar({ fixed: true, severity }).find('[role="alert"]').classes();

      expect(classes).toContain(expectedBackground);
      expect(classes).not.toContain(unexpectedBackground);
      expect(classes).toContain(accent);
    });

    it.each([
      ['info', 'bg-blue-50'],
      ['success', 'bg-green-50'],
    ] as const)('should keep the tinted background for an in-flow %s bar', (severity, tint) => {
      const classes = mountBar({ fixed: false, severity }).find('[role="alert"]').classes();

      expect(classes).toContain(tint);
      expect(classes).not.toContain('bg-white');
    });
  });

  describe('auto close', () => {
    it('should accept a closeIn that is not one of the preset durations', () => {
      const { animate } = fakeAnimate();

      const wrapper = mountBar({ closeIn: 3333 });

      expect(wrapper.find('[role="progressbar"]').exists()).toBe(true);
      expect(animate).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ duration: 3333 }));
    });

    it('should not show a countdown without closeIn', () => {
      const wrapper = mountBar();

      expect(wrapper.find('[role="progressbar"]').exists()).toBe(false);
    });

    it('should close automatically after closeIn', async () => {
      const { animations } = fakeAnimate();
      const wrapper = mountBar({ closeIn: 2000 });
      await vi.waitFor(() => expect(animations).toHaveLength(1));

      animations[0]!.onfinish!();

      await vi.waitFor(() => expect(wrapper.emitted('close')).toHaveLength(1));
    });

    it('should pause the countdown while hovered', async () => {
      const { animations } = fakeAnimate();
      const wrapper = mountBar({ closeIn: 2000 });
      await vi.waitFor(() => expect(animations).toHaveLength(1));

      await wrapper.find('[role="alert"]').trigger('mouseenter');
      expect(animations[0]!.pause).toHaveBeenCalled();

      await wrapper.find('[role="alert"]').trigger('mouseleave');
      expect(animations[0]!.play).toHaveBeenCalled();
    });
  });
});

describe('messageBarOutlet', () => {
  const idle = defineComponent({ setup: () => () => h('div') });

  async function addTwoMessages() {
    const harness = await mountWithMessageBars(idle);
    const { addInfo, addSuccess } = useMessageStore();
    await addInfo('First message');
    await addSuccess('Second message');
    await vi.waitFor(() => expect(renderedAlerts()).toHaveLength(2));
    return harness;
  }

  it('should expose its three targets as panels under the default base', async () => {
    await mountWithMessageBars(idle);

    const ids = Array.from(document.body.querySelectorAll('[data-message-outlet]'), element => element.getAttribute('data-testid'));
    expect(ids).toEqual([
      'message-bar-outlet-main-panel',
      'message-bar-outlet-sticky-panel',
      'message-bar-outlet-fixed-panel',
    ]);
  });

  it('should give two simultaneous messages distinct ids', async () => {
    await addTwoMessages();

    const outlet = document.body.querySelector('[data-testid="message-bar-outlet-fixed-panel"]')!;
    expectUniqueWithinScope(outlet);
    expectConventionalTestIds(collectTestIds(outlet), 'message-bar');
    expect(collectTestIds(outlet).filter(id => id.endsWith('-card'))).toHaveLength(2);
  });

  it('should dismiss only the message whose close button was clicked', async () => {
    await addTwoMessages();
    const [first, second] = renderedAlerts();
    const secondId = second!.getAttribute('data-testid')!.replace('-card', '');

    document.body.querySelector<HTMLElement>(`[data-testid="${secondId}-close-button"]`)!.click();

    await vi.waitFor(() => expect(renderedAlerts()).toEqual([first]));
  });

  it('should not warn about attributes falling through to its fragment root', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await mountWithMessageBars(idle);

    expect(warn.mock.calls.flat().join(' ')).not.toContain('Extraneous non-props attributes');
    warn.mockRestore();
  });
});
