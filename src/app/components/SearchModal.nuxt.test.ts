import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import SearchModal from './SearchModal.vue';

const PassThroughStub = defineComponent({
  // The stub renders a bare fragment, so Vue can't inherit the class/@close
  // that SearchModal puts on Dialog/DialogPanel — opt out to avoid warnings.
  inheritAttrs: false,
  props: ['show', 'open', 'as'],
  emits: ['close'],
  setup(_, { slots }) {
    return () => slots.default?.();
  },
});

const NuxtLinkStub = defineComponent({
  name: 'NuxtLink',
  props: ['to'],
  setup(props, { slots }) {
    return () => h('a', { href: JSON.stringify(props.to) }, slots.default?.());
  },
});

enableAutoUnmount(afterEach);

function mountModal(props: InstanceType<typeof SearchModal>['$props']) {
  return mount(SearchModal, {
    props,
    // Attached to the document so keyboard navigation can find items by id
    attachTo: document.body,
    global: {
      mocks: { $t: (key: string) => key },
      stubs: {
        Dialog: PassThroughStub,
        DialogPanel: PassThroughStub,
        TransitionRoot: PassThroughStub,
        TransitionChild: PassThroughStub,
        NuxtLink: NuxtLinkStub,
      },
    },
  });
}

const mainResult = { url: '/post-a', meta: { title: 'Post A' }, excerpt: 'main excerpt' };

describe('searchModal', () => {
  it('renders no sub-results list when a result has none', () => {
    const wrapper = mountModal({ open: true, query: 'test', results: [mainResult] });

    expect(wrapper.findAll('ul ul')).toHaveLength(0);
  });

  it('drops the first sub-result when it duplicates the main result url, capping the rest at 3', () => {
    const wrapper = mountModal({
      open: true,
      query: 'test',
      results: [{
        ...mainResult,
        sub_results: [
          { url: '/post-a', title: 'Post A', excerpt: 'dup of main' },
          { url: '/post-a#one', title: 'Section One', excerpt: 'excerpt one' },
          { url: '/post-a#two', title: 'Section Two', excerpt: 'excerpt two' },
          { url: '/post-a#three', title: 'Section Three', excerpt: 'excerpt three' },
          { url: '/post-a#four', title: 'Section Four', excerpt: 'excerpt four' },
        ],
      }],
    });

    const subResultTitles = wrapper.findAll('ul ul a span:first-child');
    expect(subResultTitles.map(l => l.text())).toEqual([
      'Section One',
      'Section Two',
      'Section Three',
    ]);
  });

  it('keeps all sub-results when the first one does not duplicate the main result url', () => {
    const wrapper = mountModal({
      open: true,
      query: 'test',
      results: [{
        ...mainResult,
        sub_results: [
          { url: '/post-a#one', title: 'Section One', excerpt: 'excerpt one' },
          { url: '/post-a#two', title: 'Section Two', excerpt: 'excerpt two' },
        ],
      }],
    });

    const subResultTitles = wrapper.findAll('ul ul a span:first-child');
    expect(subResultTitles.map(l => l.text())).toEqual(['Section One', 'Section Two']);
  });

  describe('keyboard navigation', () => {
    const resultsWithSubs = [
      {
        ...mainResult,
        sub_results: [
          { url: '/post-a#one', title: 'Section One', excerpt: 'excerpt one' },
        ],
      },
      { url: '/post-b', meta: { title: 'Post B' }, excerpt: 'second excerpt' },
    ];

    it('preselects the first result and walks results and sub-results in visual order, wrapping around', async () => {
      const wrapper = mountModal({ open: true, query: 'test', results: resultsWithSubs });
      const input = wrapper.find('input');
      const activeId = () => input.attributes('aria-activedescendant');

      expect(activeId()).toBe('search-result-0');

      await input.trigger('keydown', { key: 'ArrowDown' });
      expect(activeId()).toBe('search-result-1');
      expect(wrapper.find('#search-result-1').text()).toContain('Section One');

      await input.trigger('keydown', { key: 'ArrowDown' });
      expect(activeId()).toBe('search-result-2');
      expect(wrapper.find('#search-result-2').text()).toContain('Post B');

      await input.trigger('keydown', { key: 'ArrowDown' });
      expect(activeId()).toBe('search-result-0');

      await input.trigger('keydown', { key: 'ArrowUp' });
      expect(activeId()).toBe('search-result-2');
    });

    it('highlights the active item', async () => {
      const wrapper = mountModal({ open: true, query: 'test', results: resultsWithSubs });

      expect(wrapper.find('#search-result-0').classes()).toContain('bg-gray-50');
      expect(wrapper.find('#search-result-1').classes()).not.toContain('bg-gray-50');

      await wrapper.find('input').trigger('keydown', { key: 'ArrowDown' });

      expect(wrapper.find('#search-result-0').classes()).not.toContain('bg-gray-50');
      expect(wrapper.find('#search-result-1').classes()).toContain('bg-gray-50');
    });

    it('opens the highlighted result on Enter', async () => {
      const wrapper = mountModal({ open: true, query: 'test', results: resultsWithSubs });
      const input = wrapper.find('input');

      await input.trigger('keydown', { key: 'ArrowDown' });
      await input.trigger('keydown', { key: 'Enter' });

      // Enter clicks the highlighted link, whose click handler closes the modal
      expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('resets the highlight to the first item when results change', async () => {
      const wrapper = mountModal({ open: true, query: 'test', results: resultsWithSubs });
      const input = wrapper.find('input');

      await input.trigger('keydown', { key: 'ArrowDown' });
      expect(input.attributes('aria-activedescendant')).toBe('search-result-1');

      await wrapper.setProps({ results: [{ url: '/post-c', meta: { title: 'Post C' }, excerpt: 'new' }] });
      expect(input.attributes('aria-activedescendant')).toBe('search-result-0');
    });

    it('does nothing on Enter when there are no results', async () => {
      const wrapper = mountModal({ open: true, query: 'test', results: [] });

      await wrapper.find('input').trigger('keydown', { key: 'Enter' });

      expect(wrapper.emitted('close')).toBeUndefined();
    });
  });
});
