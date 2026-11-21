import type { Meta, StoryObj } from '@storybook/vue3-vite';

import AppIcon from './AppIcon.vue';

const meta = {
  title: 'Elements/AppIcon',
  component: AppIcon,
  args: {
    icon: 'X',
  },
  render: args => ({
    components: { AppIcon },
    setup() {
      return { args };
    },
    template: `<span class="inline-flex rounded-full bg-sky-600 p-3 text-white"><AppIcon v-bind="args" class="size-6" /></span>`,
  }),
} satisfies Meta<typeof AppIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Linkedin: Story = {
  args: {
    icon: 'Linkedin',
  },
};

export const Whatsapp: Story = {
  args: {
    icon: 'Whatsapp',
  },
};

export const Email: Story = {
  args: {
    icon: 'Email',
  },
};

export const GitHub: Story = {
  args: {
    icon: 'GitHub',
  },
};
