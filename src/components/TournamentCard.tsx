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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#121212] border border-white/10 rounded-xl overflow-hidden hover:border-[#1FC058]/50 transition-all group"
        >
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-800 to-black">
                {tournament.poster ? (
                    <img
                        src={tournament.poster}
                        alt={tournament.title}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Trophy className="text-white/20" size={64} />
                    </div>
                )}
                <div className="absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md border border-white/10">
                    <span className={
                        tournament.status === 'Live' ? 'text-red-500 animate-pulse' :
                            tournament.status === 'Upcoming' ? 'text-[#1FC058]' :
                                'text-gray-400'
                    }>
                        {tournament.status}
                    </span>
                </div>
            </div>

            <div className="p-5">
                <h3 className="text-xl font-bold font-heading text-white mb-4 line-clamp-1" title={tournament.title}>
                    {tournament.title}
                </h3>

                <div className="grid grid-cols-2 gap-y-3 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-[#1FC058]" />
                        <span>{startDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={14} className="text-[#1FC058]" />
                        <span>{startTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users size={14} className="text-[#1FC058]" />
                        <span>{tournament.teamSize}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-[#1FC058]" />
                        <span>{tournament.region}</span>
                    </div>
                </div>

                {/* Mode Badge */}
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-xs font-mono text-gray-500 uppercase">Mode</span>
                    <span className="text-sm font-bold text-white bg-white/5 px-2 py-1 rounded">
                        {tournament.mode}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
