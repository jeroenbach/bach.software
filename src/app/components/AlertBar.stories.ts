import type { Meta, StoryObj } from "@storybook/vue3";
import { fn } from "@storybook/test";

import Alert from "./AlertBar.vue";

import { createDefaultStory } from "~/utils/createDefaultStory";


const variations = () =>
  h("div", { class: "p-5" }, [
    h(Alert, {
      title: "Alert title",
      description: "Alert description",
      severity: "info",
      onClose: fn(),
    }),
    h(Alert, {
      title: "Alert title",
      description: "Alert description",
      severity: "success",
      onClose: fn(),
    }),
    h(Alert, {
      title: "Alert title",
      description: "Alert description",
      severity: "warning",
      onClose: fn(),
    }),
    h(Alert, {
      title: "Alert title",
      description: "Alert description",
      severity: "error",
      onClose: fn(),
    }),
  ]);

/** Unfortunately decorators & templates don't work in storybook in combination with Nuxt, therefore a simple render function for grouping */
function render() {
  return h("div", [
    "Light mode",
    h(variations, { class: "light bg-white" }),
    "Dark mode",
    h(variations, { class: "dark bg-black text-white" }),
  ]);
}

const meta = {
  title: "Components/Alert",
  // @ts-expect-error to avoid type error with render function
  component: render,
  args: { onClose: fn() },
} satisfies Meta<typeof render>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultStory = createDefaultStory((_: Story) => ({
  args: {
    title: "Alert title",
  },
}));

export const Default: Story = defaultStory();
