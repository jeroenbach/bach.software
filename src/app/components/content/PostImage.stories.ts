import type { Meta, StoryObj } from '@storybook/vue3-vite';

import PostImage from './PostImage.vue';

const meta = {
  title: 'Components/PostImage',
  component: PostImage,
  args: {
    src: 'posts/1/cover.jpeg',
    alt: 'Cover image of a blog post',
  },
  render: args => ({
    components: { PostImage },
    setup() {
      return { args };
    },
    template: `<figure class="max-w-md"><PostImage v-bind="args" /></figure>`,
  }),
} satisfies Meta<typeof PostImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCaption: Story = {
  args: {
    caption: 'The cover image of the first post',
  },
};
