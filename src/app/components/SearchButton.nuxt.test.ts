import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';
import SearchButton from './SearchButton.vue';

function stubUserAgent(value: string) {
  Object.defineProperty(window.navigator, 'userAgent', { value, configurable: true });
}

describe('searchButton', () => {
  it('shows the Ctrl+K shortcut on non-mac platforms', async () => {
    stubUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');

    const wrapper = await mountSuspended(SearchButton);

    expect(wrapper.find('button').attributes('title')).toContain('Ctrl+K');
  });

  it('shows the ⌘K shortcut on mac', async () => {
    stubUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');

    const wrapper = await mountSuspended(SearchButton);

    expect(wrapper.find('button').attributes('title')).toContain('⌘K');
  });

  it('emits click when pressed', async () => {
    stubUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');

    const wrapper = await mountSuspended(SearchButton);
    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted('click')).toHaveLength(1);
  });
});
