import type { Meta, StoryObj } from '@storybook/vue3-vite';

import ColorModeSwitcher from './ColorModeSwitcher.vue';

const meta = {
  title: 'Components/ColorModeSwitcher',
  component: ColorModeSwitcher,
  args: {
    colorMode: 'system',
  },
} satisfies Meta<typeof ColorModeSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Light: Story = {
  args: {
    colorMode: 'light',
  },
};

export const Dark: Story = {
  args: {
    colorMode: 'dark',
  },
};
