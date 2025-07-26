import type { Meta, StoryObj } from "@storybook/vue3-vite";

import AppHero from "~/components/AppHero.vue";
import { readMarkdown } from "~/utils/markdown";
import { readYaml } from "~/utils/yaml";
import about from "../content/en/pages/3.about.md?raw";
import authorYaml from "../content/en/authors/jeroenbach.yaml?raw";
import type { Author } from "~/types/Author";

const { bodyHtml } = readMarkdown(about);
const author = readYaml<Author>(authorYaml);

const meta = {
  title: "Components/AppHero",
  component: AppHero,
  args: {
    intro: "Hello, my name is",
    title: `${author.fullName}.`,
    subTitle: `${author.role}.`,
    imgSrc: author.imageUrl,
    imgAlt: author.fullName,
  },
  render: (args) => ({
    components: { AppHero },
    setup() {
      return { args, bodyHtml };
    },
    template: `<AppHero v-bind="args">
      <div v-html="bodyHtml" />
    </AppHero>`,
  }),
} satisfies Meta<typeof AppHero>;

export default meta;
export type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {} as Story["args"],
};
