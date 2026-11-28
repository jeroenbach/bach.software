import type { BlogPostSummary } from '~/types/BlogPostSummary';
import { buildAuthor } from '~/tests/builders/authorBuilder';
import { buildPost } from '~/tests/builders/postBuilder';

const summaries: { id: string, title: string, category: string, datePublished: string, imageUrl: string }[] = [
  {
    id: 'posts_en/1.md',
    title: 'Vue 3.3 generics and conditional properties',
    category: 'Vue',
    datePublished: '2024-11-05T12:00:00.000Z',
    imageUrl: '/posts/1/cover.jpeg',
  },
  {
    id: 'posts_en/2.md',
    title: 'Privacy-friendly analytics with Plausible on Kubernetes',
    category: 'DevOps',
    datePublished: '2024-09-18T12:00:00.000Z',
    imageUrl: '/posts/2/cover.jpeg',
  },
  {
    id: 'posts_en/3.md',
    title: 'Getting more out of your Azure DevOps pipelines',
    category: 'DevOps',
    datePublished: '2024-06-02T12:00:00.000Z',
    imageUrl: '/posts/3/cover.jpeg',
  },
];

export function buildBlogPostSummary(overrides: Partial<BlogPostSummary> = {}): BlogPostSummary {
  const post = buildPost((p) => {
    p.id = summaries[0]!.id;
    p.title = summaries[0]!.title;
    p.category = summaries[0]!.category;
    p.datePublished = summaries[0]!.datePublished;
    p.author = buildAuthor((a) => {
      a.fullName = 'Jeroen Bach';
    });
  });
  return { ...post, ...overrides };
}

/** Several distinct posts, for lists. */
export function buildBlogPostSummaries(count = summaries.length): BlogPostSummary[] {
  return summaries.slice(0, count).map(summary => buildBlogPostSummary(summary));
}
