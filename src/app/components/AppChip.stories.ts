import type { Meta, StoryObj } from '@storybook/vue3-vite';

import AppChip from './AppChip.vue';

const meta = {
  title: 'Elements/AppChip',
  component: AppChip,
  args: {
    color: 'gray',
  },
  render: args => ({
    components: { AppChip },
    setup() {
      return { args };
    },
    template: `<div class="w-48"><AppChip v-bind="args">Chip</AppChip></div>`,
  }),
} satisfies Meta<typeof AppChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Blue: Story = {
  args: {
    color: 'blue',
  },
};

export const LongText: Story = {
  render: args => ({
    components: { AppChip },
    setup() {
      return { args };
    },
    template: `<div class="w-48"><AppChip v-bind="args">A chip with a label that is long enough to wrap onto several lines</AppChip></div>`,
  }),
};
