import type { Meta, StoryObj } from "@storybook/vue3";
import { createDefaultStory } from "~/utils/createDefaultStory";

import ThemeSwitcher from "./ThemeSwitcher.vue";

const meta = {
  title: "Components/ThemeSwitcher",
  // @ts-ignore
  component: ThemeSwitcher,
} satisfies Meta<typeof ThemeSwitcher>;

export default meta;
export type Story = StoryObj<typeof meta>;

const defaultStory = createDefaultStory((_: Story) => ({
  args: {} as Story["args"],
  // We have to add a Render function so we can use these stories in tests
  // render: (props) => h(ThemeSwitcher, props),
}));

export const Default: Story = defaultStory();
