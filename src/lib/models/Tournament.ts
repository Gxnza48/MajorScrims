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
    /**
     * The outline, for zones that are not rectangles - an official map division
     * has slanted and L-shaped areas. Same 0..1 space. `x/y/w/h` are its
     * bounding box, so code that only wants a position keeps working.
     */
    points?: { x: number; y: number }[];
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

/**
 * A Discord role whose holders may claim a spot in this tournament. The name is
 * stored next to the id on purpose: moderators create a role per tournament, and
 * the pages have to show "necesitás el rol Copa Agosto" without asking Discord
 * on every render (and still read right if the role is later deleted).
 */
export interface IQualifiedRole {
    _id: Types.ObjectId;
    roleId: string;
    roleName: string;
}

/**
 * A team a moderator wrote down before the tournament: "k1ng juega con fazer".
 * Whoever of them marks a spot first drags the rest of the team into it, so a
 * duo never has to pick each other from a dropdown.
 */
export interface IPresetTeam {
    _id: Types.ObjectId;
    memberIds: string[];
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
     * The Discord roles that qualify for this tournament. Moderators create one
     * role per event (there are pros who do not qualify and non-pros who do), so
     * this is the fast path: give the role, they can spot.
     */
    qualifiedRoles: Types.DocumentArray<IQualifiedRole & Document>;
    /**
     * Discord ids a moderator ticked from the roster: the players who qualified.
     * Adds to the roles above rather than replacing them, so one player the role
     * missed can still be waved through by hand.
     */
    qualifiedIds: string[];
    /**
     * Escape hatch for a player who qualified but has never signed in, so the
     * moderator cannot tick them yet: pre-authorise them by Epic name and the
     * claim goes through when they finally do sign in.
     */
    participants: string[];
    /** Duos/trios written down by a moderator, by Discord id. */
    presetTeams: Types.DocumentArray<IPresetTeam & Document>;
    windows: Types.DocumentArray<IWindow & Document>;
}

/**
 * A corner of a zone's outline. Declared as its own schema with `_id: false`:
 * an inline `[{ x: Number, y: Number }]` reads `_id` as a field rather than an
 * option and Mongoose then drops the whole array on save.
 */
const PointSchema = new Schema<{ x: number; y: number }>(
    { x: { type: Number, required: true }, y: { type: Number, required: true } },
    { _id: false }
);

const ZoneSchema = new Schema<IZone>({
    label: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true },
    capacity: { type: Number, required: true, default: 1, min: 1 },
    points: { type: [PointSchema], default: undefined },
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

const QualifiedRoleSchema = new Schema<IQualifiedRole>({
    roleId: { type: String, required: true },
    roleName: { type: String, default: "" },
});

const PresetTeamSchema = new Schema<IPresetTeam>({
    memberIds: { type: [String], default: [] },
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
        qualifiedRoles: { type: [QualifiedRoleSchema], default: [] },
        qualifiedIds: { type: [String], default: [] },
        participants: { type: [String], default: [] },
        presetTeams: { type: [PresetTeamSchema], default: [] },
        windows: { type: [WindowSchema], default: [] },
    },
    { timestamps: true }
);

export const Tournament: Model<ITournament> =
    mongoose.models.Tournament || mongoose.model<ITournament>("Tournament", TournamentSchema);
