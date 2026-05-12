import mongoose, { Schema, Document, Model } from "mongoose";

export interface IContentBlock {
    type: "text" | "image" | "video";
    content: string;
    caption?: string;
}

export interface IBlogPost extends Document {
    title: {
        es: string;
        pt: string;
    };
    content: {
        es: string;
        pt: string;
    };
    blocks?: {
        es: IContentBlock[];
        pt: IContentBlock[];
    };
    slug: string;
    authorId: string;
    authorName: string;
    createdAt: Date;
    updatedAt: Date;
}

const ContentBlockSchema = new Schema<IContentBlock>({
    type: { type: String, enum: ["text", "image", "video"], required: true },
    content: { type: String, required: true },
    caption: { type: String, default: "" },
});

const BlogPostSchema = new Schema<IBlogPost>(
    {
        title: {
            es: { type: String, required: true },
            pt: { type: String, required: true },
        },
        content: {
            es: { type: String, default: "" },
            pt: { type: String, default: "" },
        },
        blocks: {
            es: { type: [ContentBlockSchema], default: undefined },
            pt: { type: [ContentBlockSchema], default: undefined },
        },
        slug: { type: String, required: true, unique: true },
        authorId: { type: String, required: true },
        authorName: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

export const BlogPost: Model<IBlogPost> =
    mongoose.models.BlogPost || mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);
