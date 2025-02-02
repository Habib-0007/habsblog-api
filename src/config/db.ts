import mongoose from 'mongoose';

export const connectDB = () => {
  mongoose
    .connect(process.env.MONGODB_URI as string)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err as Error));
};
