import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { buildBlogPostSummary } from '~/tests/storybook/fixtures/blogPostFixture';
import BlogPostSummary from './BlogPostSummary.vue';

const meta = {
  title: 'Components/BlogPostSummary',
  component: BlogPostSummary,
  args: {
    post: buildBlogPostSummary(),
  },
} satisfies Meta<typeof BlogPostSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongTitle: Story = {
  args: {
    post: buildBlogPostSummary({
      title: 'A very long post title that keeps going to show how the summary wraps a heading across several lines instead of truncating it',
    }),
  },
};

export const WithoutImage: Story = {
  args: {
    post: buildBlogPostSummary({ imageUrl: undefined }),
  },
};

export const WithImagePosition: Story = {
  args: {
    post: buildBlogPostSummary({ imageUrl: '/JEROEN-4238-HD.jpeg', imagePosition: 'object-top' }),
  },
};
