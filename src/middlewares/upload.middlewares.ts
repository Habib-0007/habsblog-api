import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { AppError } from './errorhandler.middleware';

const storage = multer.memoryStorage();


const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter,
});

export const uploadSingleImage = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uploadMiddleware = upload.single(fieldName);

    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('File too large. Max size is 5MB', 400));
        }
        return next(new AppError(`Multer upload error: ${err.message}`, 400));
      } else if (err) {
        return next(new AppError(err.message, 400));
      }
      next();
    });
  };
};

export const uploadMultipleImages = (
  fieldName: string,
  maxCount: number = 5,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);

    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('File too large. Max size is 5MB', 400));
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new AppError(`Too many files. Max is ${maxCount}`, 400));
        }
        return next(new AppError(`Multer upload error: ${err.message}`, 400));
      } else if (err) {
        return next(new AppError(err.message, 400));
      }
      next();
    });
  };
};
