import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !(session.user as any).id) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const discordId = (session.user as any).id;
        console.log("🔎 Buscando en MongoDB el Discord ID:", discordId);

        const client = await clientPromise;
        const db = client.db("test"); // Using 'test' as seen in the cluster
        
        // Find the player where the 'discordId' matches
        const player = await db.collection("players").findOne({ discordId: discordId });

        if (!player) {
            console.log("❌ Jugador no encontrado para el ID:", discordId);
            return Response.json({ error: "Player not found" }, { status: 404 });
        }

        console.log("✅ Jugador encontrado:", player.displayName);

        return Response.json({ player });
    } catch (error) {
        console.error("Error fetching player stats:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
