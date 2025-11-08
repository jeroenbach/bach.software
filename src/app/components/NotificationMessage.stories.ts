import type { Meta, StoryObj } from '@storybook/vue3-vite';

import NotificationMessage from './NotificationMessage.vue';

const meta = {
  title: 'Components/NotificationMessage',
  component: NotificationMessage,
  args: {
    title: 'NotificationMessage title',
    description: 'NotificationMessage description',
    disableTeleport: true,
  },
  render: args => ({
    components: { NotificationMessage },
    setup() {
      return { args };
    },
    template: `
      <NotificationMessage v-bind="args" severity="info" />
      <NotificationMessage v-bind="args" severity="success" />
      <NotificationMessage v-bind="args" severity="warning" />
      <NotificationMessage v-bind="args" severity="error" />
    `,
  }),
} satisfies Meta<typeof NotificationMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CloseIn: Story = {
  args: {
    ...Default.args,
    options: {
      closeIn: 50000,
    },
  },
};
