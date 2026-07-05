import type { Meta, StoryObj } from '@storybook/vue3-vite';

import LikeButton from './LikeButton.vue';

const meta = {
  title: 'Components/LikeButton',
  component: LikeButton,
} satisfies Meta<typeof LikeButton>;

export default meta;
export type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    count: 11,
    liked: false,
  },
};

export const Liked: Story = {
  args: {
    count: 12,
    liked: true,
  },
};

export const WithoutCount: Story = {
  args: {
    count: 0,
    liked: false,
  },
};
