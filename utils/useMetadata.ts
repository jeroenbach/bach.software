import type { WatchSource } from "vue";
import type { Post } from "~/types/Post";

type UseHeadOptions = Parameters<typeof useSeoMeta>[1];
export interface Metadata {
  title?: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  structuredData?: any;
}

/**
 * Helper function to get an image url for metadata purposes
 * @param relativeUrl the url that NuxtPicture uses
 * @param baseUrl the baseUrl of our site
 */
export const getMetadataImageUrl = (relativeUrl: string, baseUrl?: string) => {
  let url = `/_ipx/w_1024&f_jpeg&q_80/${relativeUrl}`;
  // clean extra slashes
  url = url.split("/").filter(isNotNullOrUndefinedOrEmpty).join("/");

  // Add baseUrl if it exists
  if (baseUrl) {
    url = new URL(`/${url}`, baseUrl).href;
  }

  return url;
};

/***
 * A helper method to reduce the boilerplate code for setting metadata in the head of the document.
 */
export const useMetadata = (
  metadata: WatchSource<Metadata>,
  options?: UseHeadOptions,
) => {
  useSeoMeta(
    {
      title: () => toValue(metadata)?.title,
      ogTitle: () => toValue(metadata)?.title,
      description: () => toValue(metadata)?.description,
      ogDescription: () => toValue(metadata)?.description,
      ogImage: () => getMetadataImageUrl(toValue(metadata)?.imageUrl),
      ogImageAlt: () => toValue(metadata)?.imageAlt,
    },
    options,
  );

  useHead({
    script: [
      {
        type: "application/ld+json",
        innerHTML: () => JSON.stringify(toValue(metadata)?.structuredData),
      },
    ],
  });
};

export const createArticleMetadata = (baseUrl: string, post: Post | null) =>
  post && {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    image: post.imgCoverUrl && [getMetadataImageUrl(post.imgCoverUrl, baseUrl)],
    datePublished: post.datePublished && toDateWithTimeZone(post.datePublished),
    dateModified: "2024-02-05T09:20:00+08:00",
    author: [
      {
        "@type": "Person",
        name: "Jane Doe",
        url: "https://example.com/profile/janedoe123",
      },
      {
        "@type": "Person",
        name: "John Doe",
        url: "https://example.com/profile/johndoe123",
      },
    ],
    speakable: {
      "@type": "SpeakableSpecification",
      xPath: [
        "/html/head/title",
        "/html/head/meta[@name='description']/@content",
      ],
    },
  };
