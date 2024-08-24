import type { Meta, StoryObj } from "@storybook/vue3";

import MyNuxtWelcome from "./MyWelcome.vue";

// More on how to set up stories at: https://storybook.js.org/docs/vue/writing-stories/introduction

const meta = {
  title: "Example/NuxtWelcome",
  component: MyNuxtWelcome,
} satisfies Meta<typeof MyNuxtWelcome>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NuxtWelcomeStory: Story = {
  args: {},
};
