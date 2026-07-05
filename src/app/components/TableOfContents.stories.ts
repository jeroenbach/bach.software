import type { Meta, StoryObj } from '@storybook/vue3-vite';

import TableOfContents from './TableOfContents.vue';

const links = [
  { id: 'what-is-plausible-io', text: 'What is Plausible.io?', depth: 2 },
  {
    id: 'self-hosting-vs-hosted-solution',
    text: 'Self-hosting vs. Hosted Solution',
    depth: 2,
    children: [
      { id: 'hosting-costs', text: 'Hosting costs', depth: 3 },
      { id: 'maintenance', text: 'Maintenance', depth: 3 },
    ],
  },
  { id: 'conclusion', text: 'Conclusion', depth: 2 },
];

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
