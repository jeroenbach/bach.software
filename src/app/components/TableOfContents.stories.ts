import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { tableOfContentsFixture } from '~/tests/storybook/fixtures/tableOfContentsFixture';
import TableOfContents from './TableOfContents.vue';

const links = tableOfContentsFixture;

const meta = {
  title: 'Components/TableOfContents',
  component: TableOfContents,
} satisfies Meta<typeof TableOfContents>;

export default meta;
export type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    links,
  },
};

export const WithActiveSection: Story = {
  args: {
    links,
    activeId: 'hosting-costs',
  },
};

export const Collapsible: Story = {
  args: {
    links,
    collapsible: true,
  },
};
