import type { Author as _Author } from "~/types/Author";
import { buildCompany } from "./companyBuilder";

interface Author extends _Author {
  title?: string;
  _path?: string;
  _dir?: string;
  _draft?: boolean;
  _partial?: boolean;
  _locale?: string;
  _id?: string;
  _type?: string;
  _source?: string;
  _file?: string;
  _stem?: string;
  _extension?: string;
}

export const buildAuthor = (fn?: (author: Author) => void) => {
  const author: Author = {
    _path: "/authors/author",
    _dir: "authors",
    _draft: false,
    _partial: false,
    _locale: "",
    userName: "author",
    fullName: "First LastName",
    role: "Freelance Solution Engineer",
    imageUrl: "/JEROEN-4238-SQUARE.jpeg",
    homePage: "https://author.com/authors/author",
    linkedIn: "https://www.linkedin.com/in/author/",
    _id: "content:authors:author.yaml",
    _type: "yaml",
    title: "FirstLastName",
    _source: "content",
    _file: "authors/author.yaml",
    _stem: "authors/author",
    _extension: "yaml",
    company: buildCompany(),
  };
  if (fn) fn(author);
  return author;
};
