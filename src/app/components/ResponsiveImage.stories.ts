import type { Meta, StoryObj } from "@storybook/vue3-vite";

import ResponsiveImage from "~/components/ResponsiveImage.vue";

const meta = {
  title: "Components/ResponsiveImage",
  component: ResponsiveImage,
  args: {},
} satisfies Meta<typeof ResponsiveImage>;

export default meta;
export type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: "/JEROEN-4238-HD.jpeg",
    alt: "alt text",
    caption: "Figure caption",
    class: "w-full",
  } as Story["args"],
};

export const NoImage: Story = {
  args: {
    ...Default.args,
    src: undefined,
  },
};

export const OneSize: Story = {
  args: {
    ...Default.args,
    sizes: "320px",
  },
};
export const DifferentScreensSameSizesAndRatios: Story = {
  args: {
    ...Default.args,
    partOfScreen: 1,
    aspectRatio: "16/9",
  },
};

export const DifferentScreenSizesAndRatios: Story = {
  args: {
    ...Default.args,
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
  },
};
