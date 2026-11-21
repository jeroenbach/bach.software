import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { useNuxtApp } from '#imports';
import AppHeader from '~/components/AppHeader.vue';
import SearchButton from '~/components/SearchButton.vue';
import SearchModal from '~/components/SearchModal.vue';
import { useMessageStore } from '~/composables/useMessageStore';
import { mountWithMessageBars, renderedAlerts } from '~/tests/helpers/messageBarHarness';
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

  describe('search', () => {
    async function mountContext() {
      mock.useContentNavigationContext.mockResolvedValue({
        data: ref([]),
        refresh: vi.fn(),
      });
      return mountSuspended(AppHeaderContext);
    }

    it('passes the search status to the search modal', async () => {
      const wrapper = await mountContext();

      expect(wrapper.findComponent(SearchModal).props('status')).toBe('idle');
    });

    it('opens the search modal when the search button emits open', async () => {
      const wrapper = await mountContext();
      expect(wrapper.findComponent(SearchModal).props('open')).toBe(false);

      wrapper.findAllComponents(SearchButton)[0]!.vm.$emit('open');

      await vi.waitFor(() => expect(wrapper.findComponent(SearchModal).props('open')).toBe(true));
    });
  });

  describe('language notice', () => {
    async function switchLanguage(language: 'en' | 'nl' | 'de') {
      mock.useContentNavigationContext.mockResolvedValue({
        data: ref([]),
        refresh: vi.fn(),
      });
      const harness = await mountWithMessageBars(AppHeaderContext);
      const header = harness.wrapper.findComponent(AppHeader);
      header.vm.$emit('update:language', language);
      return harness;
    }

    afterEach(async () => {
      useMessageStore().clearAll();
      await useNuxtApp().$i18n.setLocale('en');
    });

    it('should add an info message when the language changes to a non default language', async () => {
      const { messages } = await switchLanguage('nl');

      await vi.waitFor(() => expect(messages.value).toHaveLength(1));
      expect(messages.value[0]).toMatchObject({ severity: 'info' });
    });

    it('should use a closeIn of 4000', async () => {
      const { messages } = await switchLanguage('nl');

      await vi.waitFor(() => expect(messages.value).toHaveLength(1));
      expect(messages.value[0]!.closeIn).toBe(4000);
    });

    it('should add the message in the new language, after the locale switch completed', async () => {
      const { messages } = await switchLanguage('nl');

      await vi.waitFor(() => expect(messages.value).toHaveLength(1));
      expect(messages.value[0]!.description).toBe(useNuxtApp().$i18n.t('notifications.info.languageAiTranslated'));
      expect(messages.value[0]!.description).toContain('AI');
      expect(messages.value[0]!.description).not.toContain('automatically translated');
    });

    it('should render the notice as an alert', async () => {
      await switchLanguage('de');

      await vi.waitFor(() => expect(renderedAlerts()).toHaveLength(1));
    });

    it('should not add a message when the language changes to the default language', async () => {
      const { messages } = await switchLanguage('en');

      await vi.waitFor(() => expect(useNuxtApp().$i18n.locale.value).toBe('en'));
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(messages.value).toHaveLength(0);
    });
  });
});
