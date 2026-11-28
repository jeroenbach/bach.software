import type { Meta, StoryObj } from '@storybook/vue3-vite';

import AppBackground from './AppBackground.vue';

const meta = {
  title: 'Elements/AppBackground',
  component: AppBackground,
  args: {
    background: 'white',
  },
  render: args => ({
    components: { AppBackground },
    setup() {
      return { args };
    },
    template: `<AppBackground v-bind="args" class="rounded-lg border border-gray-200 p-8 dark:border-gray-700">Text on the page background</AppBackground>`,
  }),
} satisfies Meta<typeof AppBackground>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Gray: Story = {
  args: {
    background: 'gray',
  },
};
