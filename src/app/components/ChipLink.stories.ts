import type { Meta, StoryObj } from '@storybook/vue3-vite';

import ChipLink from './ChipLink.vue';

const meta = {
  title: 'Components/ChipLink',
  component: ChipLink,
  render: args => ({
    components: { ChipLink },
    setup() {
      return { args };
    },
    template: `<div class="flex flex-col gap-4">
      <div class="flex"><ChipLink v-bind="args" /></div>
    </div>`,
  }),
} satisfies Meta<typeof ChipLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: 'Default ChipLink',
    to: '#',
  },
};

export const Plain: Story = {
  args: {
    text: 'Plain ChipLink',
    to: undefined,
  },
};

export const Blue: Story = {
  args: {
    ...Default.args,
    text: 'Blue ChipLink',
    chipColor: 'blue',
  },
};

export const LongText: Story = {
  args: {
    ...Default.args,
    text: 'A ChipLink with a label that is long enough to be wider than most containers',
  },
  render: args => ({
    components: { ChipLink },
    setup() {
      return { args };
    },
    template: `<div class="w-48"><ChipLink v-bind="args" /></div>`,
  }),
};
