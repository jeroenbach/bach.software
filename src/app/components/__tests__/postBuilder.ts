import { buildAuthor } from "./authorBuilder";

import type { BlogPost as _Post } from "~/types/BlogPost";

export const buildPost = (fn?: (post: BlogPost) => void) => {
  const post: BlogPost = {
    _path: "/posts/1",
    title: "Title",
    description: "Description",
    category: "Category",
    authorName: "author",
    author: buildAuthor((a) => {
      a.userName = "author";
    }),
    datePublished: "2024-11-05T08:00:00.000Z",
    dateModified: "2024-11-05T08:00:00.000Z",
    imageUrl: "/posts/1/cover.jpeg",
    keywords: ["keyword", "keyword2", "keyword3"],
    excerpt: {
      type: "root",
      children: [
        {
          type: "element",
          tag: "p",
          props: {},
          children: [
            {
              type: "text",
              value: "Introduction",
            },
          ],
        },
      ],
    },
    body: {
      type: "root",
      children: [
        {
          type: "element",
          tag: "p",
          props: {},
          children: [
            {
              type: "text",
              value: "Introduction",
            },
            {
              type: "element",
              tag: "em",
              props: {},
              children: [
                {
                  type: "text",
                  value: "multiple",
                },
              ],
            },
            {
              type: "text",
              value: "Actual text",
            },
          ],
        },
      ],
    },
    url: "/posts/1-vue-3_3-generics-and-conditional-properties",
  };
  if (fn) fn(post);
  return post;
};
