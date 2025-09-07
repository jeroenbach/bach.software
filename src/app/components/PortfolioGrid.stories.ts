import type { Meta, StoryObj } from '@storybook/vue3-vite';

import type { PortfolioItem } from '~/types/PortfolioItem';

import PortfolioGrid from '~/components/PortfolioGrid.vue';
import { readMarkdown } from '~/utils/markdown';
import portfolioPage from '../content/en/pages/2.portfolio.md?raw';

const { attributes } = readMarkdown<{
  portfolio: PortfolioItem[]
}>(portfolioPage);
const meta = {
  title: 'Components/PortfolioGrid',
  component: PortfolioGrid,
  args: {
    portfolio: attributes.portfolio || [],
  },
  render: args => ({
    components: { PortfolioGrid },
    setup() {
      return { args, attributes };
    },
    template: `<PortfolioGrid v-bind="args" />`,
  }),
} satisfies Meta<typeof PortfolioGrid>;

export default meta;
export type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {} as Story['args'],
};
