import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
export const dynamic = "force-dynamic";
import mongoose from "mongoose";
import { ProPlayer } from "@/lib/models/ProPlayer";

const connectToDB = async () => {
    if (mongoose.connection.readyState === 1) return;
    await mongoose.connect(process.env.MONGODB_URI as string);
};

const defaultPlayers = [
    { name: "k1nG", img: "/images/pro-players/k1nG.png", role: "proplayer", order: 0 },
    { name: "Phzin", img: "/images/pro-players/Phzin.png", role: "proplayer", order: 1 },
    { name: "Fazer", img: "/images/pro-players/Fazer.png", role: "proplayer", order: 2 },
    { name: "Cadu", img: "/images/pro-players/Cadu.png", role: "proplayer", order: 3 },
    { name: "Gabzera", img: "/images/pro-players/Gabzera.png", role: "proplayer", order: 4 },
    { name: "Tisco", img: "/images/pro-players/Tisco.png", role: "proplayer", order: 5 },
];

export async function GET() {
    try {
        await connectToDB();

        let players = await ProPlayer.find({}).sort({ order: 1 });

        if (players.length === 0) {
            await ProPlayer.insertMany(defaultPlayers);
            players = await ProPlayer.find({}).sort({ order: 1 });
        }

        return NextResponse.json({ success: true, players });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const adminIds = process.env.ADMIN_DISCORD_IDS?.split(",").map(id => id.trim()) ?? [];
        if (!adminIds.includes(session.user.id)) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        await connectToDB();

        const body = await request.json();
        const { name, img, role, order } = body;

        if (!name || !img) {
            return NextResponse.json({ success: false, error: "Name and image are required" }, { status: 400 });
        }

        const count = await ProPlayer.countDocuments();
        const player = new ProPlayer({
            name,
            img,
            role: role || "proplayer",
            order: typeof order === "number" ? order : count,
        });

        await player.save();
        return NextResponse.json({ success: true, player }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
