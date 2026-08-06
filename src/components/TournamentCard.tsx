'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Trophy, Clock, Radio, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n';

export interface TournamentCardData {
    slug: string;
    name: string;
    poster: string;
    mode: string;
    teamSize: string;
    region: string;
    start: string;
    end: string;
    status: string;
}

export default function TournamentCard({
    tournament,
    index,
}: {
    tournament: TournamentCardData;
    index: number;
}) {
    const { t } = useI18n();
    // Posters point at Epic's CDN, which rotates URLs between seasons - a dead
    // link must fall back to the placeholder instead of an empty black box.
    const [posterFailed, setPosterFailed] = useState(false);
    const showPoster = !!tournament.poster && !posterFailed;

    const statusMeta = {
        Live: { label: t.tournaments.status.live, icon: Radio, className: 'text-red-400', dot: 'animate-pulse' },
        Upcoming: { label: t.tournaments.status.upcoming, icon: Clock, className: 'text-primary', dot: '' },
        Completed: { label: t.tournaments.status.completed, icon: CheckCircle2, className: 'text-white/50', dot: '' },
    }[tournament.status] ?? {
        label: tournament.status,
        icon: Clock,
        className: 'text-white/50',
        dot: '',
    };

    const StatusIcon = statusMeta.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.35 }}
        >
            <Link
                href={`/tournaments/${tournament.slug}`}
                className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors duration-300 hover:border-primary/40"
            >
                <div className="relative aspect-[4/3] overflow-hidden bg-white/[0.02]">
                    {showPoster ? (
                        <img
                            src={tournament.poster}
                            alt=""
                            onError={() => setPosterFailed(true)}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <Trophy className="text-white/15" size={56} />
                        </div>
                    )}

                    <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/70 px-2.5 py-1 backdrop-blur-md">
                        <StatusIcon size={11} className={`${statusMeta.className} ${statusMeta.dot}`} />
                        <span className={`text-[11px] font-bold uppercase tracking-wide ${statusMeta.className}`}>
                            {statusMeta.label}
                        </span>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/85 to-transparent" />
                    <h3
                        className="absolute inset-x-0 bottom-0 line-clamp-2 p-4 text-sm font-bold leading-snug text-white"
                        title={tournament.name}
                    >
                        {tournament.name}
                    </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2 px-4 py-3">
                    <span className="rounded bg-white/[0.07] px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white/70">
                        {tournament.region}
                    </span>
                    <span className="rounded bg-white/[0.07] px-2 py-1 text-[11px] font-medium text-white/50">
                        {tournament.mode}
                    </span>
                    <span className="rounded bg-white/[0.07] px-2 py-1 text-[11px] font-medium text-white/50">
                        {tournament.teamSize}
                    </span>
                </div>
            </Link>
        </motion.div>
    );
}
