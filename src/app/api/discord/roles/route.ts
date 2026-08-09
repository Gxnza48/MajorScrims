import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/db";
import { listGuildRoles, canListRoles, hasBotToken } from "@/lib/discord";

export const dynamic = "force-dynamic";

/**
 * The roles of the Major Scrims Discord, for the picker in the tournament panel.
 *
 * Admin-only, and only answerable with a bot token: an OAuth token can read the
 * role *ids* of its own owner but never the server's role list with names. When
 * the token is missing this still returns 200 with `available: false`, so the
 * panel can fall back to "paste the role id by hand" instead of showing an error.
 */
export async function GET() {
    try {
        if (!(await requireAdminSession())) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        if (!canListRoles()) {
            return NextResponse.json({
                success: true,
                available: false,
                reason: hasBotToken() ? "not-configured" : "no-token",
                roles: [],
            });
        }

        const { roles, error, status } = await listGuildRoles();
        return NextResponse.json({
            success: true,
            available: error === null,
            reason: error ? (status ? `${error}:${status}` : error) : null,
            roles,
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
