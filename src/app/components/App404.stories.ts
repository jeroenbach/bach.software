import type { Meta, StoryObj } from '@storybook/vue3-vite';

import App404 from './App404.vue';

const meta = {
  title: 'Components/App404',
  component: App404,
} satisfies Meta<typeof App404>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
