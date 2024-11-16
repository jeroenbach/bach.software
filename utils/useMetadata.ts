import type { WatchSource } from "vue";
import type { Author } from "~/types/Author";
import type { Blog } from "~/types/Blog";
import type { Company } from "~/types/Company";
import type { Config } from "~/types/Config";
import type { BlogPostSummary } from "~/types/BlogPost";
import type { Page } from "~/types/Page";
import { createAbsoluteUrl } from "~/utils/url";
import type {
  Thing,
  WebSite as SchemaWebsite,
  WebPage as SchemaWebPage,
  Blog as SchemaBlog,
  BlogPosting as SchemaBlogPosting,
  Organization as SchemaOrganization,
  ImageObject as SchemaImageObject,
  Person as SchemaPerson,
  WithContext,
} from "schema-dts";

type WithNullableContext<T extends Thing> = WithContext<T> | undefined;

type MetadataOptions = Parameters<typeof useSeoMeta>[1];
export interface Metadata {
  baseUrl: string;
  title: string;
  description: string;
  imageUrl?: string;
  imageAlt?: string;
  url: string;
  /**
   * In case the canonical is different from the url, specify it here
   */
  canonicalUrl?: string;
  structuredData: any;
}

/**
 * Helper function to get an image url for metadata purposes
 * @param relativeUrl the url that NuxtPicture uses
 * @param baseUrl the baseUrl of our site
 */
export const getMetadataImageUrl = (relativeUrl: string, baseUrl: string) =>
  createAbsoluteUrl(`/_ipx/w_768&f_jpeg&q_80/${relativeUrl}`, baseUrl);

/**
 * Gets the company and blog metadata from the translation files
 */
export const useBlogMetadata = () => {
  const config = useState<Config>("config");
  const { t } = useI18n();
  const blog: Blog = {
    name: t("_metadata.titleTemplate_empty"),
    description: t("_metadata.description"),
    url: "/posts",
  };
  const company: Company = {
    name: t("_metadata.titleTemplate_empty"),
    description: t("_metadata.description"),
    url: "/",
  };

  return { blog, company, config };
};

/***
 * A helper method to reduce the boilerplate code for setting metadata in the head of the document.
 */
export const useMetadata = (
  metadata: Metadata | null,
  options?: MetadataOptions,
) => {
  if (!metadata) return;

  useSeoMeta(
    {
      title: metadata.title,
      ogTitle: metadata.title,
      description: metadata.description,
      ogDescription: metadata.description,
      ogUrl: createAbsoluteUrl(metadata.url, metadata.baseUrl),
      ogImage:
        metadata.imageUrl &&
        getMetadataImageUrl(metadata.imageUrl, metadata.baseUrl),
      ogImageAlt: metadata.imageAlt,
    },
    options,
  );

  useHead({
    script: [
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify(metadata.structuredData),
      },
    ],
    link: [
      {
        rel: "canonical",
        href: createAbsoluteUrl(
          metadata.canonicalUrl ?? metadata.url,
          metadata.baseUrl,
        ),
      },
    ],
  });
};

export const createWebsiteMetadataContext = (
  company: Company,
): WithNullableContext<SchemaWebsite> => {
  if (!company) return undefined;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: company.name,
    url: company.url,
  };
};

export const createWebPageMetadataContext = (
  baseUrl: string,
  page: Page,
): WithNullableContext<SchemaWebPage> => {
  if (!page) return undefined;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    url: page._path && createAbsoluteUrl(page._path, baseUrl),
    description: page.description,
  };
};

export const createBlogMetadataContext = (
  baseUrl: string,
  blog: Blog,
  posts: BlogPostSummary[],
  publisher?: Company,
): WithNullableContext<SchemaBlog> => {
  if (!blog) return undefined;

  const blogPost = posts
    ?.map((post) => createBlogPostingMetadata(baseUrl, post))
    .filter(isNotNullOrUndefined);

  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": blog.url,
    mainEntityOfPage: blog.url,
    name: blog.name,
    description: blog.description,
    publisher: publisher && createOrganizationMetadata(publisher),
    blogPost,
  };
};

export const createBlogPostingMetadataContext = (
  baseUrl: string,
  post: BlogPostSummary,
  publisher?: Company,
): WithNullableContext<SchemaBlogPosting> => {
  const structuredData = createBlogPostingMetadata(baseUrl, post, publisher);
  if (!structuredData) return undefined;

  return {
    "@context": "https://schema.org",
    ...structuredData,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [
        "html head title",
        'html head meta[name="description"]',
        'html main article [itemprop="articleBody"]',
      ],
    },
  };
};

export const createBlogPostingMetadata = (
  baseUrl: string,
  post: BlogPostSummary,
  publisher?: Company,
): SchemaBlogPosting | undefined => {
  if (!post) return undefined;

  return {
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.datePublished && toDateWithTimeZone(post.datePublished),
    dateModified: post.dateModified && toDateWithTimeZone(post.dateModified),
    url: post.url && createAbsoluteUrl(post.url, baseUrl),
    author: createAuthorMetadata(baseUrl, post.author),
    publisher: publisher && createOrganizationMetadata(publisher),
    image: post.imgCoverUrl && createImageMetadata(baseUrl, post.imgCoverUrl),
    isAccessibleForFree: true,
    keywords: post.keywords,
  };
};

export const createAuthorMetadata = (
  baseUrl: string,
  author: Author,
): SchemaPerson | undefined => {
  if (!author) return undefined;
  return {
    "@type": "Person",
    name: author.fullName,
    url: author.homePage ?? author.linkedIn,
    image: author.imageUrl && createImageMetadata(baseUrl, author.imageUrl),
  };
};

export const createImageMetadata = (
  baseUrl: string,
  url: string,
): SchemaImageObject | undefined => {
  if (!url) return undefined;
  return {
    "@type": "ImageObject",
    url: getMetadataImageUrl(url, baseUrl),
    height: "768",
    width: "768",
  };
};

export const createOrganizationMetadata = (
  company: Company,
): SchemaOrganization | undefined => {
  if (!company) return undefined;
  return {
    "@type": "Organization",
    "@id": company.url,
    name: company.name,
    logo:
      company.imageUrl && getMetadataImageUrl(company.imageUrl, company.url),
  };
};
