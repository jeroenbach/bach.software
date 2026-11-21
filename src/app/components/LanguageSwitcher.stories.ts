import type { Meta, StoryObj } from '@storybook/vue3-vite';

import LanguageSwitcher from './LanguageSwitcher.vue';

const meta = {
  title: 'Components/LanguageSwitcher',
  component: LanguageSwitcher,
  args: {
    language: 'en',
  },
} satisfies Meta<typeof LanguageSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Dutch: Story = {
  args: {
    language: 'nl',
  },
};

export const German: Story = {
  args: {
    language: 'de',
  },
};
