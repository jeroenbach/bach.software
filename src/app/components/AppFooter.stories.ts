import type { Meta, StoryObj } from "@storybook/vue3-vite";

import AppFooter from "./AppFooter.vue";

import { createDefaultStory } from "~/utils/createDefaultStory";

const meta = {
  title: "Components/Footer",
  component: AppFooter,
  args: {},
} satisfies Meta<typeof AppFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultStory = createDefaultStory((_: Story) => ({
  args: {},
}));

export const Default: Story = defaultStory();
