import type { Meta, StoryObj } from '@storybook/vue3-vite';

import AppProse from './AppProse.vue';

const meta = {
  title: 'Elements/AppProse',
  component: AppProse,
  render: args => ({
    components: { AppProse },
    setup() {
      return { args };
    },
    template: `<AppProse v-bind="args">
      <h1>A heading for the article</h1>
      <p>Prose styles the rendered markdown of posts and pages, with a <a href="#">link inside a paragraph</a> and some <code>inline code</code>.</p>
      <h2>A second level heading</h2>
      <ul>
        <li>The first list item</li>
        <li>The second list item</li>
      </ul>
      <blockquote><p>A quote that stands out from the surrounding text.</p></blockquote>
      <pre><code>const answer = 42;</code></pre>
    </AppProse>`,
  }),
} satisfies Meta<typeof AppProse>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
