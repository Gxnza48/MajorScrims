import { NextResponse } from "next/server";
import { connectToDB, requireSession } from "@/lib/db";
import { UserProfile } from "@/lib/models/UserProfile";

export const dynamic = "force-dynamic";

/** The Epic name the player last claimed with, used to prefill the claim modal. */
export async function GET() {
    try {
        const session = await requireSession();
        if (!session) return NextResponse.json({ success: true, epicName: "" });

        // When the Epic provider is live its name wins over anything typed before.
        if (session.user.epicName) {
            return NextResponse.json({ success: true, epicName: session.user.epicName, fromEpic: true });
        }

        await connectToDB();
        const profile = await UserProfile.findOne({ discordId: session.user.id });

        return NextResponse.json({ success: true, epicName: profile?.epicName || "" });
    } catch {
        // A missing profile must never block the claim flow.
        return NextResponse.json({ success: true, epicName: "" });
    }
}
