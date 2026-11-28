import type { Page } from '~/types/Page';

import { buildCompany } from './companyBuilder';

export function buildPage(fn?: (page: Page) => void) {
  const page: Page = {
    contentId: 1,
    title: 'Page',
    description: 'Description',
    url: '/page',
    imageUrl: '/page/logo.png',
    imageAlt: 'Page Logo',
    company: buildCompany(),
    body: { toc: undefined, type: 'minimark', value: [] },
    dateModified: '2024-11-06T08:00:00.000Z',
    datePublished: '2024-11-06T08:00:00.000Z',
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
    fn(page);
  return page;
}
