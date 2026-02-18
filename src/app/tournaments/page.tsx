'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
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
        <div className="min-h-screen bg-black text-white selection:bg-[#1FC058] selection:text-black">
            <Navbar />

            <main className="container mx-auto px-4 pt-32 pb-20">
                {/* Page Header */}
                <div className="mb-12 border-b border-white/10 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold font-heading mb-2">
                            <span className="text-gradient uppercase">{t.tournaments.title || 'TORNEOS'}</span>
                        </h1>
                        <p className="text-gray-400 font-sans max-w-2xl">
                            {t.tournaments.subtitle || 'Explora los próximos torneos oficiales de Fortnite en la región de Brasil.'}
                        </p>
                    </div>

                    <div className="flex gap-2 text-sm font-mono text-[#1FC058] bg-[#1FC058]/10 px-4 py-2 rounded-lg border border-[#1FC058]/20">
                        <Trophy size={16} />
                        <span>REGION: BR ONLY</span>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 size={48} className="text-[#1FC058] animate-spin mb-4" />
                        <p className="text-gray-400 animate-pulse">Cargando torneos...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-red-400 mb-2 font-bold">Error</p>
                        <p className="text-gray-400">{error}</p>
                    </div>
                ) : tournaments.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 border border-white/10 rounded-xl">
                        <Calendar size={48} className="text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">No se encontraron torneos activos o próximos por el momento.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {tournaments.map((tournament, index) => (
                            <TournamentCard key={index} tournament={tournament} index={index} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
