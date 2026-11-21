import { mountSuspended } from '@nuxt/test-utils/runtime';
import { enableAutoUnmount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, ref } from 'vue';
import { collectTestIds, expectConventionalTestIds } from '~/tests/helpers/dataTestid';
import { catalogs } from '~/tests/helpers/localeCatalogs';
import { localeRoute } from '~/tests/helpers/localeRoute';
import ColorModeSwitcher from './ColorModeSwitcher.vue';

enableAutoUnmount(afterEach);

type Wrapper = Awaited<ReturnType<typeof mountSuspended>>;

// The button only exists after the client-only boundary has rendered
async function switchButton(wrapper: Wrapper, id = 'color-mode-switcher-toggle-button') {
  await vi.waitFor(() => expect(wrapper.find('button').exists()).toBe(true));
  return wrapper.find(`[data-testid="${id}"]`);
}

describe('colorModeSwitcher', () => {
  it('has a distinct nl and de translation for the switch title', () => {
    expect(catalogs.nl['Switch color mode']).not.toBe(catalogs.en['Switch color mode']);
    expect(catalogs.de['Switch color mode']).not.toBe(catalogs.en['Switch color mode']);
  });

  it.each(['en', 'nl', 'de'] as const)('renders the switch title in %s', async (locale) => {
    const wrapper = await mountSuspended(ColorModeSwitcher, { route: localeRoute(locale) });

    expect((await switchButton(wrapper)).attributes('title')).toBe(catalogs[locale]['Switch color mode']);
  });

  it.each([
    ['system', 'dark'],
    ['dark', 'light'],
    ['light', 'system'],
  ] as const)('switches from %s to %s when pressed', async (colorMode, next) => {
    const wrapper = await mountSuspended(ColorModeSwitcher, { props: { colorMode } });

    await (await switchButton(wrapper)).trigger('click');

    expect(wrapper.emitted('update:colorMode')).toEqual([[next]]);
  });

  it('should render the toggle button with the default id on the button, not the wrapper', async () => {
    const wrapper = await mountSuspended(ColorModeSwitcher);

    const button = await switchButton(wrapper);

    expect(button.element.tagName).toBe('BUTTON');
    expect(collectTestIds(wrapper.element)).toEqual(['color-mode-switcher-toggle-button']);
    expectConventionalTestIds(collectTestIds(wrapper.element), 'color-mode-switcher');
  });

  it('should derive the button id from baseDataTestid and update it when the base changes', async () => {
    const wrapper = await mountSuspended(ColorModeSwitcher, { props: { baseDataTestid: 'mobile-menu-color-mode-switcher' } });
    await switchButton(wrapper, 'mobile-menu-color-mode-switcher-toggle-button');

    await wrapper.setProps({ baseDataTestid: 'desktop-menu-color-mode-switcher' });

    expect(collectTestIds(wrapper.element)).toEqual(['desktop-menu-color-mode-switcher-toggle-button']);
  });

  it('should keep two instances distinguishable through different bases', async () => {
    const changes = ref<string[]>([]);
    const host = defineComponent({
      setup: () => () => h('div', [
        h(ColorModeSwitcher, { 'baseDataTestid': 'desktop-menu-color-mode-switcher', 'onUpdate:colorMode': (mode: string) => changes.value.push(`desktop:${mode}`) }),
        h(ColorModeSwitcher, { 'baseDataTestid': 'mobile-menu-color-mode-switcher', 'onUpdate:colorMode': (mode: string) => changes.value.push(`mobile:${mode}`) }),
      ]),
    });
    const wrapper = await mountSuspended(host);
    await vi.waitFor(() => expect(wrapper.findAll('button')).toHaveLength(2));

    await wrapper.find('[data-testid="mobile-menu-color-mode-switcher-toggle-button"]').trigger('click');

    expect(changes.value).toEqual(['mobile:dark']);
  });
});
