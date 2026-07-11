import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import BlogPostFilter from './BlogPostFilter.vue';

const ChipLinkStub = defineComponent({
  name: 'ChipLink',
  props: ['to', 'chipColor'],
  setup(props, { slots }) {
    return () => h('div', { 'data-color': props.chipColor }, slots.default?.());
  },
});

function mountFilter(props: InstanceType<typeof BlogPostFilter>['$props']) {
  return mount(BlogPostFilter, {
    props,
    global: {
      mocks: {
        $t: (key: string, params?: Record<string, unknown>) => params ? `${key}:${JSON.stringify(params)}` : key,
      },
      stubs: { ChipLink: ChipLinkStub },
    },
  });
}

const categories = [
  { name: 'tech', count: 3 },
  { name: 'life', count: 1 },
];

describe('blogPostFilter', () => {
  it('renders a chip for "all" plus every category, with "all" active when no category is selected', () => {
    const wrapper = mountFilter({ categories, totalCount: 4, query: {} });

    const chips = wrapper.findAllComponents(ChipLinkStub);
    expect(chips).toHaveLength(3);
    expect(chips[0]!.text()).toBe('blog.filter.all');
    expect(chips[0]!.props('chipColor')).toBe('blue');
    expect(chips[1]!.text()).toBe('tech');
    expect(chips[1]!.props('chipColor')).toBe('gray');
    expect(chips[2]!.text()).toBe('life');
    expect(chips[2]!.props('chipColor')).toBe('gray');
  });

  it('marks the matching category chip as active and "all" as inactive', () => {
    const wrapper = mountFilter({ categories, totalCount: 4, query: { category: 'tech' } });

    const chips = wrapper.findAllComponents(ChipLinkStub);
    expect(chips[0]!.props('chipColor')).toBe('gray');
    expect(chips[1]!.props('chipColor')).toBe('blue');
    expect(chips[2]!.props('chipColor')).toBe('gray');
  });

  it('resets the category and page on the "all" chip while preserving other query parameters', () => {
    const wrapper = mountFilter({
      categories,
      totalCount: 4,
      query: { category: 'tech', page: '3', sort: 'asc' },
    });

    const [allChip] = wrapper.findAllComponents(ChipLinkStub);
    expect(allChip!.props('to')).toEqual({ query: { sort: 'asc' } });
  });

  it('sets the category and drops the page on a category chip while preserving other query parameters', () => {
    const wrapper = mountFilter({
      categories,
      totalCount: 4,
      query: { page: '3', sort: 'asc' },
    });

    const [, techChip] = wrapper.findAllComponents(ChipLinkStub);
    expect(techChip!.props('to')).toEqual({ query: { sort: 'asc', category: 'tech' } });
  });

  it('renders the total post count', () => {
    const wrapper = mountFilter({ categories, totalCount: 4, query: {} });

    expect(wrapper.text()).toContain('blog.filter.count:{"count":4}');
  });
});
