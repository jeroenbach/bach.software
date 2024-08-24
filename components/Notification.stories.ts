import type { Meta, StoryObj } from "@storybook/vue3";
import { fn } from "@storybook/test";
import { createDefaultStory } from "~/utils/createDefaultStory";

import Notification from "./Notification.vue";
import NotificationContainer from "./NotificationContainer.vue";

/** Unfortunatly decorators & templates don't work in storybook in combination with Nuxt, therefore a simple render function for grouping */
const render = () =>
  h("div", { class: "p-5" }, [
    h(NotificationContainer),
    h(Notification, {
      title: "Notification title",
      description: "Notification description",
      severity: "info",
      onClose: fn(),
    }),
    h(Notification, {
      title: "Notification title",
      description: "Notification description",
      severity: "success",
      onClose: fn(),
    }),
    h(Notification, {
      title: "Notification title",
      description: "Notification description",
      severity: "warning",
      onClose: fn(),
    }),
    h(Notification, {
      title: "Notification title",
      description: "Notification description",
      severity: "error",
      onClose: fn(),
    }),
  ]);

const meta = {
  title: "Components/Notification",
  // @ts-ignore
  component: render,
  args: { onClose: fn() },
} satisfies Meta<typeof render>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultStory = createDefaultStory((_: Story) => ({
  args: {
    title: "Notification title",
  },
}));

export const Default: Story = defaultStory();
