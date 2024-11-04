import type { Meta, StoryObj } from "@storybook/vue3";
import { fn } from "@storybook/test";
import { createDefaultStory } from "~/utils/createDefaultStory";

import NotificationMessage from "./NotificationMessage.vue";
import NotificationContainer from "./NotificationContainer.vue";

/** Unfortunately decorators & templates don't work in storybook in combination with Nuxt, therefore a simple render function for grouping */
const wrapper = () =>
  h("div", { class: "p-5" }, [
    h(NotificationContainer),
    h(NotificationMessage, {
      title: "Notification title",
      description: "Notification description",
      severity: "info",
      onClose: fn(),
    }),
    h(NotificationMessage, {
      title: "Notification title",
      description: "Notification description",
      severity: "success",
      onClose: fn(),
    }),
    h(NotificationMessage, {
      title: "Notification title",
      description: "Notification description",
      severity: "warning",
      onClose: fn(),
    }),
    h(NotificationMessage, {
      title: "Notification title",
      description: "Notification description",
      severity: "error",
      onClose: fn(),
    }),
    h(NotificationMessage, {
      title: "Notification title",
      description: "Notification description",
      severity: "info",
      options: { closeIn: 5000 },
      onClose: fn(),
    }),
  ]);

const meta = {
  title: "Components/NotificationMessage",
  // @ts-ignore
  component: wrapper,
  args: { onClose: fn() },
} satisfies Meta<typeof wrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultStory = createDefaultStory((_: Story) => ({
  args: {
    title: "Notification title",
  },
}));

export const Default: Story = defaultStory();
