import type { Meta, StoryObj } from "@storybook/vue3";
import { createDefaultStory } from "~/utils/createDefaultStory";

import BlogPost from "./BlogPost.vue";

const meta = {
  title: "Components/BlogPost",
  // @ts-ignore
  component: BlogPost,
} satisfies Meta<typeof BlogPost>;

export default meta;
export type Story = StoryObj<typeof meta>;

const defaultStory = createDefaultStory((_: Story) => ({
  args: {} as Story["args"],
  // We have to add a Render function so we can use these stories in tests
  render: (props) => h(BlogPost, props),
}));

export const Default: Story = defaultStory();
