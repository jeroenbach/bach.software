import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { tableOfContentsFixture } from '~/tests/storybook/fixtures/tableOfContentsFixture';
import TableOfContentsList from './TableOfContentsList.vue';

const meta = {
  title: 'Components/TableOfContentsList',
  component: TableOfContentsList,
  args: {
    links: tableOfContentsFixture,
  },
} satisfies Meta<typeof TableOfContentsList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActiveSection: Story = {
  args: {
    activeId: 'maintenance',
  },
};

export const NestedChildren: Story = {
  args: {
    links: [
      {
        id: 'part-one',
        text: 'Part one',
        depth: 2,
        children: [
          {
            id: 'chapter-one',
            text: 'Chapter one',
            depth: 3,
            children: [{ id: 'section-one', text: 'Section one', depth: 4 }],
          },
        ],
      },
    ],
    activeId: 'section-one',
  },
};

export const Empty: Story = {
  args: {
    links: [],
  },
};
