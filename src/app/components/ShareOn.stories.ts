import type { Meta, StoryObj } from '@storybook/vue3-vite';

import ShareOn from './ShareOn.vue';

const meta = {
  title: 'Components/ShareOn',
  component: ShareOn,
  args: {
    url: 'https://bach.software/posts/1',
    text: 'Vue 3.3 generics and conditional properties',
  },
} satisfies Meta<typeof ShareOn>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SubsetOfIcons: Story = {
  args: {
    icons: ['Linkedin', 'Email'],
  },
};
