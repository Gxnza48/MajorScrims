import React from 'react';
import { Calendar, Users, Trophy, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface TournamentProps {
    title: string;
    start: string;
    end: string;
    mode: string;
    teamSize: string;
    region: string;
    status: 'Upcoming' | 'Live' | 'Completed';
    poster: string;
}

export default function TournamentCard({ tournament, index }: { tournament: TournamentProps; index: number }) {
    const startDate = new Date(tournament.start).toLocaleDateString();
    const startTime = new Date(tournament.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.08, duration: 0.4 }}
            className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors duration-300 hover:border-primary/35"
        >
            <div className="relative aspect-square overflow-hidden bg-white/[0.02]">
                {tournament.poster ? (
                    <img
                        src={tournament.poster}
                        alt={tournament.title}
                        className="h-full w-full object-cover object-top"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <Trophy className="text-white/20" size={64} />
                    </div>
                )}
                <div className="absolute right-2 top-2 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                    <span className={
                        tournament.status === 'Live' ? 'text-red-500 animate-pulse' :
                            tournament.status === 'Upcoming' ? 'text-primary' :
                                'text-white/50'
                    }>
                        {tournament.status}
                    </span>
                </div>
            </div>

            <div className="p-5">
                <h3 className="mb-4 line-clamp-1 text-xl font-bold text-white" title={tournament.title}>
                    {tournament.title}
                </h3>

                <div className="grid grid-cols-2 gap-y-3 text-sm text-white/60">
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-primary" />
                        <span>{startDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={14} className="text-primary" />
                        <span>{startTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users size={14} className="text-primary" />
                        <span>{tournament.teamSize}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-primary" />
                        <span>{tournament.region}</span>
                    </div>
                </div>

                {/* Mode Badge */}
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-xs uppercase text-white/40">Mode</span>
                    <span className="rounded bg-white/5 px-2 py-1 text-sm font-bold text-white">
                        {tournament.mode}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
