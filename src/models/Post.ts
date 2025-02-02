import mongoose, { type Document, Schema } from 'mongoose';

export interface IPost extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  images: string[];
}

const PostSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    images: [{ type: String }],
  },
  { timestamps: true },
);

export default mongoose.model<IPost>('Post', PostSchema);
