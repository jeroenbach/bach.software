import { authors } from ".";

export default defineEventHandler(async (event) => {
  const userName = event.context.params?.userName;
  return authors.find((author) => author.userName === userName);
});
