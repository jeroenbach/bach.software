import type { Meta, StoryObj } from '@storybook/vue3-vite';

import AppError from './AppError.vue';

const meta = {
  title: 'Components/AppError',
  component: AppError,
  args: {
    title: '500',
    subTitle: 'Something went wrong',
    description: 'An unexpected error occurred while loading this page.',
    linkText: 'Go back home',
    linkLocation: '/',
  },
} satisfies Meta<typeof AppError>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TitleOnly: Story = {
  args: {
    subTitle: undefined,
    description: undefined,
    linkText: undefined,
    linkLocation: undefined,
  },
};
