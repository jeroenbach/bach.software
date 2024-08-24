import type { Meta, StoryObj } from "@storybook/vue3";
import { fn } from "@storybook/test";

import Alert from "./Alert.vue";
import { createDefaultStory } from "~/utils/createDefaultStory";

const meta = {
  title: "Components/Alert",
  component: Alert,
  args: {},
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
