import type {
  Blog as SchemaBlog,
  BlogPosting as SchemaBlogPosting,
  ImageObject as SchemaImageObject,
  Organization as SchemaOrganization,
  Person as SchemaPerson,
  WebPage as SchemaWebPage,
  WebSite as SchemaWebsite,
  Thing,
  WithContext,
} from 'schema-dts';

import type { Author } from '~/types/Author';
import type { BlogPage } from '~/types/BlogPage';
import type { BlogPost, BlogPostSummary } from '~/types/BlogPost';
import type { Company } from '~/types/Company';
import type { Metadata } from '~/types/Metadata';
import type { Page } from '~/types/Page';
import { createAbsoluteUrl } from '~/utils/url';

type WithNullableContext<T extends Thing> = WithContext<T> | undefined;

type MetadataOptions = Parameters<typeof useSeoMeta>[1];

/**
 * Helper function to get an image url for metadata purposes
 * @param relativeUrl the url that NuxtPicture uses
 * @param baseUrl the baseUrl of our site
 */
export function getMetadataImageUrl(relativeUrl: string, baseUrl: string) {
  return createAbsoluteUrl(`/_ipx/w_768&f_jpeg&q_80/${relativeUrl}`, baseUrl);
}

/***
 * A helper method to reduce the boilerplate code for setting metadata in the head of the document.
 */
export function useMetadata(type: 'page' | 'blog' | 'blogPost', metadata?: Metadata, itemsMetadata?: Metadata[], options?: MetadataOptions) {
  if (!metadata)
    return;

  const config = useConfig();
  const baseUrl = config.value?.baseUrl;

  let url = metadata._path;
  let structuredData: WithNullableContext<
    SchemaWebPage | SchemaBlog | SchemaBlogPosting
  >;
  switch (type) {
    case 'page': {
      const page = metadata as Page;
      url = page.url ?? page._path;
      structuredData = createWebPageMetadataContext(baseUrl, page);
      break;
    }
    case 'blog': {
      const blog = metadata as BlogPage;
      url = blog.url ?? blog._path;
      structuredData = createBlogMetadataContext(
        baseUrl,
        blog,
        itemsMetadata as BlogPostSummary[],
      );
      break;
    }
    case 'blogPost': {
      const post = metadata as BlogPost;
      url = post.url ?? post._path;
      structuredData = createBlogPostingMetadataContext(baseUrl, post);
      break;
    }
    default:
      break;
  }

  useSeoMeta(
    {
      title: metadata.title,
      ogTitle: metadata.title,
      description: metadata.description,
      ogDescription: metadata.description,
      ogUrl: createAbsoluteUrl(url, baseUrl),
      ogImage:
        metadata.imageUrl && getMetadataImageUrl(metadata.imageUrl, baseUrl),
      ogImageAlt: metadata.imageAlt,
    },
    options,
  );
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(structuredData),
      },
    ],
    link: [
      {
        rel: 'canonical',
        href: createAbsoluteUrl(metadata.canonicalUrl ?? url, baseUrl),
      },
    ],
  });
}

export function createWebsiteMetadataContext(company: Company): WithNullableContext<SchemaWebsite> {
  if (!company)
    return undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': company.name,
    'url': company.url,
  };
}

export function createWebPageMetadataContext(baseUrl: string, page: Page): WithNullableContext<SchemaWebPage> {
  if (!page)
    return undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': page.title,
    'url': createAbsoluteUrl(page.url ?? page._path, baseUrl),
    'description': page.description,
  };
}

export function createBlogMetadataContext(baseUrl: string, blog: BlogPage, posts: BlogPostSummary[]): WithNullableContext<SchemaBlog> {
  if (!blog)
    return undefined;

  const blogPost = posts
    ?.map(post => createBlogPostingMetadata(baseUrl, post))
    .filter(isNotNullOrUndefined);

  const url = createAbsoluteUrl(blog.url ?? blog._path, baseUrl);

  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': url,
    'mainEntityOfPage': url,
    'name': blog.title,
    'description': blog.description,
    'publisher': blog.company && createOrganizationMetadata(blog.company),
    blogPost,
  };
}

export function createBlogPostingMetadataContext(baseUrl: string, post: BlogPostSummary): WithNullableContext<SchemaBlogPosting> {
  const structuredData = createBlogPostingMetadata(baseUrl, post);
  if (!structuredData)
    return undefined;

  return {
    '@context': 'https://schema.org',
    ...structuredData,
    'speakable': {
      '@type': 'SpeakableSpecification',
      'cssSelector': [
        'html head title',
        'html head meta[name="description"]',
        'html main article [itemprop="articleBody"]',
      ],
    },
  };
}

export function createBlogPostingMetadata(baseUrl: string, post: BlogPostSummary): SchemaBlogPosting | undefined {
  if (!post)
    return undefined;

  return {
    '@type': 'BlogPosting',
    'headline': post.title,
    'datePublished': post.datePublished && toDateWithTimeZone(post.datePublished),
    'dateModified': post.dateModified && toDateWithTimeZone(post.dateModified),
    'url': post.url && createAbsoluteUrl(post.url, baseUrl),
    'author': createAuthorMetadata(baseUrl, post.author),
    'publisher':
      post.author?.company && createOrganizationMetadata(post.author.company),
    'image': post.imageUrl && createImageMetadata(baseUrl, post.imageUrl),
    'isAccessibleForFree': true,
    'keywords': post.keywords,
  };
}

export function createAuthorMetadata(baseUrl: string, author: Author): SchemaPerson | undefined {
  if (!author)
    return undefined;
  return {
    '@type': 'Person',
    'name': author.fullName,
    'url': author.homePage ?? author.linkedIn,
    'image': author.imageUrl && createImageMetadata(baseUrl, author.imageUrl),
  };
}

export function createImageMetadata(baseUrl: string, url: string): SchemaImageObject | undefined {
  if (!url)
    return undefined;
  return {
    '@type': 'ImageObject',
    'url': getMetadataImageUrl(url, baseUrl),
    'height': '768',
    'width': '768',
  };
}

export function createOrganizationMetadata(company: Company): SchemaOrganization | undefined {
  if (!company)
    return undefined;
  return {
    '@type': 'Organization',
    '@id': company.url,
    'name': company.name,
    'logo':
      company.imageUrl && getMetadataImageUrl(company.imageUrl, company.url),
  };
}
