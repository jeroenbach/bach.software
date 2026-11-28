import type { Meta, StoryObj } from '@storybook/vue3-vite';

import AppMarkdown from './AppMarkdown.vue';

const meta = {
  title: 'Elements/AppMarkdown',
  component: AppMarkdown,
  args: {
    text: 'Some **bold** and _italic_ text with a [link](https://bach.software).',
  },
} satisfies Meta<typeof AppMarkdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithList: Story = {
  args: {
    text: 'Highlights:\n\n- The first bullet\n- The second bullet\n- The third bullet',
  },
};

export const Empty: Story = {
  args: {
    text: '',
  },
};
