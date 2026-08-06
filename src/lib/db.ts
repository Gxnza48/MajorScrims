import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * Shared mongoose connection helper. The API routes that predate this file
 * (players, blog) each declared their own copy of this; new routes use this one.
 */
export const connectToDB = async () => {
    if (mongoose.connection.readyState === 1) return;
    await mongoose.connect(process.env.MONGODB_URI as string);
};

export const adminIds = () =>
    process.env.ADMIN_DISCORD_IDS?.split(",").map(id => id.trim()).filter(Boolean) ?? [];

export const isAdminId = (discordId?: string | null) =>
    !!discordId && adminIds().includes(discordId);

/** Returns the session only when it belongs to a logged-in user. */
export async function requireSession() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;
    return session;
}

/** Returns the session only when the logged-in user is an admin. */
export async function requireAdminSession() {
    const session = await requireSession();
    if (!session || !isAdminId(session.user.id)) return null;
    return session;
}
