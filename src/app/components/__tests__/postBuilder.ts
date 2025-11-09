import type { BlogPost } from '~/types/BlogPost';

import { buildAuthor } from './authorBuilder';

export function buildPost(fn?: (post: BlogPost) => void) {
  const post: BlogPost = {
    contentId: 1,
    title: 'Title',
    description: 'Description',
    category: 'Category',
    authorName: 'author',
    author: buildAuthor((a) => {
      a.userName = 'author';
    }),
    datePublished: '2024-11-05T08:00:00.000Z',
    dateModified: '2024-11-05T08:00:00.000Z',
    imageUrl: '/posts/1/cover.jpeg',
    keywords: ['keyword', 'keyword2', 'keyword3'],
    excerpt: {
      type: 'root',
      children: [
        {
          type: 'element',
          tag: 'p',
          props: {},
          children: [
            {
              type: 'text',
              value: 'Introduction',
            },
          ],
        },
      ],
    },
    body: {
      type: 'minimark',
      value: [],
    },
    url: '/posts/1-vue-3_3-generics-and-conditional-properties',
    path: '',
    seo: {
      title: undefined,
      description: undefined,
    },
    id: '',
    stem: '',
    extension: '',
    meta: {},
    readingTime: {
      text: '11 min read',
      minutes: 11,
      time: 0,
      words: 0,
    },
  };
  if (fn)
    fn(post);
  return post;
}
