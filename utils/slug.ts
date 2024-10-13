import slugify from "slugify";

export const createSlug = (text?: string) =>
  // Add an extra rule to remove the dots as nuxt ssg doesn't like them
  slugify(text ?? "", { lower: true }).replaceAll(".", "_");
