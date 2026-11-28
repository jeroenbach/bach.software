import type { Meta, StoryObj } from '@storybook/vue3-vite';

import BlogPostPagination from './BlogPostPagination.vue';

const meta = {
  title: 'Components/BlogPostPagination',
  component: BlogPostPagination,
  args: {
    page: 1,
    pageSize: 10,
    totalCount: 100,
    query: {},
  },
} satisfies Meta<typeof BlogPostPagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MiddlePage: Story = {
  args: {
    page: 5,
  },
};

export const LastPage: Story = {
  args: {
    page: 10,
  },
};

export const FewPages: Story = {
  args: {
    page: 2,
    totalCount: 30,
  },
};

/** One page of results renders nothing; kept so the hidden state stays documented. */
export const SinglePage: Story = {
  args: {
    totalCount: 5,
  },
};
