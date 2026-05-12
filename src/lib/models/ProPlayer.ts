import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProPlayer extends Document {
    name: string;
    img: string;
    role: string;
    order: number;
}

const ProPlayerSchema = new Schema<IProPlayer>({
    name: { type: String, required: true },
    img: { type: String, required: true },
    role: { type: String, required: true, default: "proplayer" },
    order: { type: Number, required: true, default: 0 },
});

export const ProPlayer: Model<IProPlayer> =
    mongoose.models.ProPlayer || mongoose.model<IProPlayer>("ProPlayer", ProPlayerSchema);
