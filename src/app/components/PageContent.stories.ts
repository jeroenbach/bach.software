import type { Meta, StoryObj } from '@storybook/vue3-vite';

import PageContent from './PageContent.vue';

const meta = {
  title: 'Elements/PageContent',
  component: PageContent,
  render: args => ({
    components: { PageContent },
    setup() {
      return { args };
    },
    template: `<PageContent v-bind="args">
      <AppProse>
        <h2>About this page</h2>
        <p>Page content adds the horizontal padding shared by every page section and centers its slot.</p>
        <p>Anything placed in the default slot is rendered inside that frame.</p>
      </AppProse>
    </PageContent>`,
  }),
} satisfies Meta<typeof PageContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
