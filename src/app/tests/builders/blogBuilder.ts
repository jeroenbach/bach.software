import type { Page } from '~/types/Page';

import { buildCompany } from './companyBuilder';

export function buildBlog(fn?: (blog: Page) => void) {
  const blog: Page = {
    contentId: 10,
    title: 'Blog',
    description: 'Description',
    url: '/blog',
    imageUrl: '/blog/logo.png',
    imageAlt: 'Blog Logo',
    company: buildCompany(),
    body: { toc: undefined, type: 'minimark', value: [] },
    dateModified: '2024-11-05T08:00:00.000Z',
    datePublished: '2024-11-05T08:00:00.000Z',
    path: '',
    seo: {
      title: undefined,
      description: undefined,
    },
    id: '',
    stem: '',
    extension: '',
    meta: {},
  };
  if (fn)
    fn(blog);
  return blog;
}
