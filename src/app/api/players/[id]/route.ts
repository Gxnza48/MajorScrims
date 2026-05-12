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

async function requireAdmin(session: any) {
    if (!session?.user?.id) return false;
    const adminIds = process.env.ADMIN_DISCORD_IDS?.split(",").map(id => id.trim()) ?? [];
    return adminIds.includes(session.user.id);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!(await requireAdmin(session))) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        await connectToDB();
        const body = await request.json();
        const { name, img, role, order } = body;

        const player = await ProPlayer.findByIdAndUpdate(
            params.id,
            { name, img, role, order },
            { new: true }
        );

        if (!player) {
            return NextResponse.json({ success: false, error: "Player not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, player });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!(await requireAdmin(session))) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        await connectToDB();
        const player = await ProPlayer.findByIdAndDelete(params.id);

        if (!player) {
            return NextResponse.json({ success: false, error: "Player not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
