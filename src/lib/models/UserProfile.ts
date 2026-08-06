import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Everything the site knows about a signed-in Discord user.
 *
 * This doubles as the roster a moderator picks from when marking who qualified
 * for a tournament, which is why it stores the display name and the Epic name:
 * the moderator cross-checks the Epic name against Fortnite's official
 * qualified list and ticks the matching row.
 */
export interface IUserProfile extends Document {
    discordId: string;
    discordName: string;
    avatarUrl: string;
    epicName: string;
    epicAccountId?: string;
    /** Mirrors the PRO role in the Major Scrims Discord (see src/lib/discord.ts). */
    isPro: boolean;
    proCheckedAt?: Date;
    lastSeenAt?: Date;
}

const UserProfileSchema = new Schema<IUserProfile>(
    {
        discordId: { type: String, required: true, unique: true, index: true },
        discordName: { type: String, default: "" },
        avatarUrl: { type: String, default: "" },
        epicName: { type: String, default: "" },
        epicAccountId: { type: String },
        isPro: { type: Boolean, default: false, index: true },
        proCheckedAt: { type: Date },
        lastSeenAt: { type: Date },
    },
    { timestamps: true }
);

export const UserProfile: Model<IUserProfile> =
    mongoose.models.UserProfile || mongoose.model<IUserProfile>("UserProfile", UserProfileSchema);
