import type { Meta, StoryObj } from "@storybook/vue3";
import { createDefaultStory } from "~/utils/createDefaultStory";

import ResponsiveImage from "./ResponsiveImage.vue";

const meta = {
  title: "Components/ResponsiveImage",
  // @ts-ignore
  component: ResponsiveImage,
} satisfies Meta<typeof ResponsiveImage>;

export default meta;
export type Story = StoryObj<typeof meta>;

const defaultStory = createDefaultStory((_: Story) => ({
  args: {
    src: "/JEROEN-4238-HD.jpeg",
    alt: "alt text",
    caption: "Figure caption",
    class: "w-full",
  } as Story["args"],
  // We have to add a Render function so we can use these stories in tests
  render: (props) => h(ResponsiveImage, props),
}));

export const Default: Story = defaultStory();

export const NoImage: Story = defaultStory((s) => {
  s.args = {
    ...s.args,
    src: undefined,
  };
});

export const OneSize: Story = defaultStory((s) => {
  s.args = {
    ...s.args,
    sizes: "320px",
  };
});

export const DifferentScreensSameSizesAndRatios: Story = defaultStory((s) => {
  s.args = {
    ...s.args,
    partOfScreen: 1,
    aspectRatio: "16/9",
  };
});

export const DifferentScreenSizesAndRatios: Story = defaultStory((s) => {
  s.args = {
    ...s.args,
    partOfScreenExtraSmall: 1,
    partOfScreenSmall: 1 / 2,
    partOfScreenMedium: 1 / 3,
    partOfScreenLarge: 1 / 4,
    partOfScreenExtraLarge: 1 / 5,
    partOfScreen2ExtraLarge: 1 / 6,
    aspectRatioExtraSmall: "1/1",
    aspectRatioSmall: "2/1",
    aspectRatioMedium: "16/9",
    aspectRatioLarge: "1/1",
    aspectRatioExtraLarge: "2/1",
    aspectRatio2ExtraLarge: "16/9",
  };
});
