import { NextRequest, NextResponse } from "next/server";
import { connectToDB, requireAdminSession } from "@/lib/db";
import { Tournament } from "@/lib/models/Tournament";
import { SpotClaim } from "@/lib/models/SpotClaim";
import { toDetailDTO } from "@/lib/tournamentDTO";

export const dynamic = "force-dynamic";

const clamp01 = (n: number) => Math.min(1, Math.max(0, Number(n) || 0));

/**
 * Saves the drop zones a moderator drew for one window. Zones are reconciled by
 * id so redrawing one does not wipe the claims sitting on the others; claims on
 * zones the moderator deleted are removed with them.
 */
export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
    try {
        if (!(await requireAdminSession())) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        await connectToDB();
        const tournament = await Tournament.findOne({ slug: params.slug });
        if (!tournament) {
            return NextResponse.json({ success: false, error: "Torneo no encontrado" }, { status: 404 });
        }

        const { windowId, zones } = await request.json();
        const target = tournament.windows.id(windowId);
        if (!target) {
            return NextResponse.json({ success: false, error: "Ventana no encontrada" }, { status: 404 });
        }
        if (!Array.isArray(zones)) {
            return NextResponse.json({ success: false, error: "zones debe ser un array" }, { status: 400 });
        }

        const keptIds: string[] = [];

        for (const incoming of zones) {
            const x = clamp01(incoming.x);
            const y = clamp01(incoming.y);
            const w = clamp01(incoming.w);
            const h = clamp01(incoming.h);
            if (w <= 0 || h <= 0) continue;

            const patch = {
                label: String(incoming.label || "Spot").trim().slice(0, 60),
                x,
                y,
                // keep the rect inside the image even if the drag ran off the edge
                w: Math.min(w, 1 - x),
                h: Math.min(h, 1 - y),
                capacity: Math.max(1, Number(incoming.capacity) || 1),
            };

            const existing = incoming.id ? target.zones.id(incoming.id) : null;
            if (existing) {
                Object.assign(existing, patch);
                keptIds.push(String(existing._id));
            } else {
                target.zones.push(patch as never);
                keptIds.push(String(target.zones[target.zones.length - 1]._id));
            }
        }

        const removed = target.zones.filter(z => !keptIds.includes(String(z._id))).map(z => String(z._id));
        if (removed.length) {
            target.zones = target.zones.filter(z => keptIds.includes(String(z._id))) as typeof target.zones;
            await SpotClaim.deleteMany({
                tournamentId: tournament._id,
                windowId: String(target._id),
                zoneId: { $in: removed },
            });
        }

        await tournament.save();
        return NextResponse.json({ success: true, tournament: toDetailDTO(tournament, true) });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
