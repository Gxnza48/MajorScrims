import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Holds the Epic identity linked to a Discord login. Today `epicName` is typed
 * by the player; once Epic approves the OAuth app (see EPIC_CLIENT_ID in
 * src/lib/auth.ts) `epicAccountId` gets filled in by the provider instead.
 */
export interface IUserProfile extends Document {
    discordId: string;
    epicName: string;
    epicAccountId?: string;
}

const UserProfileSchema = new Schema<IUserProfile>(
    {
        discordId: { type: String, required: true, unique: true, index: true },
        epicName: { type: String, default: "" },
        epicAccountId: { type: String },
    },
    { timestamps: true }
);

export const UserProfile: Model<IUserProfile> =
    mongoose.models.UserProfile || mongoose.model<IUserProfile>("UserProfile", UserProfileSchema);
