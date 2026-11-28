import type { Meta, StoryObj } from '@storybook/vue3-vite';

import AppImage from './AppImage.vue';

const meta = {
  title: 'Elements/AppImage',
  component: AppImage,
  args: {
    src: '/JEROEN-4238-SQUARE.jpeg',
    alt: 'Portrait of Jeroen Bach',
    class: 'w-40 rounded-lg',
  },
} satisfies Meta<typeof AppImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDimensions: Story = {
  args: {
    width: 120,
    height: 120,
    class: 'rounded-full',
  },
};
