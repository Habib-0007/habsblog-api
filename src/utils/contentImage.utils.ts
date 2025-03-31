import { uploadImage } from '../config/fileupload.config';

export const extractAndUploadImages = async (
  content: string,
  folder: string,
): Promise<string> => {
  const imageRegex = /!\[.*?\]\((data:image\/.*?;base64,.*?)\)/g;
  let match: RegExpExecArray | null;
  const uploads: Promise<{ markdown: string; original: string }>[] = [];

  while ((match = imageRegex.exec(content)) !== null) {
    const base64Image = match[1];
    uploads.push(
      uploadImage(base64Image, folder).then((result) => ({
        markdown: `![${result.original_filename}](${result.secure_url})`,
        original: match![0],
      })),
    );
  }

  const results = await Promise.all(uploads);

  results.forEach(({ markdown, original }) => {
    content = content.replace(original, markdown);
  });

  return content;
};
