import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

import AppHeader from './AppHeader.vue';

const meta = {
  title: 'Components/Header',
  component: AppHeader,
  args: {
    navigation: [{ label: 'Blog', to: '#' }],
    colorMode: 'system',
  },
  render: args => ({
    components: { AppHeader },
    setup() {
      const colorMode = ref('system');
      return { args, colorMode };
    },
    template: `<AppHeader v-bind="args" v-model="colorMode"  />`,
  }),
} satisfies Meta<typeof AppHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
