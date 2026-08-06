"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { StatsCard } from "@/components/StatsCard";
import { useI18n } from "@/i18n";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Shield, Zap, Target, TrendingUp, Info, FileEdit, Users, Trophy } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { t } = useI18n();

    const [playerData, setPlayerData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [playerFound, setPlayerFound] = useState<boolean>(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            // Fetch stats from MongoDB linked to this Discord session
            fetch("/api/player")
                .then(async (res) => {
                    const data = await res.json();
                    if (!res.ok) {
                        if (res.status === 404) {
                            setPlayerFound(false);
                        }
                        throw new Error(data.error || "Error fetch");
                    }
                    return data;
                })
                .then((data) => {
                    if (data.player) {
                        setPlayerData(data.player);
                        setPlayerFound(true);
                    }
                    setIsLoading(false);
                })
                .catch((err) => {
                    console.error("Failed to fetch player stats", err);
                    setIsLoading(false);
                });

            // Check admin status
            fetch("/api/me/admin")
                .then(res => res.json())
                .then(data => setIsAdmin(data.isAdmin === true))
                .catch(() => {});
        }
    }, [status, router]);

    if (status === "loading" || isLoading) {
        return <div className="flex min-h-screen items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>;
    }

    if (!session) return null;

    // Use MongoDB player stats if available, otherwise default to zeroes
    const dbStats = playerData?.stats || {};
    const stats = {
        matches: dbStats.games || 0,
        kills: dbStats.kills || 0,
        wins: dbStats.wins || 0,
        winRate: dbStats.games > 0 ? ((dbStats.wins || 0) / dbStats.games * 100).toFixed(1) : 0,
        kd: dbStats.games ? ((dbStats.kills || 0) / Math.max(1, dbStats.games - (dbStats.wins || 0))).toFixed(2) : 0,
        avgKills: dbStats.games > 0 ? ((dbStats.kills || 0) / dbStats.games).toFixed(2) : 0,
    };
    
    // Derived score directly from the player document
    const totalScore = dbStats.xp || playerData?.score || 0;

    return (
        <div className="relative overflow-hidden">
            {/* Subtle background orb */}
            <div className="pointer-events-none absolute right-0 top-0 -mr-64 -mt-64 h-[600px] w-[600px] rounded-full bg-primary/[0.06] blur-[150px]" />

            <div className="container relative z-10 mx-auto max-w-7xl px-6 py-16">
                {/* User Header */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-16 rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-12"
                >
                    <div className="flex flex-col items-center gap-10 md:flex-row">
                        <div className="relative">
                            <div className="relative h-32 w-32 overflow-hidden rounded-full border border-white/10 md:h-40 md:w-40">
                                {session.user?.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={session.user.image}
                                        alt={session.user.name || "User"}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-white/5 text-primary">
                                        <User size={64} />
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 rounded-full border border-primary/30 bg-primary/10 p-2.5">
                                <Shield size={24} className="text-primary" />
                            </div>
                        </div>

                        <div className="text-center md:text-left">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                                <Zap size={16} className="text-primary" />
                                <span className="text-sm font-medium text-primary">{t.dashboard.performance} {playerData ? t.dashboard.linked : t.dashboard.noData}</span>
                            </div>
                            <h1 className="mb-3 text-3xl font-bold text-white md:text-5xl">
                                {t.dashboard.welcome} <span className="text-primary" style={{ textShadow: "0 0 36px rgba(34,217,98,0.45)" }}>{session.user?.name}</span>
                            </h1>
                            <p className="mb-5 max-w-xl text-sm text-white/60 md:text-base">
                                {t.dashboard.welcomeDesc}
                            </p>
                            <div className="flex flex-wrap justify-center gap-8 md:justify-start">
                                <div className="flex items-center gap-3">
                                    <Target size={18} className="text-white/40" />
                                    <span className="text-sm text-white/60">Score / XP: <span className="font-semibold text-white">{totalScore}</span></span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <TrendingUp size={18} className="text-white/40" />
                                    <span className="text-sm text-white/60">{t.dashboard.winRate}: <span className="font-semibold text-primary">{stats.winRate}%</span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Empty State Banner */}
                {!playerFound && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 flex items-start gap-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-6 md:items-center md:p-8"
                    >
                        <div className="shrink-0 rounded-full bg-red-500/15 p-4 text-red-400">
                            <Info size={32} />
                        </div>
                        <div>
                            <h3 className="mb-2 text-xl font-bold text-white md:text-2xl">
                                {t.dashboard.accountNotFound}
                            </h3>
                            <p className="max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">
                                {t.dashboard.accountNotFoundDesc} (<span className="font-semibold text-white">{session.user?.name}</span>)
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Stats */}
                    <div className="lg:col-span-2">
                        <div className="mb-10 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">
                                {t.dashboard.lifetimeStats}
                            </h2>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                                <div className={`h-2 w-2 rounded-full ${playerData ? "animate-pulse bg-primary" : "bg-red-500"}`} />
                                <span className="text-xs font-medium text-white/60">
                                    {playerData ? t.dashboard.liveData : t.dashboard.needsSync}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <StatsCard
                                title={t.dashboard.totalMatches}
                                value={stats.matches}
                            />
                            <StatsCard
                                title={t.dashboard.totalKills}
                                value={stats.kills}
                            />
                            <StatsCard
                                title={t.dashboard.totalWins}
                                value={stats.wins}
                            />
                            <StatsCard
                                title={t.dashboard.kdRatio}
                                value={stats.kd}
                            />
                            <StatsCard
                                title={t.dashboard.avgKills}
                                value={stats.avgKills}
                            />
                            <StatsCard
                                title={t.dashboard.points}
                                value={totalScore}
                            />
                        </div>
                    </div>

                    {/* Right Column: Admin & Tip */}
                    <div className="space-y-6 lg:col-span-1">
                        {/* Admin Cards */}
                        {isAdmin && (
                            <>
                                <Link href="/dashboard/blog" className="block">
                                    <div className="cursor-pointer rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-colors duration-300 hover:border-primary/35">
                                        <FileEdit className="mb-6 text-primary" size={32} />
                                        <h4 className="mb-3 text-lg font-bold text-white">Blog Admin</h4>
                                        <p className="text-sm leading-relaxed text-white/60">
                                            Gestionar artículos, noticias y anuncios del blog de Major Scrims.
                                        </p>
                                    </div>
                                </Link>
                                <Link href="/dashboard/players" className="block">
                                    <div className="cursor-pointer rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-colors duration-300 hover:border-primary/35">
                                        <Users className="mb-6 text-primary" size={32} />
                                        <h4 className="mb-3 text-lg font-bold text-white">Players Admin</h4>
                                        <p className="text-sm leading-relaxed text-white/60">
                                            Gestionar fotos y datos de los pro players de Major Scrims.
                                        </p>
                                    </div>
                                </Link>
                                <Link href="/dashboard/tournaments" className="block">
                                    <div className="cursor-pointer rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-colors duration-300 hover:border-primary/35">
                                        <Trophy className="mb-6 text-primary" size={32} />
                                        <h4 className="mb-3 text-lg font-bold text-white">Torneos Admin</h4>
                                        <p className="text-sm leading-relaxed text-white/60">
                                            Cargar torneos, rondas y marcar los spots de caída en el mapa.
                                        </p>
                                    </div>
                                </Link>
                            </>
                        )}

                        {/* Tip card */}
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-colors duration-300 hover:border-primary/35">
                            <Shield className="mb-6 text-primary" size={32} />
                            <h4 className="mb-3 text-lg font-bold text-white">{t.dashboard.accountLinked}</h4>
                            <p className="text-sm leading-relaxed text-white/60">
                                {t.dashboard.accountLinkedDesc}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
