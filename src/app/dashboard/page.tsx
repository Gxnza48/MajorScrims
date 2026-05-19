"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { StatsCard } from "@/components/StatsCard";
import { useI18n } from "@/i18n";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Shield, Zap, Target, TrendingUp, Info, FileEdit, Users } from "lucide-react";
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
        return <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
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
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Background Decorative Glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full -mr-64 -mt-64 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -ml-48 -mb-48 pointer-events-none" />

            <div className="container mx-auto max-w-7xl pt-32 pb-24 px-6 relative z-10">
                {/* Immersive User Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative glass-dark border-white/10 rounded-[48px] p-8 md:p-12 mb-16 overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
                    <div className="relative flex flex-col md:flex-row items-center gap-10">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-white/10 overflow-hidden shadow-2xl transition-transform duration-700 group-hover:scale-105">
                                {session.user?.image ? (
                                    <Image 
                                        src={session.user.image} 
                                        alt={session.user.name || "User"} 
                                        width={160} 
                                        height={160} 
                                        className="w-full h-full object-cover" 
                                    />
                                ) : (
                                    <div className="w-full h-full bg-white/5 flex items-center justify-center text-primary">
                                        <User size={64} />
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 glass border-white/20 p-2.5 rounded-full shadow-xl">
                                <Shield size={24} className="text-primary" />
                            </div>
                        </div>

                        <div className="text-center md:text-left">
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-primary/20 mb-4"
                            >
                                <Zap size={14} className="text-primary fill-primary" />
                                <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">{t.dashboard.performance} {playerData ? t.dashboard.linked : t.dashboard.noData}</span>
                            </motion.div>
                            <h1 className="text-4xl md:text-6xl font-heading font-black text-white mb-4 tracking-tight uppercase">
                                {t.dashboard.welcome} <span className="text-primary text-glow">{session.user?.name}</span>
                            </h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-8">
                                <div className="flex items-center gap-3">
                                    <Target size={18} className="text-gray-500" />
                                    <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Score / XP: <span className="text-white">{totalScore}</span></span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <TrendingUp size={18} className="text-gray-500" />
                                    <span className="text-sm font-black text-gray-400 uppercase tracking-widest">{t.dashboard.winRate}: <span className="text-primary">{stats.winRate}%</span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Empty State Banner */}
                {!playerFound && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-12 bg-red-500/10 border border-red-500/20 backdrop-blur-[20px] rounded-3xl p-6 md:p-8 flex items-start md:items-center gap-6 shadow-[0_0_40px_-10px_rgba(239,68,68,0.2)]"
                    >
                        <div className="bg-red-500/20 p-4 rounded-full text-red-400 shrink-0 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                            <Info size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest mb-2 font-heading">
                                {t.dashboard.accountNotFound}
                            </h3>
                            <p className="text-gray-400 text-sm md:text-base font-medium leading-relaxed max-w-2xl">
                                {t.dashboard.accountNotFoundDesc} (<span className="text-white font-bold">{session.user?.name}</span>)
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Stats */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-2xl font-heading font-black text-white tracking-widest uppercase flex items-center gap-4">
                                <div className="w-2 h-8 bg-primary rounded-full box-glow-primary" />
                                {t.dashboard.lifetimeStats}
                            </h2>
                            <div className="px-4 py-1.5 rounded-xl glass border-white/5 flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${playerData ? "bg-primary animate-pulse" : "bg-red-500"}`} />
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                    {playerData ? t.dashboard.liveData : t.dashboard.needsSync}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                                title={t.dashboard.winRate}
                                value={`${stats.winRate}%`}
                            />
                        </div>
                    </div>

                    {/* Right Column: Recent Activity & Form */}
                    <div className="lg:col-span-1 space-y-10">
                        {/* Admin Cards */}
                        {isAdmin && (
                            <>
                                <Link href="/dashboard/blog" className="block">
                                    <div className="glass border-primary/20 rounded-[40px] p-10 relative overflow-hidden group hover:border-primary/40 transition-all duration-300 cursor-pointer">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors" />
                                        <FileEdit className="text-primary mb-6" size={32} />
                                        <h4 className="text-lg font-heading font-black text-white uppercase tracking-widest mb-4 group-hover:text-primary transition-colors">Blog Admin</h4>
                                        <p className="text-sm text-gray-400 font-medium leading-relaxed">
                                            Gestionar artículos, noticias y anuncios del blog de Major Scrims.
                                        </p>
                                    </div>
                                </Link>
                                <Link href="/dashboard/players" className="block">
                                    <div className="glass border-primary/20 rounded-[40px] p-10 relative overflow-hidden group hover:border-primary/40 transition-all duration-300 cursor-pointer">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors" />
                                        <Users className="text-primary mb-6" size={32} />
                                        <h4 className="text-lg font-heading font-black text-white uppercase tracking-widest mb-4 group-hover:text-primary transition-colors">Players Admin</h4>
                                        <p className="text-sm text-gray-400 font-medium leading-relaxed">
                                            Gestionar fotos y datos de los pro players de Major Scrims.
                                        </p>
                                    </div>
                                </Link>
                            </>
                        )}

                        {/* Decorative tip card */}
                        <div className="glass border-primary/10 rounded-[40px] p-10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16" />
                            <Shield className="text-primary mb-6" size={32} />
                            <h4 className="text-lg font-heading font-black text-white uppercase tracking-widest mb-4">{t.dashboard.accountLinked}</h4>
                            <p className="text-sm text-gray-400 font-medium leading-relaxed">
                                {t.dashboard.accountLinkedDesc}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
