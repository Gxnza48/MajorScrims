import type { Metadata } from "next";
import { Leaderboard } from "@/components/Leaderboard";

export const metadata: Metadata = {
    title: "Leaderboard — Major Scrims",
    description: "Ranking individual dos jogadores da Major Scrims. Veja a classificação por XP, kills e partidas.",
};

export default function LeaderboardPage() {
    return <Leaderboard />;
}
