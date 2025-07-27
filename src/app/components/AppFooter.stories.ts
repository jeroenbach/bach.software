import type { Meta, StoryObj } from "@storybook/vue3-vite";

import { readMarkdown } from "~/utils/markdown";
import { readYaml } from "~/utils/yaml";
import AppFooter from "./AppFooter.vue";
import about from "../content/en/pages/3.about.md?raw";
import footer from "../content/en/pages/_footer.md?raw";
import authorYaml from "../content/en/authors/jeroenbach.yaml?raw";

const author = readYaml<Author>(authorYaml);

const meta = {
  title: "Components/Footer",
  component: AppFooter,
  args: {
    short: false,
    linkedInUrl: "#",
    githubUrl: "#",
    imgSrc: author.imageUrl,
    imgAlt: author.fullName,
  },
  render: (args) => ({
    components: { AppFooter },
    setup() {
      const { bodyHtml: aboutHtml } = readMarkdown(about);
      const { bodyHtml: footerHtml } = readMarkdown(footer);
      return { args, aboutHtml, footerHtml };
    },
    template: `<AppFooter v-bind="args">
      <template #about>
        <div v-html="aboutHtml" />
      </template>
      <template #footer>
        <div v-html="footerHtml" />
      </template>
    </AppFooter>`,
  }),
} satisfies Meta<typeof AppFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Short: Story = {
  args: {
    ...Default.args,
    short: true,
  },
};
