import type { Meta, StoryObj } from '@storybook/vue3-vite';

import AppHero from '~/components/AppHero.vue';

const meta = {
  title: 'Components/AppHero',
  component: AppHero,
  args: {
    intro: 'Hello, my name is',
    title: 'Jeroen Bach',
    subTitle: 'Software Engineer & Team Lead',
    imgSrc: '/JEROEN-_A7R5652-HD-SQUARE-zoom.jpg',
    imgAlt: 'Jeroen Bach',
  },
  render: args => ({
    components: { AppHero },
    setup() {
      return { args };
    },
    template: `<AppHero v-bind="args">
      <div>
        I'm a Software Engineer and Team Lead with over 15 years of professional experience.
        I'm passionate about solving complex problems through simple, elegant solutions.
        This blog is where I share techniques and insights for building great software, inspired by real-world projects.

        Scroll down to explore my background and the projects I've worked on.
      </div>
    </AppHero>`,
  }),
} satisfies Meta<typeof AppHero>;

export default meta;
export type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {} as Story['args'],
};
