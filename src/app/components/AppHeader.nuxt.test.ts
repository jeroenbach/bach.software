import type { NavigationItem } from '~/types/NavigationItem';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { enableAutoUnmount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import { collectTestIds, expectConventionalTestIds } from '~/tests/helpers/dataTestid';
import { catalogs } from '~/tests/helpers/localeCatalogs';
import { localeRoute } from '~/tests/helpers/localeRoute';
import AppHeader from './AppHeader.vue';

enableAutoUnmount(afterEach);

const navigation: NavigationItem[] = [
  { label: 'About', to: '/about' },
  { label: 'Vue Dynamic Form', to: 'https://vue-dynamic-form.bach.software/', external: true },
];

describe('appHeader', () => {
  it('renders external navigation items with target _blank and an external link icon', async () => {
    const wrapper = await mountSuspended(AppHeader, { props: { navigation } });

    const external = wrapper.findAll('a').find(link => link.text().includes('Vue Dynamic Form'));
    expect(external).toBeDefined();
    expect(external!.attributes('target')).toBe('_blank');
    expect(external!.attributes('rel')).toContain('noopener');
    expect(external!.find('svg').exists()).toBe(true);
  });

  it('renders internal navigation items without target _blank and without an icon', async () => {
    const wrapper = await mountSuspended(AppHeader, { props: { navigation } });

    const internal = wrapper.findAll('a').find(link => link.text().includes('About'));
    expect(internal).toBeDefined();
    expect(internal!.attributes('target')).not.toBe('_blank');
    expect(internal!.find('svg').exists()).toBe(false);
  });

  it('renders external navigation items in the mobile menu with target _blank and an external link icon', async () => {
    const wrapper = await mountSuspended(AppHeader, { props: { navigation } });

    const openButton = wrapper.findAll('button').find(button => button.text().includes('Open main menu'));
    await openButton!.trigger('click');
    await nextTick();
    await nextTick();

    // The mobile menu Dialog teleports to document.body, outside the wrapper
    const mobileExternal = Array.from(document.body.querySelectorAll('a'))
      .find(link => link.classList.contains('rounded-lg') && link.textContent?.includes('Vue Dynamic Form'));

    expect(mobileExternal).toBeDefined();
    expect(mobileExternal!.getAttribute('target')).toBe('_blank');
    expect(mobileExternal!.querySelector('svg')).not.toBeNull();
  });

  it('should not render a notification host or alert', async () => {
    const wrapper = await mountSuspended(AppHeader, { props: { navigation } });

    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    expect(wrapper.find('[aria-live]').exists()).toBe(false);
  });

  it('should expose desktop and mobile menu switchers under different ids', async () => {
    const wrapper = await mountSuspended(AppHeader, { props: { navigation } });
    await wrapper.findAll('nav button').at(-1)!.trigger('click');
    await nextTick();
    await nextTick();

    // The mobile menu Dialog teleports to document.body, outside the wrapper
    const ids = [...collectTestIds(wrapper.element), ...collectTestIds(document.body)].filter(id => id.includes('switcher'));

    expect(ids.toSorted()).toEqual([
      'desktop-menu-color-mode-switcher-toggle-button',
      'desktop-menu-language-switcher-toggle-button',
      'mobile-menu-color-mode-switcher-toggle-button',
      'mobile-menu-language-switcher-toggle-button',
    ]);
    expectConventionalTestIds(ids);
  });

  describe('labels per locale', () => {
    const keys = ['mainNavigation', 'openMainMenu', 'closeMenu'] as const;

    const navigationLabel = (wrapper: Awaited<ReturnType<typeof mountSuspended>>) => wrapper.find('nav').attributes('aria-label');
    // The mobile menu toggle is the last button of the navigation bar
    const menuToggleName = (wrapper: Awaited<ReturnType<typeof mountSuspended>>) => wrapper.findAll('nav button').at(-1)!.text();
    const closeMenuName = () => document.body.querySelector('[role="dialog"] button:has(.sr-only)')?.textContent?.trim();

    async function openMobileMenu(wrapper: Awaited<ReturnType<typeof mountSuspended>>) {
      await wrapper.findAll('nav button').at(-1)!.trigger('click');
      await nextTick();
      await nextTick();
    }

    it.each(keys)('has a distinct nl and de translation for %s', (key) => {
      expect(catalogs.nl.appHeader[key]).not.toBe(catalogs.en.appHeader[key]);
      expect(catalogs.de.appHeader[key]).not.toBe(catalogs.en.appHeader[key]);
    });

    it.each(['en', 'nl', 'de'] as const)('renders the navigation label in %s', async (locale) => {
      const wrapper = await mountSuspended(AppHeader, { props: { navigation }, route: localeRoute(locale) });

      expect(navigationLabel(wrapper)).toBe(catalogs[locale].appHeader.mainNavigation);
    });

    it.each(['en', 'nl', 'de'] as const)('renders the mobile menu toggle name in %s', async (locale) => {
      const wrapper = await mountSuspended(AppHeader, { props: { navigation }, route: localeRoute(locale) });

      expect(menuToggleName(wrapper)).toBe(catalogs[locale].appHeader.openMainMenu);
    });

    it.each(['en', 'nl', 'de'] as const)('renders the close menu label in %s', async (locale) => {
      const wrapper = await mountSuspended(AppHeader, { props: { navigation }, route: localeRoute(locale) });

      await openMobileMenu(wrapper);

      expect(closeMenuName()).toBe(catalogs[locale].appHeader.closeMenu);
    });
  });
});
