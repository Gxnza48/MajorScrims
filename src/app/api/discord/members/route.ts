import { NextRequest, NextResponse } from "next/server";
import { connectToDB, requireAdminSession } from "@/lib/db";
import { UserProfile } from "@/lib/models/UserProfile";
import { fetchMemberName, hasBotToken } from "@/lib/discord";

export const dynamic = "force-dynamic";

/** A whole squad list at once, but not the whole server. */
const MAX_IDS = 120;

/**
 * How many lookups run at once. Sequential took ~0.4s each, which puts a
 * tournament's worth of players past the time a serverless function is given;
 * four at a time keeps it well inside without making Discord rate-limit us
 * (and `fetchMemberName` waits out a 429 anyway).
 */
const CONCURRENCY = 4;

async function inBatches<T, R>(items: T[], size: number, run: (item: T) => Promise<R>) {
    const out: R[] = [];
    for (let i = 0; i < items.length; i += size) {
        out.push(...(await Promise.all(items.slice(i, i + size).map(run))));
    }
    return out;
}

/**
 * Puts names on Discord ids.
 *
 * A moderator can write a player into a duo by pasting their id, and somebody
 * who has never signed in here has no profile to read a name from - so the
 * panel showed a row of digits. The bot can answer for anyone in the server, so
 * this asks it and **stores the answer on the profile**: the name then shows up
 * everywhere else too, including the teammate written onto a claim.
 */
export async function POST(request: NextRequest) {
    try {
        if (!(await requireAdminSession())) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const ids: string[] = Array.isArray(body?.ids)
            ? Array.from(
                new Set<string>(
                    (body.ids as unknown[])
                        .map(v => String(v ?? "").trim())
                        .filter(v => /^\d{5,25}$/.test(v))
                )
            ).slice(0, MAX_IDS)
            : [];
        if (!ids.length) return NextResponse.json({ success: true, members: [] });

        await connectToDB();
        const known = await UserProfile.find({ discordId: { $in: ids } });
        const byId = new Map(known.map(p => [p.discordId, p]));

        const members: { discordId: string; name: string; avatarUrl: string }[] = [];
        const missing: string[] = [];

        for (const id of ids) {
            const profile = byId.get(id);
            const name = profile?.epicName || profile?.discordName || "";
            if (name) members.push({ discordId: id, name, avatarUrl: profile?.avatarUrl || "" });
            else missing.push(id);
        }

        if (missing.length && hasBotToken()) {
            const found = await inBatches(missing, CONCURRENCY, id => fetchMemberName(id));
            for (const m of found) {
                if (!m) continue;
                members.push(m);
                await UserProfile.findOneAndUpdate(
                    { discordId: m.discordId },
                    { discordId: m.discordId, discordName: m.name, avatarUrl: m.avatarUrl },
                    { upsert: true }
                );
            }
        }

        return NextResponse.json({
            success: true,
            members,
            /** Ids the bot could not name: not in the server, or no bot token. */
            unresolved: ids.filter(id => !members.some(m => m.discordId === id)),
            botReady: hasBotToken(),
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
