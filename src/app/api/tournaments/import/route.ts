import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { connectToDB, requireAdminSession } from "@/lib/db";
import { Tournament } from "@/lib/models/Tournament";
import { slugify } from "@/lib/tournamentStatus";

export const dynamic = "force-dynamic";

/** Long tournaments in the snapshot carry 20+ windows; more than this is noise in the tab strip. */
const MAX_WINDOWS = 8;

function deriveMode(name: string, eventId: string): string {
    const haystack = `${name} ${eventId}`.toLowerCase();
    if (haystack.includes("zero build") || haystack.includes("zb")) return "Zero Build";
    if (haystack.includes("reload")) return "Reload";
    return "Build";
}

function deriveTeamSize(name: string, eventId: string): string {
    const haystack = `${name} ${eventId}`.toLowerCase();
    if (haystack.includes("duo")) return "Duos";
    if (haystack.includes("trio")) return "Trios";
    if (haystack.includes("squad")) return "Squads";
    return "Solo";
}

/** "S39_SoloSeriesCup_Event1_BR" -> "Event 1" */
function windowLabel(windowId: string, index: number): string {
    const parts = String(windowId || "").split("_");
    const tail = parts.length >= 2 ? parts[parts.length - 2] : "";
    const pretty = tail.replace(/([a-z])([A-Z0-9])/g, "$1 $2").trim();
    return pretty || `Ventana ${index + 1}`;
}

interface SnapshotEvent {
    eventId?: string;
    beginTime?: string;
    endTime?: string;
    eventWindows?: { eventWindowId?: string; beginTime?: string }[];
}

/**
 * Seeds from the tournaments.json snapshot that ships with the repo.
 *
 * Default: only BR events that have not ended yet, published straight away.
 * `?templates=1`: the most recent edition of each distinct BR tournament, saved
 * as unpublished drafts. The snapshot is a point-in-time capture, so once it
 * goes stale that second mode is what is actually useful - the official BR
 * tournaments repeat every season, and a moderator only has to fix the dates
 * instead of retyping the name, poster, mode and round structure.
 */
export async function POST(request: NextRequest) {
    try {
        if (!(await requireAdminSession())) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        const templatesMode = new URL(request.url).searchParams.get("templates") === "1";

        const filePath = path.join(process.cwd(), "tournaments.json");
        const groups = JSON.parse(await fs.readFile(filePath, "utf-8"));
        if (!Array.isArray(groups)) {
            return NextResponse.json({ success: false, error: "Snapshot inválido" }, { status: 500 });
        }

        await connectToDB();

        const now = Date.now();
        let imported = 0;
        let skipped = 0;
        let candidates = 0;
        let truncatedWindows = 0;
        const names: string[] = [];

        for (const group of groups) {
            const brEvents: SnapshotEvent[] = Array.isArray(group?.regions?.BR) ? group.regions.BR : [];
            const usable = brEvents.filter(e => e?.beginTime && e?.endTime);
            if (usable.length === 0) continue;

            const selected = templatesMode
                ? // one row per tournament: its latest edition
                [...usable].sort(
                    (a, b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime()
                )[0]
                : null;

            const chosen = selected
                ? [selected]
                : usable.filter(e => new Date(e.endTime!).getTime() >= now);

            for (const event of chosen) {
                candidates++;

                const name = group.name || event.eventId || "Torneo";
                const slug = slugify(`${name}-${event.eventId || ""}`) || slugify(name);
                if (await Tournament.exists({ slug })) {
                    skipped++;
                    continue;
                }

                const allWindows = (event.eventWindows ?? []).filter(w => !!w?.beginTime);
                if (allWindows.length > MAX_WINDOWS) truncatedWindows++;

                const windows = allWindows.slice(0, MAX_WINDOWS).map((w, i) => ({
                    label: windowLabel(w.eventWindowId || "", i),
                    startsAt: new Date(w.beginTime!),
                    zones: [],
                }));

                await Tournament.create({
                    slug,
                    name,
                    poster: group.poster || "",
                    mode: deriveMode(name, event.eventId || ""),
                    teamSize: deriveTeamSize(name, event.eventId || ""),
                    region: "BR",
                    start: new Date(event.beginTime!),
                    end: new Date(event.endTime!),
                    // Templates land as drafts so nothing with stale dates hits the public page.
                    published: !templatesMode,
                    windows,
                });

                imported++;
                names.push(name);
            }
        }

        return NextResponse.json({
            success: true,
            imported,
            skipped,
            candidates,
            truncatedWindows,
            maxWindows: MAX_WINDOWS,
            names: names.slice(0, 20),
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
