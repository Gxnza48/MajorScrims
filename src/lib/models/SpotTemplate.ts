import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * A saved set of drop zones a moderator can drop onto any round of any
 * tournament, so the same map division is drawn once and reused forever
 * instead of being redrawn for every tournament.
 */
export interface ITemplateZone {
    _id: Types.ObjectId;
    label: string;
    x: number;
    y: number;
    w: number;
    h: number;
    capacity: number;
    /** Outline for a zone that is not a rectangle; x/y/w/h is its box. */
    points?: { x: number; y: number }[];
}

export interface ISpotTemplate extends Document {
    name: string;
    zones: Types.DocumentArray<ITemplateZone & Document>;
    createdBy: string;
    createdByName: string;
    createdAt: Date;
    updatedAt: Date;
}

/** Same story as the tournament's zones: an inline point array gets dropped. */
const PointSchema = new Schema<{ x: number; y: number }>(
    { x: { type: Number, required: true }, y: { type: Number, required: true } },
    { _id: false }
);

const TemplateZoneSchema = new Schema<ITemplateZone>({
    label: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true },
    capacity: { type: Number, required: true, default: 1, min: 1 },
    points: { type: [PointSchema], default: undefined },
});

const SpotTemplateSchema = new Schema<ISpotTemplate>(
    {
        name: { type: String, required: true },
        zones: { type: [TemplateZoneSchema], default: [] },
        createdBy: { type: String, default: "" },
        createdByName: { type: String, default: "" },
    },
    { timestamps: true }
);

export const SpotTemplate: Model<ISpotTemplate> =
    mongoose.models.SpotTemplate || mongoose.model<ISpotTemplate>("SpotTemplate", SpotTemplateSchema);
