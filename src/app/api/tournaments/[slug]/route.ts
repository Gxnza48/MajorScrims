import { NextRequest, NextResponse } from "next/server";
import { connectToDB, requireAdminSession } from "@/lib/db";
import { Tournament } from "@/lib/models/Tournament";
import { SpotClaim } from "@/lib/models/SpotClaim";
import { toDetailDTO, toClaimDTO } from "@/lib/tournamentDTO";

export const dynamic = "force-dynamic";

/** Detail + every claim, so the page renders the map in a single round trip. */
export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
    try {
        await connectToDB();

        const tournament = await Tournament.findOne({ slug: params.slug });
        if (!tournament) {
            return NextResponse.json({ success: false, error: "Torneo no encontrado" }, { status: 404 });
        }
        if (!tournament.published && !(await requireAdminSession())) {
            return NextResponse.json({ success: false, error: "Torneo no encontrado" }, { status: 404 });
        }

        const claims = await SpotClaim.find({ tournamentId: tournament._id });

        return NextResponse.json({
            success: true,
            tournament: toDetailDTO(tournament),
            claims: claims.map(toClaimDTO),
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

/**
 * Admin edit of the tournament meta and its windows. Windows are reconciled by
 * id rather than replaced wholesale, so editing a label never orphans the zones
 * (and the claims that point at them).
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

        const body = await request.json();
        const { name, poster, mode, teamSize, region, start, end, published, windows } = body;

        if (name !== undefined) tournament.name = String(name).trim();
        if (poster !== undefined) tournament.poster = poster;
        if (mode !== undefined) tournament.mode = mode;
        if (teamSize !== undefined) tournament.teamSize = teamSize;
        if (region !== undefined) tournament.region = region;
        if (start !== undefined) tournament.start = new Date(start);
        if (end !== undefined) tournament.end = new Date(end);
        if (published !== undefined) tournament.published = !!published;

        if (new Date(tournament.end) < new Date(tournament.start)) {
            return NextResponse.json(
                { success: false, error: "La fecha de fin no puede ser anterior a la de inicio." },
                { status: 400 }
            );
        }

        if (Array.isArray(windows)) {
            const keptIds: string[] = [];

            for (const incoming of windows) {
                if (!incoming?.label?.trim() || !incoming?.startsAt) continue;

                const existing = incoming.id ? tournament.windows.id(incoming.id) : null;
                if (existing) {
                    existing.label = incoming.label.trim();
                    existing.startsAt = new Date(incoming.startsAt);
                    keptIds.push(String(existing._id));
                } else {
                    tournament.windows.push({
                        label: incoming.label.trim(),
                        startsAt: new Date(incoming.startsAt),
                        zones: [],
                    } as never);
                    keptIds.push(String(tournament.windows[tournament.windows.length - 1]._id));
                }
            }

            const removed = tournament.windows
                .filter(w => !keptIds.includes(String(w._id)))
                .map(w => String(w._id));

            if (removed.length) {
                tournament.windows = tournament.windows.filter(w =>
                    keptIds.includes(String(w._id))
                ) as typeof tournament.windows;
                await SpotClaim.deleteMany({ tournamentId: tournament._id, windowId: { $in: removed } });
            }
        }

        await tournament.save();
        return NextResponse.json({ success: true, tournament: toDetailDTO(tournament) });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: { slug: string } }) {
    try {
        if (!(await requireAdminSession())) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        await connectToDB();
        const tournament = await Tournament.findOneAndDelete({ slug: params.slug });
        if (!tournament) {
            return NextResponse.json({ success: false, error: "Torneo no encontrado" }, { status: 404 });
        }

        await SpotClaim.deleteMany({ tournamentId: tournament._id });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
