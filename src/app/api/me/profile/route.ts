import { NextRequest, NextResponse } from "next/server";
import { connectToDB, requireSession, isAdminId } from "@/lib/db";
import { UserProfile } from "@/lib/models/UserProfile";
import { syncProfile } from "@/lib/userProfile";
import { isProConfigured, canListRoles } from "@/lib/discord";

export const dynamic = "force-dynamic";

/**
 * The signed-in user's own profile. Also the moment we refresh their PRO role
 * from Discord, so the badge and the tournament roster stay current.
 */
export async function GET() {
    try {
        const session = await requireSession();
        if (!session) {
            // proDetectionReady is reported even without a session: it says nothing
            // about any user, only whether the Discord env vars are configured, and
            // it is the only way to check that from outside without logging in.
            return NextResponse.json({
                success: true,
                signedIn: false,
                epicName: "",
                isPro: false,
                proDetectionReady: isProConfigured(),
                // Same idea: says nothing about any user, only whether the bot
                // token is configured - which is how the per-tournament role
                // picker and the live role check are verified from outside.
                botRolesReady: canListRoles(),
            });
        }

        const profile = await syncProfile(session);

        return NextResponse.json({
            success: true,
            signedIn: true,
            epicName: profile.epicName || "",
            isPro: profile.isPro,
            isAdmin: isAdminId(session.user.id),
            // false means nobody can be detected as PRO yet - the env vars are missing
            proDetectionReady: isProConfigured(),
            botRolesReady: canListRoles(),
            // why the last Discord lookup did or did not resolve
            proCheckReason: profile.proCheckReason || null,
        });
    } catch {
        // A profile problem must never block the rest of the page.
        return NextResponse.json({ success: true, signedIn: true, epicName: "", isPro: false });
    }
}

/** Lets a player save the Epic name moderators use to identify them. */
export async function PUT(request: NextRequest) {
    try {
        const session = await requireSession();
        if (!session) {
            return NextResponse.json({ success: false, error: "Necesitás iniciar sesión." }, { status: 401 });
        }

        const { epicName } = await request.json();
        const clean = String(epicName ?? "").trim().slice(0, 60);

        await connectToDB();
        const profile = await UserProfile.findOneAndUpdate(
            { discordId: session.user.id },
            { discordId: session.user.id, epicName: clean, discordName: session.user.name || "" },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, epicName: profile.epicName });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
