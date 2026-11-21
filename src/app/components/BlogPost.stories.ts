import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { buildPost } from '~/tests/builders/postBuilder';
import BlogPost from './BlogPost.vue';

const meta = {
  title: 'Components/BlogPost',
  component: BlogPost,
} satisfies Meta<typeof BlogPost>;

export default meta;
export type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    post: buildPost(),
    baseUrl: 'https://bach.software',
    reads: {
      readCount: 11,
    },
    likes: 5,
    hasLiked: false,
  },
};

export const Liked: Story = {
  args: {
    ...Default.args,
    likes: 6,
    hasLiked: true,
  },
};
