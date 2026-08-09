import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * A static legal page whose text a moderator edits from the dashboard: the
 * Terms of Service and the Privacy Policy that Discord (and Epic's Brand
 * Review) ask for as public URLs.
 *
 * Content is the same HTML the blog editor produces, so the same RichTextEditor
 * drives it. Only admins can write it - it is rendered with
 * dangerouslySetInnerHTML exactly like a blog post.
 */
export interface ISitePage extends Document {
    /** "terms" | "privacy" - the URL is /{slug}. */
    slug: string;
    title: { es: string; pt: string };
    content: { es: string; pt: string };
    updatedAt: Date;
    createdAt: Date;
}

const SitePageSchema = new Schema<ISitePage>(
    {
        slug: { type: String, required: true, unique: true, index: true },
        title: {
            es: { type: String, default: "" },
            pt: { type: String, default: "" },
        },
        content: {
            es: { type: String, default: "" },
            pt: { type: String, default: "" },
        },
    },
    { timestamps: true }
);

export const SitePage: Model<ISitePage> =
    mongoose.models.SitePage || mongoose.model<ISitePage>("SitePage", SitePageSchema);
