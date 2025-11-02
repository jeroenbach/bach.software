import path from 'node:path';
import { defineCollection, defineContentConfig, z } from '@nuxt/content';
import { locales } from './locales.config';

const contentLocation = './src/app/content';

// Define schemas
export const contentMetadataSchema = z.object({
  contentId: z.number(),
  title: z.string(),
  description: z.string(),
  datePublished: z.string(),
  dateModified: z.string(),
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
  canonicalUrl: z.string().optional(),
});

export const companySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  url: z.string(),
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
});

export const pageSchema = z.object({
  ...contentMetadataSchema.shape,
  excludeFromNavigation: z.boolean().optional(),
  enableProse: z.boolean().optional(),
  draft: z.boolean().optional(),
  partial: z.boolean().optional(),
  url: z.string().optional(),
  slug: z.string().optional(),
  company: z.object({ ...companySchema.shape }).optional(),
});

export const postSchema = z.object({
  ...contentMetadataSchema.shape,
  authorName: z.string(),
  draft: z.boolean().optional(),
  url: z.string().optional(),
  slug: z.string().optional(),
  imagePosition: z.string().optional(),
  category: z.string(),
  keywords: z.array(z.string()),
  readingTime: z.object({
    text: z.string(),
    minutes: z.number(),
    time: z.number(),
    words: z.number(),
  }).optional(),
  excerpt: z.object({
    type: z.string(),
    children: z.any(),
  }),
});

export const authorSchema = z.object({
  userName: z.string(),
  fullName: z.string(),
  role: z.string(),
  imageUrl: z.string(),
  homePage: z.string(),
  linkedIn: z.string().optional(),
  twitter: z.string().optional(),
  github: z.string().optional(),
  company: z.object({ ...companySchema.shape }).optional(),
});

// Generate collections for each locale
const collections: Record<string, ReturnType<typeof defineCollection>> = {};

locales.forEach((locale) => {
  collections[`pages_${locale.code}`] = defineCollection({
    type: 'page',
    source: {
      cwd: path.resolve(contentLocation, `${locale.code}/pages`),
      include: '**/*.md',
      prefix: locale.pagesPath,
    },
    schema: pageSchema,
  });

  collections[`posts_${locale.code}`] = defineCollection({
    type: 'page',
    source: {
      cwd: path.resolve(contentLocation, `${locale.code}/posts`),
      include: '**/*.md',
      prefix: locale.postsPath,
    },
    schema: postSchema,
  });

  collections[`authors_${locale.code}`] = defineCollection({
    type: 'data',
    source: {
      cwd: path.resolve(contentLocation, `${locale.code}/authors`),
      include: '**/*.yaml',
      prefix: locale.authorsPath,
    },
    schema: authorSchema,
  });
});
export default defineContentConfig({
  collections,
});
