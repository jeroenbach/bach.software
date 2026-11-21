import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { buildBlogPostSummaries } from '~/tests/storybook/fixtures/blogPostFixture';
import BlogPosts from './BlogPosts.vue';
import BlogPostSummary from './BlogPostSummary.vue';

function renderPosts(count: number) {
  return () => ({
    components: { BlogPosts, BlogPostSummary },
    setup() {
      return { posts: buildBlogPostSummaries(count) };
    },
    template: `<BlogPosts>
      <BlogPostSummary v-for="post in posts" :key="post.id" :post="post" />
    </BlogPosts>`,
  });
}

const meta = {
  title: 'Elements/BlogPosts',
  component: BlogPosts,
} satisfies Meta<typeof BlogPosts>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: renderPosts(3),
};

export const SinglePost: Story = {
  render: renderPosts(1),
};

export const Empty: Story = {
  render: renderPosts(0),
};
