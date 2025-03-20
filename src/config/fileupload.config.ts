import {
  v2 as cloudinary,
  UploadApiResponse,
  DeleteApiResponse,
} from 'cloudinary';
import { env } from './env.config';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadImage = async (
  file: string,
  folder: string = 'blog',
): Promise<UploadApiResponse> => {
  try {
    return await cloudinary.uploader.upload(file, {
      folder,
      resource_type: 'auto',
      transformation: [
        { width: 1200, crop: 'limit' },
        { quality: 'auto:good' },
      ],
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Image upload failed');
  }
};

export const deleteImage = async (
  publicId: string,
): Promise<DeleteApiResponse> => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Image deletion failed');
  }
};

export default cloudinary;
