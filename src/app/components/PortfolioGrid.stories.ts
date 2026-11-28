import type { Meta, StoryObj } from '@storybook/vue3-vite';

import PortfolioGrid from '~/components/PortfolioGrid.vue';
import { portfolioFixture } from '~/tests/storybook/fixtures/portfolioFixture';

const meta = {
  title: 'Components/PortfolioGrid',
  component: PortfolioGrid,
  args: {
    portfolio: portfolioFixture,
  },
  render: args => ({
    components: { PortfolioGrid },
    setup() {
      return { args };
    },
    template: `<PortfolioGrid v-bind="args" />`,
  }),
} satisfies Meta<typeof PortfolioGrid>;

export default meta;
export type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {} as Story['args'],
};

export const Empty: Story = {
  args: {
    portfolio: [],
  },
};

export const SingleItem: Story = {
  args: {
    portfolio: [{ ...portfolioFixture[1]!, liClass: undefined }],
  },
};
