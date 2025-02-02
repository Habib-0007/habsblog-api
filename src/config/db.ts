import mongoose from "mongoose"

export const connectDB = () => {
	mongoose
		.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-app')
		.then(() => console.log('Connected to MongoDB'))
		.catch((err) => console.error('MongoDB connection error:', err as Error));
};
