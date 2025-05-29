import type { BlogPost as _Post } from "~/types/BlogPost";
import { buildAuthor } from "./authorBuilder";

interface Post extends _Post {
  _dir?: string;
  _draft?: boolean;
  _partial?: boolean;
  _type?: string;
  _id?: string;
  _source?: string;
  _file?: string;
  _stem?: string;
  _extension?: string;
}

export const buildPost = (fn?: (post: Post) => void) => {
  const post: Post = {
    _path: "/posts/1",
    _dir: "posts",
    _draft: false,
    _partial: false,
    title: "Title",
    description: "Description",
    category: "Category",
    authorName: "author",
    author: buildAuthor((a) => {
      a.userName = "author";
    }),
    datePublished: "2024-11-05T08:00:00.000Z",
    dateModified: "2024-11-05T08:00:00.000Z",
    imgCoverUrl: "/posts/1/cover.jpeg",
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
    _type: "markdown",
    _id: "content:posts:1.md",
    _source: "content",
    _file: "posts/1.md",
    _stem: "posts/1",
    _extension: "md",
    url: "/posts/1-vue-3_3-generics-and-conditional-properties",
  };
  fn && fn(post);
  return post;
};
