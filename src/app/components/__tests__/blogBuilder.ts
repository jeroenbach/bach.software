import type { Blog } from "~/types/Blog";

export const buildBlog = (fn?: (blog: Blog) => void) => {
  const blog: Blog = {
    name: "Blog",
    description: "Description",
    url: "https://bach.software/blog",
    imageUrl: "/blog/logo.png",
    imageAlt: "Blog Logo",
  };
  fn && fn(blog);
  return blog;
};
