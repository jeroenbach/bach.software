import type { Meta, StoryObj } from "@storybook/vue3";
import { fn } from "@storybook/test";
import { createDefaultStory } from "~/utils/createDefaultStory";

import Alert from "./Alert.vue";

const meta = {
  title: "Components/Alert",
  component: Alert,
  args: { onClose: fn() },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultStory = createDefaultStory((_: Story) => ({
  args: {
    title: "Alert title",
  },
}));

export const Default: Story = defaultStory();

export const Second: Story = defaultStory((story) => {
  story.args.title = "Second Alert title";
});
