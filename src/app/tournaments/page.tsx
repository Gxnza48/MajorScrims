'use client';

import { useEffect, useState } from 'react';
import TournamentCard from '@/components/TournamentCard';
import { Trophy, Calendar, Loader2 } from 'lucide-react';
import { useI18n } from '@/i18n';

interface Tournament {
    title: string;
    start: string;
    end: string;
    mode: string;
    teamSize: string;
    region: string;
    status: 'Upcoming' | 'Live' | 'Completed';
    poster: string;
}

export default function TournamentsPage() {
    const { t } = useI18n();
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const response = await fetch('/api/tournaments');
                if (!response.ok) throw new Error('Failed to fetch tournaments');
                const data = await response.json();
                setTournaments(data);
            } catch (err) {
                setError('Failed to load tournaments');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTournaments();
    }, []);

    return (
        <div className="min-h-screen text-white">
            <main className="container mx-auto max-w-7xl px-6 py-16">
                {/* Page Header */}
                <div className="mb-12 flex flex-col justify-between items-start gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end">
                    <div>
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                            <Trophy size={16} className="text-primary" />
                            <span className="text-sm font-medium text-primary">
                                {t.tournaments.title || 'TORNEOS'}
                            </span>
                        </div>
                        <h1 className="mb-2 text-3xl font-bold md:text-4xl">
                            {t.tournaments.title || 'TORNEOS'}
                        </h1>
                        <p className="max-w-2xl text-white/70">
                            {t.tournaments.subtitle || 'Explora los próximos torneos oficiales de Fortnite en la región de Brasil.'}
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                        <Trophy size={16} className="text-primary" />
                        <span className="text-sm font-medium text-primary">REGION: BR ONLY</span>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 size={48} className="mb-4 animate-spin text-primary" />
                        <p className="text-white/60">Cargando torneos...</p>
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 py-20 text-center">
                        <p className="mb-2 font-bold text-red-400">Error</p>
                        <p className="text-white/60">{error}</p>
                    </div>
                ) : tournaments.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-20 text-center">
                        <Calendar size={48} className="mx-auto mb-4 text-primary" />
                        <p className="text-white/60">No se encontraron torneos activos o próximos por el momento.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {tournaments.map((tournament, index) => (
                            <TournamentCard key={index} tournament={tournament} index={index} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
