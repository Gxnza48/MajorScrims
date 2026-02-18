"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { StatsCard } from "@/components/StatsCard";
import { useI18n } from "@/i18n";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { User, Shield, Zap, Target, TrendingUp } from "lucide-react";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const { t } = useI18n();

    useEffect(() => {
        if (status === "unauthenticated") {
            redirect("/login");
        }
    }, [status]);

    if (status === "loading") {
        return <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>;
    }

    if (!session) return null;

    // FAKE DATA
    const stats = {
        matches: 142,
        kills: 342,
        winRate: 12.5,
        placementRate: 45.2,
        kd: 2.41,
        avgPlacement: 18,
    };

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
                                    <img src={session.user.image} alt={session.user.name || "User"} className="w-full h-full object-cover" />
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
                                <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">{t.dashboard.performance}</span>
                            </motion.div>
                            <h1 className="text-4xl md:text-6xl font-heading font-black text-white mb-4 tracking-tight uppercase">
                                {t.dashboard.welcome} <span className="text-primary text-glow">{session.user?.name}</span>
                            </h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-8">
                                <div className="flex items-center gap-3">
                                    <Target size={18} className="text-gray-500" />
                                    <span className="text-sm font-black text-gray-400 uppercase tracking-widest">{t.dashboard.ranking}: <span className="text-white">#124</span></span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <TrendingUp size={18} className="text-gray-500" />
                                    <span className="text-sm font-black text-gray-400 uppercase tracking-widest">{t.dashboard.winRate}: <span className="text-primary">12.5%</span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Stats */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-2xl font-heading font-black text-white tracking-widest uppercase flex items-center gap-4">
                                <div className="w-2 h-8 bg-primary rounded-full box-glow-primary" />
                                {t.dashboard.lifetimeStats}
                            </h2>
                            <div className="px-4 py-1.5 rounded-xl glass border-white/5">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t.dashboard.exampleData}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <StatsCard
                                title={t.dashboard.totalMatches}
                                value={stats.matches}
                                trend={{ value: 12, label: t.dashboard.thisWeek, positive: true }}
                            />
                            <StatsCard
                                title={t.dashboard.totalKills}
                                value={stats.kills}
                                trend={{ value: 5, label: t.dashboard.thisWeek, positive: true }}
                            />
                            <StatsCard
                                title={t.dashboard.winRate}
                                value={`${stats.winRate}%`}
                                trend={{ value: 2.1, label: t.dashboard.vsLastSeason, positive: false }}
                            />
                            <StatsCard
                                title={t.dashboard.kdRatio}
                                value={stats.kd}
                                subtitle="top 15%"
                            />
                            <StatsCard
                                title={t.dashboard.avgPlacement}
                                value={`#${stats.avgPlacement}`}
                                trend={{ value: 4, label: t.dashboard.positionsUp, positive: true }}
                            />
                            <StatsCard
                                title={t.dashboard.placementRate}
                                value={`${stats.placementRate}%`}
                                subtitle="Top 25"
                            />
                        </div>
                    </div>

                    {/* Right Column: Recent Activity & Form */}
                    <div className="lg:col-span-1 space-y-10">
                        <div className="glass-dark border-white/5 rounded-[40px] p-10 relative overflow-hidden group">
                            <h3 className="text-xl font-heading font-black text-white uppercase tracking-widest mb-8 flex items-center gap-4">
                                <div className="w-1.5 h-6 bg-primary/40 rounded-full" />
                                {t.dashboard.recentForm}
                            </h3>

                            <div className="grid grid-cols-5 gap-4">
                                {["W", "L", "L", "W", "W", "L", "W", "L", "W", "L"].map((result, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.05 }}
                                        whileHover={{ scale: 1.1, y: -2 }}
                                        className={`aspect-square rounded-2xl flex items-center justify-center font-black text-sm border-2 transition-all shadow-lg ${result === "W"
                                            ? "bg-primary/10 border-primary/40 text-primary shadow-primary/10"
                                            : "bg-red-500/10 border-red-500/40 text-red-500 shadow-red-500/10"
                                            }`}
                                    >
                                        {result}
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-10 pt-8 border-t border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{t.dashboard.winRate}</span>
                                    <span className="text-sm font-black text-white">50%</span>
                                </div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: "50%" }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-primary box-glow-primary"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Decorative tip card */}
                        <div className="glass border-primary/10 rounded-[40px] p-10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16" />
                            <Shield className="text-primary mb-6" size={32} />
                            <h4 className="text-lg font-heading font-black text-white uppercase tracking-widest mb-4">Pro Training</h4>
                            <p className="text-sm text-gray-400 font-medium leading-relaxed">
                                Players who review their stats weekly see a 15% increase in placement consistency.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
