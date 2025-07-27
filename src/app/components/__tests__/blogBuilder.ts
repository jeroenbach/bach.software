import type { BlogPage } from "~/types/BlogPage";
import { buildCompany } from "./companyBuilder";

export const buildBlog = (fn?: (blog: BlogPage) => void) => {
  const blog: BlogPage = {
    title: "Blog",
    description: "Description",
    url: "/blog",
    imageUrl: "/blog/logo.png",
    imageAlt: "Blog Logo",
    _path: "/blog",
    company: buildCompany(),
    body: { toc: undefined, type: "root", children: [] },
    dateModified: "2024-11-05T08:00:00.000Z",
    datePublished: "2024-11-05T08:00:00.000Z",
  };
  if (fn) fn(blog);
  return blog;
};
