"use client";

import { useEffect, useState } from "react";
import { X, MapPin } from "lucide-react";
import { useI18n } from "@/i18n";

const TEAMMATE_SLOTS: Record<string, number> = { Solo: 0, Duos: 1, Trios: 2, Squads: 3 };

export default function ClaimSpotModal({
    zoneLabel,
    teamSize,
    defaultEpicName,
    saving,
    error,
    onConfirm,
    onClose,
}: {
    zoneLabel: string;
    teamSize: string;
    defaultEpicName: string;
    saving: boolean;
    error: string;
    onConfirm: (epicName: string, teammates: string[]) => void;
    onClose: () => void;
}) {
    const { t } = useI18n();
    const slots = TEAMMATE_SLOTS[teamSize] ?? 0;

    const [epicName, setEpicName] = useState(defaultEpicName);
    const [teammates, setTeammates] = useState<string[]>(() => Array(slots).fill(""));

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const inputClass =
        "w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white placeholder-white/30 outline-none transition-colors focus:border-primary/40";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#08190F] p-6 shadow-2xl">
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1">
                            <MapPin size={13} className="text-primary" />
                            <span className="text-xs font-bold text-primary">{zoneLabel}</span>
                        </div>
                        <h2 className="text-lg font-bold text-white">{t.tournaments.claim}</h2>
                    </div>
                    <button onClick={onClose} className="text-white/50 transition-colors hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <div className="mb-4">
                    <label className="mb-2 block text-sm text-white/70">{t.tournaments.epicName}</label>
                    <input
                        type="text"
                        value={epicName}
                        onChange={e => setEpicName(e.target.value)}
                        className={inputClass}
                        placeholder="Peterbot"
                        autoFocus
                    />
                    <p className="mt-1 text-[11px] text-white/40">{t.tournaments.epicNameHelp}</p>
                </div>

                {slots > 0 && (
                    <div className="mb-2">
                        <label className="mb-2 block text-sm text-white/70">{t.tournaments.teammates}</label>
                        <div className="space-y-2">
                            {Array.from({ length: slots }).map((_, i) => (
                                <input
                                    key={i}
                                    type="text"
                                    value={teammates[i] ?? ""}
                                    onChange={e =>
                                        setTeammates(prev => {
                                            const next = [...prev];
                                            next[i] = e.target.value;
                                            return next;
                                        })
                                    }
                                    className={inputClass}
                                    placeholder={`${t.tournaments.teammates} ${i + 1}`}
                                />
                            ))}
                        </div>
                        <p className="mt-1 text-[11px] text-white/40">{t.tournaments.teammatesHelp}</p>
                    </div>
                )}

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={() => onConfirm(epicName.trim(), teammates.map(n => n.trim()).filter(Boolean))}
                        disabled={saving || !epicName.trim()}
                        className="flex-1 rounded-lg bg-primary px-6 py-3 font-bold text-[#04130A] transition-colors duration-300 hover:bg-[#43E97B] disabled:opacity-50"
                    >
                        {saving ? "..." : t.tournaments.confirm}
                    </button>
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-white/15 px-5 py-3 font-bold text-white transition-colors duration-300 hover:border-white/30 hover:bg-white/5"
                    >
                        {t.tournaments.cancel}
                    </button>
                </div>
            </div>
        </div>
    );
}
