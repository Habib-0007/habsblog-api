import dotenv from 'dotenv';
import z from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  MONGODB_URI: z.string().min(1, 'MONGODB URI is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
  NODE_ENV: z.string().default('development'),
  JWT_EXPIRE: z.string().default('30d'),
  JWT_COOKIE_EXPIRE: z.string().default('30'),
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .regex(/^\d+$/, 'Must be a number')
    .transform((val) => parseInt(val, 10) * 60 * 1000),
  RATE_LIMIT_MAX: z
    .string()
    .regex(/^\d+$/, 'Must be a number')
    .transform((val) => parseInt(val, 10)),
  FRONTEND_URL: z.string().min(1, 'FRONTEND_URL is required'),
});

export const env = envSchema.parse(process.env);
