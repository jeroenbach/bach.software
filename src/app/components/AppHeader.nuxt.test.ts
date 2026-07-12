import type { NavigationItem } from '~/types/NavigationItem';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import AppHeader from './AppHeader.vue';

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

    await wrapper.find('button').trigger('click');
    await nextTick();
    await nextTick();

    const mobileExternal = wrapper
      .findAll('a')
      .find(link => link.classes().includes('rounded-lg') && link.text().includes('Vue Dynamic Form'));

    expect(mobileExternal).toBeDefined();
    expect(mobileExternal!.attributes('target')).toBe('_blank');
    expect(mobileExternal!.find('svg').exists()).toBe(true);
  });
});
