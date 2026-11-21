import type { Meta, StoryObj } from '@storybook/vue3-vite';

import AppTransition from './AppTransition.vue';

// The slide itself is a motion, so only the settled state is captured.
const meta = {
  title: 'Elements/AppTransition',
  component: AppTransition,
  args: {
    name: 'slide-up',
  },
  render: args => ({
    components: { AppTransition },
    setup() {
      return { args };
    },
    template: `<AppTransition v-bind="args"><p>Content that slides into place.</p></AppTransition>`,
  }),
} satisfies Meta<typeof AppTransition>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
