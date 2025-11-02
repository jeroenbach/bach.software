import type { Meta, StoryObj } from '@storybook/vue3-vite';

import PortfolioGrid from '~/components/PortfolioGrid.vue';

const meta = {
  title: 'Components/PortfolioGrid',
  component: PortfolioGrid,
  args: {
    portfolio: [
      {
        title: 'Sofia Vera',
        description: 'I designed Sofia-Vera.com in **Figma** and created a theme for **PrestaShop**. Run the whole environment on **Azure Kubernetes Services**.',
        link: 'https://sofia-vera.com',
        liClass: 'lg:row-span-2',
        linkClass: 'max-lg:rounded-t-4xl lg:rounded-l-4xl',
        imgOption: 'sofiaVera',
      },
      {
        title: 'Travelbags',
        description: 'We build a high-performance e-commerce platform using **Vue.js**, **SSR**, **Node.js** and **.NET**. The project included CI/CD on **Azure DevOps** and containerization via **Docker**.',
        link: 'https://travelbags.nl',
        liClass: 'max-lg:row-start-2',
        imgOption: 'travelBags',
      },
      {
        title: 'Pavo',
        description: 'With the **travelbags.nl** webshop, we developed a **framework** that enables rapid development of e-commerce platforms.\n<br />\n<br />\nPavo.nl was the second webshop launched using this framework.',
        link: 'https://pavo.nl',
        liClass: 'max-lg:row-start-3 lg:col-start-2 lg:row-start-2',
        imgOption: 'pavo',
      },
      {
        title: 'Beauty Plaza',
        description: 'The third webshop we built using the **travelbags.nl** framework. It uses **Vue.js**, **SSR**, **Node.js** and **.NET**, with CI/CD on **Azure DevOps** and  containerization via **Docker**.',
        link: 'https://beautyPlaza.com',
        liClass: 'lg:row-span-2',
        linkClass: 'max-lg:rounded-b-4xl lg:rounded-r-4xl',
        imgOption: 'beautyPlaza',
      },
    ],
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
