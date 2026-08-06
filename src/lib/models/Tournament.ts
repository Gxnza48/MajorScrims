import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IZone {
    _id: Types.ObjectId;
    label: string;
    /** Rect normalised to 0..1 over the map image, so it survives any render size. */
    x: number;
    y: number;
    w: number;
    h: number;
    capacity: number;
}

export interface IWindow {
    _id: Types.ObjectId;
    label: string;
    startsAt: Date;
    zones: Types.DocumentArray<IZone & Document>;
}

export interface ITournament extends Document {
    slug: string;
    name: string;
    poster: string;
    mode: string;
    teamSize: string;
    region: string;
    start: Date;
    end: Date;
    published: boolean;
    windows: Types.DocumentArray<IWindow & Document>;
}

const ZoneSchema = new Schema<IZone>({
    label: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true },
    capacity: { type: Number, required: true, default: 1, min: 1 },
});

const WindowSchema = new Schema<IWindow>({
    label: { type: String, required: true },
    startsAt: { type: Date, required: true },
    zones: { type: [ZoneSchema], default: [] },
});

const TournamentSchema = new Schema<ITournament>(
    {
        slug: { type: String, required: true, unique: true, index: true },
        name: { type: String, required: true },
        poster: { type: String, default: "" },
        mode: { type: String, default: "Build" },
        teamSize: { type: String, default: "Solo" },
        region: { type: String, default: "BR" },
        start: { type: Date, required: true },
        end: { type: Date, required: true },
        published: { type: Boolean, default: true },
        windows: { type: [WindowSchema], default: [] },
    },
    { timestamps: true }
);

export const Tournament: Model<ITournament> =
    mongoose.models.Tournament || mongoose.model<ITournament>("Tournament", TournamentSchema);
