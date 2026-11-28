import type { Meta, StoryObj } from '@storybook/vue3-vite';

import SearchButton from './SearchButton.vue';

const meta = {
  title: 'Components/SearchButton',
  component: SearchButton,
} satisfies Meta<typeof SearchButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
