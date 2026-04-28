import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBlogPost extends Document {
  title: {
    es: string;
    pt: string;
  };
  content: {
    es: string;
    pt: string;
  };
  slug: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: {
      es: { type: String, required: true },
      pt: { type: String, required: true },
    },
    content: {
      es: { type: String, required: true },
      pt: { type: String, required: true },
    },
    slug: { type: String, required: true, unique: true },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// We define models this way in Next.js to prevent "Cannot overwrite model once compiled" errors 
// when HMR triggers multiple compilations.
export const BlogPost: Model<IBlogPost> = mongoose.models.BlogPost || mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);
