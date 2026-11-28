import type { Meta, StoryObj } from '@storybook/vue3-vite';

import SearchModal from './SearchModal.vue';

const results = [
  {
    url: '/posts/2-privacy-friendly-analytics',
    meta: { title: 'Privacy-friendly analytics with Plausible' },
    excerpt: 'Gather website <mark>analytics</mark> without showing consent banners.',
    sub_results: [
      {
        url: '/posts/2-privacy-friendly-analytics#what-is-plausible',
        title: 'What is Plausible?',
        excerpt: 'A lightweight, open-source alternative for <mark>analytics</mark>.',
      },
      {
        url: '/posts/2-privacy-friendly-analytics#hosting',
        title: 'Hosting costs',
        excerpt: 'Running the <mark>analytics</mark> stack on a small Kubernetes cluster.',
      },
    ],
  },
  {
    url: '/posts/1-vue-generics',
    meta: { title: 'Vue 3.3 generics and conditional properties' },
    excerpt: 'Typed components, <mark>analytics</mark> of props and conditional properties.',
  },
];

const manyResults = Array.from({ length: 8 }, (_, index) => ({
  url: `/posts/${index + 1}-post-${index + 1}`,
  meta: { title: `Post number ${index + 1} about search` },
  excerpt: `An excerpt of post ${index + 1} with the <mark>search</mark> term highlighted.`,
}));

// The dialog portals to the body, outside the per-theme wrapper, so each theme is captured on its own.
const meta = {
  title: 'Components/SearchModal',
  component: SearchModal,
  parameters: {
    singleTheme: true,
  },
  args: {
    open: true,
    query: '',
    results: [],
    status: 'idle',
  },
} satisfies Meta<typeof SearchModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithResults: Story = {
  args: {
    query: 'analytics',
    results,
  },
};

export const ManyResults: Story = {
  args: {
    query: 'search',
    results: manyResults,
  },
};

export const Loading: Story = {
  args: {
    query: 'analytics',
    status: 'loading',
  },
};

export const NoResults: Story = {
  args: {
    query: 'nothing matches this',
  },
};

export const Unavailable: Story = {
  args: {
    query: 'analytics',
    status: 'unavailable',
  },
};
