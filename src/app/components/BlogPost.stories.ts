import type { Meta, StoryObj } from "@storybook/vue3";

import BlogPost from "./BlogPost.vue";
import { buildPost } from "./__tests__/postBuilder";

import { createDefaultStory } from "~/utils/createDefaultStory";

const meta = {
  title: "Components/BlogPost",
  component: BlogPost,
} satisfies Meta<typeof BlogPost>;

export default meta;
export type Story = StoryObj<typeof meta>;

const defaultStory = createDefaultStory((_: Story) => ({
  args: {
    post: buildPost(),
    baseUrl: "https://bach.software",
  } as Story["args"],
  // We have to add a Render function so we can use these stories in tests
  render: (props) => h(BlogPost, props),
}));

export const Default: Story = defaultStory();
