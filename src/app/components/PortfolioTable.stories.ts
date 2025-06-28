import type { Meta, StoryObj } from "@storybook/vue3-vite";

import { readMarkdown } from "~/utils/markdown";
import PortfolioTable from "~/components/PortfolioTable.vue";
import about from "../content/en/pages/3.about.md?raw";
import type { Project } from "~/types/Project";

const { attributes } = readMarkdown<{
  projects: Project[];
}>(about);
const meta = {
  title: "Components/PortfolioTable",
  component: PortfolioTable,
  args: {
    projects: attributes.projects || [],
  },
  render: (args) => ({
    components: { PortfolioTable },
    setup() {
      return { args };
    },
    template: `<PortfolioTable v-bind="args" />`,
  }),
} satisfies Meta<typeof PortfolioTable>;

export default meta;
export type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {} as Story["args"],
};
