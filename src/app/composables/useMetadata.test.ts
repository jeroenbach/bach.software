import { describe, expect, it, vi, beforeEach } from "vitest";

import { buildAuthor } from "~/components/__tests__/authorBuilder";
import { buildBlog } from "~/components/__tests__/blogBuilder";
import { buildCompany } from "~/components/__tests__/companyBuilder";
import { buildPost } from "~/components/__tests__/postBuilder";

const mock = vi.hoisted(() => ({
  useSeoMeta: vi.fn(),
  useHead: vi.fn(),
}));
vi.mock("@unhead/vue", async (importOriginal) => {
  const actual: Record<string, unknown> = await importOriginal();
  return {
    ...actual,
    useSeoMeta: mock.useSeoMeta,
    useHead: mock.useHead,
  };
});

describe("getMetadataImageUrl", () => {
  it("should render the correct full url of an image", async () => {
    expect(getMetadataImageUrl("/test.jpeg", "https://bach.software")).toBe(
      "https://bach.software/_ipx/w_768&f_jpeg&q_80/test.jpeg",
    );
  });

  it("should not have extra slashes", async () => {
    expect(getMetadataImageUrl("//test.jpeg", "https://bach.software/")).toBe(
      "https://bach.software/_ipx/w_768&f_jpeg&q_80/test.jpeg",
    );
    expect(
      getMetadataImageUrl("asdf/d//test.jpeg", "https://bach.software//"),
    ).toBe("https://bach.software/_ipx/w_768&f_jpeg&q_80/asdf/d/test.jpeg");
  });
});

describe("create metadata functions", () => {
  const baseUrl = "https://bach.software";

  describe("createWebsiteMetadataContext", () => {
    it("should render the correct structured data", async () => {
      expect(createWebsiteMetadataContext(buildCompany())).toEqual({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Company",
        url: "https://bach.software",
      });
    });
  });

  describe("createBlogMetadataContext", () => {
    it("should render the correct structured data", async () => {
      expect(
        createBlogMetadataContext(
          baseUrl,
          buildBlog(),
          [
            buildPost((p) => {
              p.authorName = "author1";
              p.author = buildAuthor((a) => {
                a.userName = p.authorName;
                a.fullName = p.authorName;
              });
            }),
            buildPost((p) => {
              p.authorName = "author2";
              p.author = buildAuthor((a) => {
                a.userName = p.authorName;
                a.fullName = p.authorName;
              });
            }),
            buildPost((p) => {
              p.authorName = "author2";
              p.author = buildAuthor((a) => {
                a.userName = p.authorName;
                a.fullName = p.authorName;
              });
            }),
          ],
          buildCompany(),
        ),
      ).toEqual({
        "@context": "https://schema.org",
        "@id": "https://bach.software/blog",
        "@type": "Blog",
        description: "Description",
        mainEntityOfPage: "https://bach.software/blog",
        name: "Blog",
        publisher: {
          "@type": "Organization",
          "@id": "https://bach.software",
          logo: "https://bach.software/_ipx/w_768&f_jpeg&q_80/company/logo.png",
          name: "Company",
        },
        blogPost: [
          {
            "@type": "BlogPosting",
            author: {
              "@type": "Person",
              image: {
                "@type": "ImageObject",
                height: "768",
                url: "https://bach.software/_ipx/w_768&f_jpeg&q_80/JEROEN-4238-SQUARE.jpeg",
                width: "768",
              },
              name: "author1",
              url: "https://author.com/authors/author",
            },
            dateModified: "2024-11-05T09:00:00+01:00",
            datePublished: "2024-11-05T09:00:00+01:00",
            headline: "Title",
            image: {
              "@type": "ImageObject",
              height: "768",
              url: "https://bach.software/_ipx/w_768&f_jpeg&q_80/posts/1/cover.jpeg",
              width: "768",
            },
            isAccessibleForFree: true,
            keywords: ["keyword", "keyword2", "keyword3"],
            publisher: undefined,
            url: "https://bach.software/posts/1-vue-3_3-generics-and-conditional-properties",
          },
          {
            "@type": "BlogPosting",
            author: {
              "@type": "Person",
              image: {
                "@type": "ImageObject",
                height: "768",
                url: "https://bach.software/_ipx/w_768&f_jpeg&q_80/JEROEN-4238-SQUARE.jpeg",
                width: "768",
              },
              name: "author2",
              url: "https://author.com/authors/author",
            },
            dateModified: "2024-11-05T09:00:00+01:00",
            datePublished: "2024-11-05T09:00:00+01:00",
            headline: "Title",
            image: {
              "@type": "ImageObject",
              height: "768",
              url: "https://bach.software/_ipx/w_768&f_jpeg&q_80/posts/1/cover.jpeg",
              width: "768",
            },
            isAccessibleForFree: true,
            keywords: ["keyword", "keyword2", "keyword3"],
            publisher: undefined,
            url: "https://bach.software/posts/1-vue-3_3-generics-and-conditional-properties",
          },
          {
            "@type": "BlogPosting",
            author: {
              "@type": "Person",
              image: {
                "@type": "ImageObject",
                height: "768",
                url: "https://bach.software/_ipx/w_768&f_jpeg&q_80/JEROEN-4238-SQUARE.jpeg",
                width: "768",
              },
              name: "author2",
              url: "https://author.com/authors/author",
            },
            dateModified: "2024-11-05T09:00:00+01:00",
            datePublished: "2024-11-05T09:00:00+01:00",
            headline: "Title",
            image: {
              "@type": "ImageObject",
              height: "768",
              url: "https://bach.software/_ipx/w_768&f_jpeg&q_80/posts/1/cover.jpeg",
              width: "768",
            },
            isAccessibleForFree: true,
            keywords: ["keyword", "keyword2", "keyword3"],
            publisher: undefined,
            url: "https://bach.software/posts/1-vue-3_3-generics-and-conditional-properties",
          },
        ],
      });
    });
  });

  describe("createBlogPostingMetadataContext", () => {
    it("should render the correct structured data", async () => {
      expect(
        createBlogPostingMetadataContext(baseUrl, buildPost(), buildCompany()),
      ).toEqual({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        author: {
          "@type": "Person",
          name: "First LastName",
          url: "https://author.com/authors/author",
          image: {
            "@type": "ImageObject",
            height: "768",
            url: "https://bach.software/_ipx/w_768&f_jpeg&q_80/JEROEN-4238-SQUARE.jpeg",
            width: "768",
          },
        },
        dateModified: "2024-11-05T09:00:00+01:00",
        datePublished: "2024-11-05T09:00:00+01:00",
        headline: "Title",
        image: {
          "@type": "ImageObject",
          height: "768",
          url: "https://bach.software/_ipx/w_768&f_jpeg&q_80/posts/1/cover.jpeg",
          width: "768",
        },
        keywords: ["keyword", "keyword2", "keyword3"],
        publisher: {
          "@id": "https://bach.software",
          "@type": "Organization",
          logo: "https://bach.software/_ipx/w_768&f_jpeg&q_80/company/logo.png",
          name: "Company",
        },
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: [
            "html head title",
            'html head meta[name="description"]',
            'html main article [itemprop="articleBody"]',
          ],
        },
        isAccessibleForFree: true,
        url: "https://bach.software/posts/1-vue-3_3-generics-and-conditional-properties",
      });
    });
  });
});

describe("useMetadata", () => {
  beforeEach(() => {
    useMetadata({
      baseUrl: "https://bach.software",
      title: "Title",
      description: "Description",
      imageUrl: "/posts/1/cover.jpeg",
      imageAlt: "Image alt",
      url: "https://bach.software/posts/1-vue-3_3-generics-and-conditional-properties",
      canonicalUrl:
        "https://bach.software/posts/1-vue-3_3-generics-and-conditional-properties-original",
      structuredData: { structuredData: "data" },
    });
  });

  it("should call the useSeoMeta with the correct parameters", async () => {
    const seoArgs = mock.useSeoMeta.mock.calls[0][0];
    expect(seoArgs.title).toBe("Title");
    expect(seoArgs.ogTitle).toBe("Title");
    expect(seoArgs.description).toBe("Description");
    expect(seoArgs.ogDescription).toBe("Description");
    expect(seoArgs.ogUrl).toBe(
      "https://bach.software/posts/1-vue-3_3-generics-and-conditional-properties",
    );
    expect(seoArgs.ogImage).toBe(
      "https://bach.software/_ipx/w_768&f_jpeg&q_80/posts/1/cover.jpeg",
    );
    expect(seoArgs.ogImageAlt).toBe("Image alt");
  });

  it("should call the useHead with the correct parameters", async () => {
    const headArgs = mock.useHead.mock.calls[0][0];
    expect(headArgs.script[0].type).toBe("application/ld+json");
    expect(headArgs.script[0].innerHTML).toBe('{"structuredData":"data"}');
    expect(headArgs.link[0].rel).toBe("canonical");
    expect(headArgs.link[0].href).toBe(
      "https://bach.software/posts/1-vue-3_3-generics-and-conditional-properties-original",
    );
  });

  it("should use url if canonical url is empty", async () => {
    mock.useHead.mockReset();
    useMetadata({
      baseUrl: "https://bach.software",
      title: "Title",
      description: "Description",
      imageUrl: "https://bach.software/posts/1/cover.jpeg",
      imageAlt: "Image alt",
      url: "https://bach.software/posts/1-vue-3_3-generics-and-conditional-properties",
      structuredData: { structuredData: "data" },
    });
    const headArgs = mock.useHead.mock.calls[0][0];
    expect(headArgs.link[0].href).toBe(
      "https://bach.software/posts/1-vue-3_3-generics-and-conditional-properties",
    );
  });
});
