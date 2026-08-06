import { NextRequest, NextResponse } from "next/server";
import { connectToDB, requireSession, isAdminId } from "@/lib/db";
import { Tournament } from "@/lib/models/Tournament";
import { SpotClaim } from "@/lib/models/SpotClaim";
import { UserProfile } from "@/lib/models/UserProfile";
import { toClaimDTO, isQualified } from "@/lib/tournamentDTO";
import { getStatus } from "@/lib/tournamentStatus";

export const dynamic = "force-dynamic";

const MAX_TEAMMATES = 3;

/** A player (or team captain) takes a drop zone for one window. */
export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
    try {
        const session = await requireSession();
        if (!session) {
            return NextResponse.json({ success: false, error: "Necesitás iniciar sesión." }, { status: 401 });
        }

        await connectToDB();
        const tournament = await Tournament.findOne({ slug: params.slug });
        if (!tournament) {
            return NextResponse.json({ success: false, error: "Torneo no encontrado" }, { status: 404 });
        }
        if (getStatus(tournament.start, tournament.end) === "Completed") {
            return NextResponse.json(
                { success: false, error: "Este torneo ya terminó." },
                { status: 409 }
            );
        }

        const body = await request.json();
        const windowId = String(body.windowId || "");
        const zoneId = String(body.zoneId || "");
        const epicName = String(body.epicName || "").trim();
        const teammates: string[] = Array.isArray(body.teammates)
            ? body.teammates.map((n: unknown) => String(n).trim()).filter(Boolean).slice(0, MAX_TEAMMATES)
            : [];

        if (!epicName) {
            return NextResponse.json(
                { success: false, error: "Ingresá tu nombre de Epic Games." },
                { status: 400 }
            );
        }

        // Only players who qualified may take a spot. Admins bypass it so a mod
        // can test the flow; everyone else can still see the map, just not claim.
        if (!isAdminId(session.user.id) && !isQualified(tournament.participants, epicName)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Solo los jugadores clasificados pueden marcar un spot en este torneo. Si clasificaste, revisá que el nombre de Epic sea exactamente el mismo con el que jugás.",
                    notQualified: true,
                },
                { status: 403 }
            );
        }

        const targetWindow = tournament.windows.id(windowId);
        const zone = targetWindow?.zones.id(zoneId);
        if (!targetWindow || !zone) {
            return NextResponse.json({ success: false, error: "Ese spot ya no existe." }, { status: 404 });
        }

        // One zone per player per window: bail out instead of silently moving them.
        const own = await SpotClaim.findOne({
            tournamentId: tournament._id,
            windowId,
            discordId: session.user.id,
        });
        if (own) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Ya tenés un spot en esta ventana. Liberalo antes de elegir otro.",
                    claimId: String(own._id),
                },
                { status: 409 }
            );
        }

        const taken = await SpotClaim.countDocuments({ tournamentId: tournament._id, windowId, zoneId });
        if (taken >= (zone.capacity ?? 1)) {
            return NextResponse.json(
                { success: false, error: "Otro equipo tomó este spot recién." },
                { status: 409 }
            );
        }

        let claim;
        try {
            claim = await SpotClaim.create({
                tournamentId: tournament._id,
                windowId,
                zoneId,
                discordId: session.user.id,
                discordName: session.user.name || "",
                epicName,
                teammates,
            });
        } catch (err) {
            // The unique index is the real guard against two simultaneous claims.
            if ((err as { code?: number }).code === 11000) {
                return NextResponse.json(
                    { success: false, error: "Ya tenés un spot en esta ventana." },
                    { status: 409 }
                );
            }
            throw err;
        }

        await UserProfile.findOneAndUpdate(
            { discordId: session.user.id },
            { discordId: session.user.id, epicName },
            { upsert: true }
        );

        return NextResponse.json({ success: true, claim: toClaimDTO(claim) }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

/** Release a spot. Players can only release their own; admins can release any. */
export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
    try {
        const session = await requireSession();
        if (!session) {
            return NextResponse.json({ success: false, error: "Necesitás iniciar sesión." }, { status: 401 });
        }

        await connectToDB();
        const tournament = await Tournament.findOne({ slug: params.slug });
        if (!tournament) {
            return NextResponse.json({ success: false, error: "Torneo no encontrado" }, { status: 404 });
        }

        const { claimId } = await request.json();
        const claim = await SpotClaim.findOne({ _id: claimId, tournamentId: tournament._id });
        if (!claim) {
            return NextResponse.json({ success: false, error: "Ese spot ya está libre." }, { status: 404 });
        }

        if (claim.discordId !== session.user.id && !isAdminId(session.user.id)) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        await claim.deleteOne();
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
