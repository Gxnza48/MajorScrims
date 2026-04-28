import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ isAdmin: false });
        }

        const adminDiscordIds = process.env.ADMIN_DISCORD_IDS
            ? process.env.ADMIN_DISCORD_IDS.split(",").map(id => id.trim())
            : [];

        const isAdmin = adminDiscordIds.includes(session.user.id);

        return NextResponse.json({ isAdmin, userId: session.user.id });
    } catch {
        return NextResponse.json({ isAdmin: false });
    }
}
