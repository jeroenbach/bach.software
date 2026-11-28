import type { Meta, StoryObj } from '@storybook/vue3-vite';

import CurriculumVitaeTable from '~/components/CurriculumVitaeTable.vue';
import { curriculumVitaeFixture } from '~/tests/storybook/fixtures/curriculumVitaeFixture';

const meta = {
  title: 'Components/CurriculumVitaeTable',
  component: CurriculumVitaeTable,
  args: {
    curriculumVitae: curriculumVitaeFixture,
  },
  render: args => ({
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
  args: {} as Story['args'],
};

export const Empty: Story = {
  args: {
    curriculumVitae: [],
  },
};

export const SingleEntry: Story = {
  args: {
    curriculumVitae: curriculumVitaeFixture.slice(0, 1),
  },
};

export const EntryWithoutTechnologies: Story = {
  args: {
    curriculumVitae: [
      {
        title: 'Co-founder / Developer',
        company: 'Eludus',
        date: 'Jan 2007 - Dec 2013 (part-time)',
        description: 'Co-founded a small digital agency delivering websites, webshops and custom backend systems for SMEs.',
        technologies: [],
      },
    ],
  },
};
