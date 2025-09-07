import type { Meta, StoryObj } from '@storybook/vue3-vite';

import Alert from './AlertBar.vue';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  args: {
    title: 'Alert title',
    description: 'Alert description',
    disableTeleport: true,
  },
  render: args => ({
    components: { Alert },
    setup() {
      return { args };
    },
    template: `
      <Alert v-bind="args" severity="info" />
      <Alert v-bind="args" severity="success" />
      <Alert v-bind="args" severity="warning" />
      <Alert v-bind="args" severity="error" />
    `,
  }),
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
