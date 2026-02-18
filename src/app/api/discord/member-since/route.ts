import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // @ts-ignore
    const accessToken = session.accessToken;
    const guildId = process.env.MAJOR_SCRIMS_GUILD_ID;

    if (!guildId) {
        return NextResponse.json({ error: "Guild ID not configured" }, { status: 503 });
    }

    try {
        // Try using user access token
        if (accessToken) {
            const res = await fetch(`https://discord.com/api/users/@me/guilds/${guildId}/member`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                return NextResponse.json({ joined_at: data.joined_at });
            }
        }

        // Fallback to Bot Token if configured
        const botToken = process.env.DISCORD_BOT_TOKEN;
        if (botToken) {
            // @ts-ignore
            const userId = session.user.id;
            const res = await fetch(`https://discord.com/api/guilds/${guildId}/members/${userId}`, {
                headers: {
                    Authorization: `Bot ${botToken}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                return NextResponse.json({ joined_at: data.joined_at });
            }
        }

        return NextResponse.json({ error: "Member data not available" }, { status: 404 });
    } catch (error) {
        console.error("Error fetching Discord member data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
