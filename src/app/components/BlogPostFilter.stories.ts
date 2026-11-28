import type { Meta, StoryObj } from '@storybook/vue3-vite';

import BlogPostFilter from './BlogPostFilter.vue';

const categories = [
  { name: 'Vue', count: 4 },
  { name: 'DevOps', count: 3 },
  { name: '.NET', count: 2 },
];

const meta = {
  title: 'Components/BlogPostFilter',
  component: BlogPostFilter,
  args: {
    categories,
    totalCount: 9,
    query: {},
  },
} satisfies Meta<typeof BlogPostFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActiveCategory: Story = {
  args: {
    query: { category: 'DevOps' },
  },
};

export const ManyCategories: Story = {
  args: {
    categories: [
      ...categories,
      { name: 'Azure', count: 5 },
      { name: 'Kubernetes', count: 2 },
      { name: 'TypeScript', count: 6 },
      { name: 'Architecture', count: 1 },
      { name: 'Testing', count: 3 },
      { name: 'Performance', count: 2 },
      { name: 'Security', count: 4 },
      { name: 'Career', count: 1 },
    ],
    totalCount: 29,
  },
};

export const NoCategories: Story = {
  args: {
    categories: [],
    totalCount: 0,
  },
};
