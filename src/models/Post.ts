import mongoose, { Document, Schema } from 'mongoose';
import slugify from 'slugify';

export interface IPost extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  coverImagePublicId?: string;
  author: mongoose.Types.ObjectId;
  tags: string[];
  status: 'draft' | 'published';
  viewCount: number;
  likeCount: number;
  likedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
    },
    content: {
      type: String,
      required: [true, 'Please add content'],
    },
    excerpt: {
      type: String,
      maxlength: [500, 'Excerpt cannot be more than 500 characters'],
    },
    coverImage: {
      type: String,
    },
    coverImagePublicId: {
      type: String,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

PostSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }

  if (!this.excerpt && this.content) {
    this.excerpt = this.content
      .replace(/<[^>]*>/g, '')
      .substring(0, 160)
      .trim();

    if (this.content.length > 160) {
      this.excerpt += '...';
    }
  }

  next();
});

// PostSchema.pre('remove', async function (next) {
//   await this.model('Comment').deleteMany({ post: this._id });
//   next();
// });

PostSchema.pre('deleteOne', { document: true }, async function (next) {
  await this.model('Comment').deleteMany({ post: this._id });
  next();
});

PostSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post',
  justOne: false,
});

PostSchema.index({ slug: 1 });
PostSchema.index({ author: 1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IPost>('Post', PostSchema);
