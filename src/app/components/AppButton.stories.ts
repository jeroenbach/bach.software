import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { PlusIcon } from '@heroicons/vue/24/outline';

import AppButton from './AppButton.vue';

const meta = {
  title: 'Elements/AppButton',
  component: AppButton,
} satisfies Meta<typeof AppButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => ({
    components: { AppButton },
    setup() {
      return { args };
    },
    template: `<AppButton v-bind="args" class="rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white">Button text</AppButton>`,
  }),
};

export const WithIcon: Story = {
  render: args => ({
    components: { AppButton, PlusIcon },
    setup() {
      return { args };
    },
    template: `<AppButton v-bind="args" class="inline-flex items-center gap-x-1 rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white">
      <PlusIcon class="size-5" aria-hidden="true" />
      Add item
    </AppButton>`,
  }),
};
