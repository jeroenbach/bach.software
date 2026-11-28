import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { userEvent, within } from 'storybook/test';
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
    template: `<AppHeader v-bind="args" v-model="colorMode" />`,
  }),
} satisfies Meta<typeof AppHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithBorder: Story = {
  args: {
    border: true,
  },
};

export const WithoutNavigation: Story = {
  args: {
    navigation: [],
  },
};

export const WithExternalLink: Story = {
  args: {
    navigation: [
      { label: 'Blog', to: '#' },
      { label: 'GitHub', to: 'https://github.com', external: true },
    ],
  },
};

/** The menu only exists below the lg breakpoint, so the capture runs at a phone width. */
export const MobileMenuOpen: Story = {
  parameters: {
    singleTheme: true,
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByTestId('header-open-menu-button'));
    await within(document.body).findByRole('dialog');
  },
};
