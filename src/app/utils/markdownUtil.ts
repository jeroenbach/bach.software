import fm from 'front-matter';
import { marked } from 'marked';

export function readMarkdown<TAttributes>(markdown: string) {
  const { attributes, body } = fm(markdown) as {
    attributes: TAttributes
    body: string
  };
  const bodyHtml = marked(body);
  return {
    attributes,
    body,
    bodyHtml,
  };
}
