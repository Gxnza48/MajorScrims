import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ISpotClaim extends Document {
    tournamentId: Types.ObjectId;
    windowId: string;
    zoneId: string;
    discordId: string;
    discordName: string;
    epicName: string;
    teammates: string[];
    /**
     * True when this team took a zone that was already at capacity: they are
     * disputing it. The zone then renders red until a moderator resolves it by
     * removing one of the teams (see the DELETE handler in the claim route).
     */
    disputed: boolean;
    /** Optional reason the disputing team typed, for the moderator. */
    disputeNote: string;
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
        disputed: { type: Boolean, default: false },
        disputeNote: { type: String, default: "" },
    },
    { timestamps: true }
);

// One team per zone, and one zone per player per window. These are the real
// guardrails - the UI checks are only there to give a nicer message.
SpotClaimSchema.index({ tournamentId: 1, windowId: 1, zoneId: 1 });
SpotClaimSchema.index({ tournamentId: 1, windowId: 1, discordId: 1 }, { unique: true });

export const SpotClaim: Model<ISpotClaim> =
    mongoose.models.SpotClaim || mongoose.model<ISpotClaim>("SpotClaim", SpotClaimSchema);
