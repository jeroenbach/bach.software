import type { Meta, StoryObj } from "@storybook/vue3-vite";

import AppLink from "./AppLink.vue";

const meta = {
  title: "Components/AppLink",
  component: AppLink,
  render: (args) => ({
    components: { AppLink },
    setup() {
      return { args };
    },
    template: `<div class="flex flex-col gap-4">
      <div class="flex"><AppLink v-bind="args" /></div>
    </div>`,
  }),
} satisfies Meta<typeof AppLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: "Default AppLink",
    to: "#",
  },
};

export const Blue: Story = {
  args: {
    ...Default.args,
    text: "Blue AppLink",
    color: "blue",
  },
};

export const Gray: Story = {
  args: {
    ...Default.args,
    text: "Gray AppLink",
    color: "gray",
  },
};
