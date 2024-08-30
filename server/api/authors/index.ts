import { Author } from "~/types/Author";

export const authors: Author[] = [
  {
    userName: "jeroenbach",
    fullName: "Jeroen Bach",
    image: "/JEROEN-4238-SQUARE.jpeg",
    linkedin: "https://www.linkedin.com/in/jeroenbach/",
  },
];

export default defineEventHandler(async () => authors);
