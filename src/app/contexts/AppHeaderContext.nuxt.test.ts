import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import AppHeader from '~/components/AppHeader.vue';
import AppHeaderContext from './AppHeaderContext.vue';

const mock = vi.hoisted(() => ({
  useContentNavigationContext: vi.fn(),
}));

mockNuxtImport('useContentNavigationContext', () => mock.useContentNavigationContext);

describe('appHeaderContext', () => {
  it('appends the vue-dynamic-form external link after the content navigation', async () => {
    mock.useContentNavigationContext.mockResolvedValue({
      data: ref([{ label: 'Home', to: '/' }]),
      refresh: vi.fn(),
    });

    const wrapper = await mountSuspended(AppHeaderContext);
    const header = wrapper.findComponent(AppHeader);

    expect(header.props('navigation')).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Vue Dynamic Form', to: 'https://vue-dynamic-form.bach.software/', external: true },
    ]);
  });

  it('shows the vue-dynamic-form link even without content navigation', async () => {
    mock.useContentNavigationContext.mockResolvedValue({
      data: ref(undefined),
      refresh: vi.fn(),
    });

    const wrapper = await mountSuspended(AppHeaderContext);
    const header = wrapper.findComponent(AppHeader);

    expect(header.props('navigation')).toEqual([
      { label: 'Vue Dynamic Form', to: 'https://vue-dynamic-form.bach.software/', external: true },
    ]);
  });
});
