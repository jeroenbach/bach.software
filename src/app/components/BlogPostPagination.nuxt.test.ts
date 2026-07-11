import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import BlogPostPagination from './BlogPostPagination.vue';

const NuxtLinkStub = defineComponent({
  name: 'NuxtLink',
  props: ['to'],
  setup(props, { slots }) {
    return () => h('a', {}, slots.default?.());
  },
});

function mountPagination(props: InstanceType<typeof BlogPostPagination>['$props']) {
  return mount(BlogPostPagination, {
    props,
    global: {
      mocks: { $t: (key: string) => key },
      stubs: { NuxtLink: NuxtLinkStub },
    },
  });
}

describe('blogPostPagination', () => {
  it('renders nothing when all posts fit on one page', () => {
    const wrapper = mountPagination({ page: 1, pageSize: 5, totalCount: 3 });

    expect(wrapper.find('nav').exists()).toBe(false);
  });

  it('renders a link per page and marks the current page as active', () => {
    const wrapper = mountPagination({ page: 1, pageSize: 5, totalCount: 15 });

    expect(wrapper.find('nav').exists()).toBe(true);
    expect(wrapper.find('span[aria-current="page"]').text()).toBe('1');

    const links = wrapper.findAllComponents(NuxtLinkStub);
    // previous is disabled on page 1, so only page 2, page 3 and next remain as links
    expect(links.map(l => l.text())).toEqual(['2', '3', 'blog.pagination.next']);
  });

  it('disables previous on the first page and next on the last page', () => {
    const firstPage = mountPagination({ page: 1, pageSize: 5, totalCount: 15 });
    expect(firstPage.find('span[aria-disabled="true"]').text()).toBe('blog.pagination.previous');

    const lastPage = mountPagination({ page: 3, pageSize: 5, totalCount: 15 });
    expect(lastPage.find('span[aria-disabled="true"]').text()).toBe('blog.pagination.next');
  });

  it('preserves other query parameters and drops page from the first-page link', () => {
    const wrapper = mountPagination({
      page: 1,
      pageSize: 5,
      totalCount: 15,
      query: { category: 'tech', page: '1' },
    });

    const links = wrapper.findAllComponents(NuxtLinkStub);
    expect(links.find(l => l.text() === '2')!.props('to')).toEqual({
      query: { category: 'tech', page: '2' },
    });
    expect(links.find(l => l.text() === '3')!.props('to')).toEqual({
      query: { category: 'tech', page: '3' },
    });
  });

  it('shows an ellipsis and only nearby pages when there are many pages', () => {
    const wrapper = mountPagination({ page: 5, pageSize: 5, totalCount: 50 });

    expect(wrapper.text()).toContain('…');
    expect(wrapper.find('span[aria-current="page"]').text()).toBe('5');

    const links = wrapper.findAllComponents(NuxtLinkStub);
    expect(links.map(l => l.text())).toEqual([
      'blog.pagination.previous',
      '1',
      '4',
      '6',
      '10',
      'blog.pagination.next',
    ]);
  });
});
