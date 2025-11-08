import type { PostsEnCollectionItem } from '@nuxt/content';

import type { Author } from '~/types/Author';

export interface BlogPost extends PostsEnCollectionItem, Metadata {
  author?: Author
}
