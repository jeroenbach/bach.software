import type { Meta, StoryObj } from "@storybook/vue3";
import { createDefaultStory } from "~/utils/createDefaultStory";

import AppImage from "./AppImage.vue";

const meta = {
  title: "Components/AppImage",
  // @ts-ignore
  component: AppImage,
} satisfies Meta<typeof AppImage>;

export default meta;
export type Story = StoryObj<typeof meta>;

const defaultStory = createDefaultStory((_: Story) => ({
  args: {
    src: "/JEROEN-4238-HD.jpeg",
    alt: "alt text",
    caption: "Figure caption",
    class: "w-full",
  } as Story["args"],
  // Render function used in tests
  render: (props) => h(AppImage, props),
}));

export const Default: Story = defaultStory();

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
