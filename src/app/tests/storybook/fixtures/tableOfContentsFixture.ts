import type { TocLink } from '@nuxt/content';

export const tableOfContentsFixture: TocLink[] = [
  { id: 'what-is-plausible-io', text: 'What is Plausible.io?', depth: 2 },
  {
    id: 'self-hosting-vs-hosted-solution',
    text: 'Self-hosting vs. Hosted Solution',
    depth: 2,
    children: [
      { id: 'hosting-costs', text: 'Hosting costs', depth: 3 },
      { id: 'maintenance', text: 'Maintenance', depth: 3 },
    ],
  },
  { id: 'conclusion', text: 'Conclusion', depth: 2 },
];
