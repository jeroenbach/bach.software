import { defineContentConfig, defineCollection, z } from "@nuxt/content";
import { asSchemaOrgCollection } from "nuxt-schema-org/content";

export default defineContentConfig({
  collections: {
    page: defineCollection(
      asSchemaOrgCollection({
        source: "**/pages/*.md",
        type: "page",
        schema: z.object({
          title: z.string(),
        }),
      }),
    ),
    posts: defineCollection(
      asSchemaOrgCollection({
        source: "**/posts/*.md",
        type: "page",
        schema: z.object({
          title: z.string(),
          description: z.string(),
          category: z.string(),
          keywords: z.array(z.string()),
          authorUserName: z.string(),
          datePublished: z.date(),
          dateModified: z.date(),
          imgCoverUrl: z.string().url(),
        }),
      }),
    ),
    author: defineCollection(
      asSchemaOrgCollection({
        source: "**/authors/*.yaml",
        type: "data",
        schema: z.object({
          userName: z.string(),
          fullName: z.string(),
          role: z.string(),
          imageUrl: z.string(),
          homePage: z.string(),
          linkedIn: z.string(),
          twitter: z.string(),
        }),
      }),
    ),
  },
});
