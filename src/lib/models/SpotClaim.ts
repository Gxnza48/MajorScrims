import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ISpotClaim extends Document {
    tournamentId: Types.ObjectId;
    windowId: string;
    zoneId: string;
    discordId: string;
    discordName: string;
    epicName: string;
    teammates: string[];
    createdAt: Date;
}

const SpotClaimSchema = new Schema<ISpotClaim>(
    {
        tournamentId: { type: Schema.Types.ObjectId, ref: "Tournament", required: true },
        windowId: { type: String, required: true },
        zoneId: { type: String, required: true },
        discordId: { type: String, required: true },
        discordName: { type: String, default: "" },
        epicName: { type: String, required: true },
        teammates: { type: [String], default: [] },
    },
    { timestamps: true }
);

// One team per zone, and one zone per player per window. These are the real
// guardrails - the UI checks are only there to give a nicer message.
SpotClaimSchema.index({ tournamentId: 1, windowId: 1, zoneId: 1 });
SpotClaimSchema.index({ tournamentId: 1, windowId: 1, discordId: 1 }, { unique: true });

export const SpotClaim: Model<ISpotClaim> =
    mongoose.models.SpotClaim || mongoose.model<ISpotClaim>("SpotClaim", SpotClaimSchema);
