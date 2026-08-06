import { NextRequest, NextResponse } from "next/server";
import { connectToDB, requireAdminSession } from "@/lib/db";
import { Tournament } from "@/lib/models/Tournament";
import { toListDTO } from "@/lib/tournamentDTO";
import { compareTournaments, slugify } from "@/lib/tournamentStatus";

export const dynamic = "force-dynamic";

/** Public list. Admins can pass ?all=1 to also see unpublished drafts. */
export async function GET(request: NextRequest) {
    try {
        await connectToDB();

        const wantsAll = request.nextUrl.searchParams.get("all") === "1";
        const isAdmin = wantsAll && (await requireAdminSession()) !== null;

        const tournaments = await Tournament.find(isAdmin ? {} : { published: true });
        const list = tournaments.map(toListDTO).sort((a, b) => compareTournaments(a, b));

        return NextResponse.json({ success: true, tournaments: list });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        if (!(await requireAdminSession())) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        await connectToDB();
        const body = await request.json();
        const { name, poster, mode, teamSize, region, start, end, published } = body;

        if (!name?.trim() || !start || !end) {
            return NextResponse.json(
                { success: false, error: "Nombre, fecha de inicio y fecha de fin son requeridos." },
                { status: 400 }
            );
        }
        if (new Date(end) < new Date(start)) {
            return NextResponse.json(
                { success: false, error: "La fecha de fin no puede ser anterior a la de inicio." },
                { status: 400 }
            );
        }

        const baseSlug = slugify(body.slug || name) || "torneo";
        let slug = baseSlug;
        for (let i = 2; await Tournament.exists({ slug }); i++) {
            slug = `${baseSlug}-${i}`;
        }

        const tournament = await Tournament.create({
            slug,
            name: name.trim(),
            poster: poster || "",
            mode: mode || "Build",
            teamSize: teamSize || "Solo",
            region: region || "BR",
            start: new Date(start),
            end: new Date(end),
            published: published !== false,
            windows: [],
        });

        return NextResponse.json({ success: true, tournament: toListDTO(tournament) }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
