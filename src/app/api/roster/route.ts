import { NextResponse } from "next/server";
import { connectToDB, requireAdminSession } from "@/lib/db";
import { UserProfile } from "@/lib/models/UserProfile";
import { isProConfigured } from "@/lib/discord";

export const dynamic = "force-dynamic";

/**
 * The list a moderator picks from when marking who qualified for a tournament.
 *
 * It can only contain people who signed in at least once - that is the only way
 * the site learns a Discord user exists. In practice that is the right set:
 * someone who never signed in could not claim a spot anyway. For a pro who
 * qualified but has not signed in yet, the tournament page has the
 * "pre-authorise by Epic name" escape hatch.
 */
export async function GET() {
    try {
        if (!(await requireAdminSession())) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        await connectToDB();

        const profiles = await UserProfile.find({})
            .sort({ isPro: -1, lastSeenAt: -1 })
            .limit(500);

        return NextResponse.json({
            success: true,
            proDetectionReady: isProConfigured(),
            users: profiles.map(p => ({
                discordId: p.discordId,
                discordName: p.discordName || p.discordId,
                avatarUrl: p.avatarUrl || "",
                epicName: p.epicName || "",
                isPro: p.isPro,
                lastSeenAt: p.lastSeenAt ? p.lastSeenAt.toISOString() : null,
            })),
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
