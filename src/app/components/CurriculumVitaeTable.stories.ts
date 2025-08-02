import type { Meta, StoryObj } from "@storybook/vue3-vite";

import about from "../content/en/pages/3.about.md?raw";

import { readMarkdown } from "~/utils/markdown";
import CurriculumVitaeTable from "~/components/CurriculumVitaeTable.vue";

const { attributes } = readMarkdown<AboutPage>(about);
const meta = {
  title: "Components/CurriculumVitaeTable",
  component: CurriculumVitaeTable,
  args: {
    curriculumVitae: attributes.curriculumVitae || [],
  },
  render: (args) => ({
    components: { CurriculumVitaeTable },
    setup() {
      return { args };
    },
    template: `<CurriculumVitaeTable v-bind="args" />`,
  }),
} satisfies Meta<typeof CurriculumVitaeTable>;

export default meta;
export type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {} as Story["args"],
};
