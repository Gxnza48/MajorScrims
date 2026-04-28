import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Security Check: Translation API shouldn't be publicly abused, limit to admins
        const adminDiscordIds = process.env.ADMIN_DISCORD_IDS ? process.env.ADMIN_DISCORD_IDS.split(",").map(id => id.trim()) : [];
        if (!session?.user?.id || !adminDiscordIds.includes(session.user.id)) {
            return NextResponse.json({ success: false, error: "Forbidden. Not an admin." }, { status: 403 });
        }

        const { text, from, to } = await request.json();

        if (!text || !from || !to) {
            return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
        }

        // Using MyMemory Translation free API. No auth keys needed. Usage is limited to 500 words per day without key,
        // sufficient for occasional blog posts!
        // Format: from|to e.g., es|pt
        const langpair = `${from}|${to}`;
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.responseData?.translatedText) {
            return NextResponse.json({ success: true, translation: data.responseData.translatedText });
        } else {
            return NextResponse.json({ success: false, error: "Translation failed" }, { status: 500 });
        }

    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
