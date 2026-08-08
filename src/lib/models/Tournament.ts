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

/** One row of the prize pool table shown under the map. */
export interface IPrize {
    _id: Types.ObjectId;
    place: string;
    prize: string;
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
    /** Free text a moderator writes from the panel: rules, format, horarios. */
    description: string;
    /** Headline number ("R$ 10.000"), kept as text so any currency works. */
    prizePool: string;
    prizes: Types.DocumentArray<IPrize & Document>;
    /**
     * Discord ids a moderator ticked from the roster: the players who qualified.
     * Nobody but an admin can claim a spot until this has at least one entry.
     */
    qualifiedIds: string[];
    /**
     * Escape hatch for a player who qualified but has never signed in, so the
     * moderator cannot tick them yet: pre-authorise them by Epic name and the
     * claim goes through when they finally do sign in.
     */
    participants: string[];
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

const PrizeSchema = new Schema<IPrize>({
    place: { type: String, required: true },
    prize: { type: String, default: "" },
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
        description: { type: String, default: "" },
        prizePool: { type: String, default: "" },
        prizes: { type: [PrizeSchema], default: [] },
        qualifiedIds: { type: [String], default: [] },
        participants: { type: [String], default: [] },
        windows: { type: [WindowSchema], default: [] },
    },
    { timestamps: true }
);

export const Tournament: Model<ITournament> =
    mongoose.models.Tournament || mongoose.model<ITournament>("Tournament", TournamentSchema);
