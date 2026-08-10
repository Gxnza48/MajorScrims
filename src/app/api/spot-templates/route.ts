import { NextRequest, NextResponse } from "next/server";
import { connectToDB, requireAdminSession } from "@/lib/db";
import { SpotTemplate } from "@/lib/models/SpotTemplate";
import { sanitizeZones } from "@/lib/mapZones";

export const dynamic = "force-dynamic";

const MAX_TEMPLATES = 60;

const toDTO = (t: {
    _id: unknown;
    name: string;
    zones: {
        label: string;
        x: number;
        y: number;
        w: number;
        h: number;
        capacity: number;
        points?: { x: number; y: number }[];
    }[];
    createdByName?: string;
    updatedAt?: Date;
}) => ({
    id: String(t._id),
    name: t.name,
    createdByName: t.createdByName || "",
    updatedAt: t.updatedAt ? new Date(t.updatedAt).toISOString() : "",
    zones: (t.zones ?? []).map(z => ({
        label: z.label,
        x: z.x,
        y: z.y,
        w: z.w,
        h: z.h,
        capacity: z.capacity ?? 1,
        ...(z.points?.length ? { points: z.points.map(p => ({ x: p.x, y: p.y })) } : {}),
    })),
});

/**
 * Saved map divisions. A moderator draws the spots once, saves the layout, and
 * drops it on any round of any future tournament instead of redrawing it.
 */
export async function GET() {
    try {
        if (!(await requireAdminSession())) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        await connectToDB();
        const templates = await SpotTemplate.find({}).sort({ updatedAt: -1 }).limit(MAX_TEMPLATES);

        return NextResponse.json({ success: true, templates: templates.map(toDTO) });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await requireAdminSession();
        if (!session) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        await connectToDB();
        const body = await request.json();

        const name = String(body.name || "").trim().slice(0, 80);
        if (!name) {
            return NextResponse.json(
                { success: false, error: "Ponele un nombre a la plantilla." },
                { status: 400 }
            );
        }

        const zones = sanitizeZones(body.zones);
        if (zones.length === 0) {
            return NextResponse.json(
                { success: false, error: "La plantilla no tiene ningún spot." },
                { status: 400 }
            );
        }

        // Same name = same layout being re-saved; overwriting beats silently
        // stacking half a dozen "Mapa BR" the moderator cannot tell apart.
        const existing = await SpotTemplate.findOne({ name });
        if (existing) {
            existing.zones = zones as never;
            existing.createdBy = session.user.id;
            existing.createdByName = session.user.name || "";
            await existing.save();
            return NextResponse.json({ success: true, template: toDTO(existing), replaced: true });
        }

        if ((await SpotTemplate.countDocuments({})) >= MAX_TEMPLATES) {
            return NextResponse.json(
                { success: false, error: `Llegaste al máximo de ${MAX_TEMPLATES} plantillas. Borrá alguna.` },
                { status: 400 }
            );
        }

        const template = await SpotTemplate.create({
            name,
            zones,
            createdBy: session.user.id,
            createdByName: session.user.name || "",
        });

        return NextResponse.json({ success: true, template: toDTO(template) }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
