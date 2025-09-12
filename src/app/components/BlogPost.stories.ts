import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { buildPost } from './__tests__/postBuilder';
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
  },
};
