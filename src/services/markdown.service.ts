import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import hljs from 'highlight.js';

// Configure marked with the latest API
const markedOptions = {
  gfm: true,
  breaks: true,
  headerIds: true,
  highlight: function (code: string, lang: string) {
    try {
      // Check if language exists and highlight accordingly
      if (lang && hljs.getLanguage(lang)) {
        // Modern highlight.js API
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    } catch (e) {
      console.error('Highlight error:', e);
      return code;
    }
  },
};

// Initialize marked with options
marked.use({ renderer: new marked.Renderer(), ...markedOptions });

export const markdownToHtml = async (markdown: string): Promise<string> => {
  try {
    // Use the async/await pattern if needed, but here we use the sync version
    const rawHtml = await Promise.resolve(marked.parse(markdown));

    const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
    });

    return sanitizedHtml;
  } catch (error) {
    console.error('Markdown parsing error:', error);
    return '';
  }
};

export const markdownToPlainText = async (
  markdown: string,
  maxLength?: number,
): Promise<string> => {
  try {
    const parsedMarkdown = marked.parse(markdown);
    const textPromise =
      parsedMarkdown instanceof Promise
        ? parsedMarkdown
        : Promise.resolve(parsedMarkdown);

    const text = await textPromise.then((html) =>
      html
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
    );

    if (maxLength && text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }

    return text;
  } catch (error) {
    console.error('Markdown to plain text error:', error);
    return '';
  }
};

export const extractFirstImage = (markdown: string): string | null => {
  const imageRegex = /!\[(?:.*?)\]\(([^)]+)\)/;
  const match = markdown.match(imageRegex);

  if (match && match[1]) {
    return match[1];
  }

  return null;
};
