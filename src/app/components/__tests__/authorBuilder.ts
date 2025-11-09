import type { Author } from '~/types/Author';

import { buildCompany } from './companyBuilder';

export function buildAuthor(fn?: (author: Author) => void) {
  const author: Author = {
    userName: 'author',
    fullName: 'First LastName',
    role: 'Freelance Solution Engineer',
    imageUrl: '/JEROEN-4238-SQUARE.jpeg',
    homePage: 'https://author.com/authors/author',
    linkedIn: 'https://www.linkedin.com/in/author/',
    company: buildCompany(),
    id: '',
    stem: '',
    extension: '',
    meta: {},
  };
  if (fn)
    fn(author);
  return author;
}
