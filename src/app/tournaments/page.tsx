'use client';

import { useEffect, useMemo, useState } from 'react';
import TournamentCard, { TournamentCardData } from '@/components/TournamentCard';
import { Trophy, Loader2, Search, Map, Target } from 'lucide-react';
import { useI18n } from '@/i18n';

type Filter = 'All' | 'Upcoming' | 'Live' | 'Completed';

export default function TournamentsPage() {
    const { t } = useI18n();
    const [tournaments, setTournaments] = useState<TournamentCardData[] | null>(null);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<Filter>('All');

    useEffect(() => {
        fetch('/api/tournaments')
            .then(res => res.json())
            .then(data => {
                if (data.success) setTournaments(data.tournaments);
                else throw new Error(data.error);
            })
            .catch(() => {
                setError('No se pudieron cargar los torneos.');
                setTournaments([]);
            });
    }, []);

    const filters: { key: Filter; label: string }[] = [
        { key: 'All', label: t.tournaments.all },
        { key: 'Upcoming', label: t.tournaments.status.upcoming },
        { key: 'Live', label: t.tournaments.status.live },
        { key: 'Completed', label: t.tournaments.status.completed },
    ];

    const visible = useMemo(() => {
        if (!tournaments) return [];
        const q = query.trim().toLowerCase();
        return tournaments.filter(item => {
            if (filter !== 'All' && item.status !== filter) return false;
            if (!q) return true;
            return `${item.name} ${item.mode} ${item.teamSize}`.toLowerCase().includes(q);
        });
    }, [tournaments, query, filter]);

    // The banner borrows the poster of the most relevant tournament, the way
    // nobleprac does - it keeps the header alive without shipping another asset.
    const bannerPoster = tournaments?.find(item => item.poster)?.poster;

    return (
        <div className="min-h-screen text-white">
            {/* -mt-[88px] pulls the banner up behind the sticky nav (nav height = 88px) */}
            <section className="relative -mt-[88px] overflow-hidden border-b border-white/10">
                {bannerPoster && (
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-25"
                        style={{ backgroundImage: `url(${bannerPoster})` }}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg0,#04130A)] via-[var(--bg0,#04130A)]/85 to-transparent" />
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            'radial-gradient(120% 90% at 0% 100%, rgb(var(--acc-rgb) / 0.22), transparent 60%)',
                    }}
                />

                <div className="container relative z-10 mx-auto max-w-7xl px-6 pb-12 pt-[124px] md:pb-16 md:pt-[150px]">
                    <h1 className="text-3xl font-black tracking-tight md:text-5xl">{t.tournaments.title}</h1>
                    <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">{t.tournaments.subtitle}</p>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 backdrop-blur-sm">
                            <Map size={14} className="text-primary" /> {t.tournaments.badgeMaps}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 backdrop-blur-sm">
                            <Target size={14} className="text-primary" /> {t.tournaments.badgeSpots}
                        </span>
                    </div>
                </div>
            </section>

            <div className="border-b border-white/10 bg-white/[0.02]">
                <div className="container mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
                    <div className="relative w-full md:max-w-xs">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
                        <input
                            type="search"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder={t.tournaments.search}
                            className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/35 outline-none transition-colors focus:border-primary/40"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-white/40">{t.tournaments.filterLabel}</span>
                        {filters.map(f => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${filter === f.key
                                    ? 'bg-primary text-[#04130A]'
                                    : 'border border-white/10 text-white/60 hover:border-white/25 hover:text-white'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="container mx-auto max-w-7xl px-6 py-12">
                <h2 className="mb-6 text-lg font-bold text-white">{t.tournaments.sectionAll}</h2>

                {tournaments === null ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 size={40} className="mb-4 animate-spin text-primary" />
                        <p className="text-sm text-white/60">{t.tournaments.loading}</p>
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 py-16 text-center">
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                ) : visible.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-20 text-center">
                        <Trophy size={40} className="mx-auto mb-4 text-primary/60" />
                        <p className="text-sm text-white/60">
                            {tournaments.length === 0 ? t.tournaments.empty : t.tournaments.emptySearch}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {visible.map((tournament, index) => (
                            <TournamentCard key={tournament.slug} tournament={tournament} index={index} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
