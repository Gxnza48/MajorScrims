"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, MapPin, ChevronDown, AlertTriangle, Swords, Users } from "lucide-react";
import { useI18n } from "@/i18n";
import { teammateSlots } from "@/lib/teamFormat";

export interface TeammateOption {
    discordId: string;
    discordName: string;
    epicName: string;
}

const optionLabel = (o: TeammateOption) => o.epicName || o.discordName;

const inputClass =
    "w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white placeholder-white/30 outline-none transition-colors focus:border-primary/40";

/**
 * Free-text field with a dropdown of the players the moderator marked as
 * qualified, so a duo picks their partner from a list instead of guessing how
 * they spell their Epic name - but can still type someone who is not listed.
 */
function TeammatePicker({
    value,
    onChange,
    options,
    placeholder,
    emptyHint,
}: {
    value: string;
    onChange: (value: string) => void;
    options: TeammateOption[];
    placeholder: string;
    emptyHint: string;
}) {
    const [open, setOpen] = useState(false);
    const boxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, [open]);

    const needle = value.trim().toLowerCase();
    const matches = useMemo(() => {
        const list = options.filter(o => optionLabel(o));
        if (!needle) return list;
        const hits = list.filter(o =>
            `${o.epicName} ${o.discordName}`.toLowerCase().includes(needle)
        );
        // An exact pick should still show the rest, or changing it means clearing first.
        return hits.length ? hits : list;
    }, [options, needle]);

    return (
        <div ref={boxRef} className="relative">
            <input
                type="text"
                value={value}
                onChange={e => {
                    onChange(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={e => {
                    // Escape closes the list, not the whole modal.
                    if (e.key === "Escape" && open) {
                        e.stopPropagation();
                        setOpen(false);
                    }
                }}
                className={`${inputClass} pr-10`}
                placeholder={placeholder}
                autoComplete="off"
            />
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                aria-label="Ver jugadores"
                className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-white/40 transition-colors hover:text-white"
            >
                <ChevronDown size={16} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
            </button>

            {open && (
                <div className="absolute z-10 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-white/10 bg-[#0B1F14] shadow-2xl">
                    {matches.length === 0 ? (
                        <p className="px-3 py-3 text-[11px] leading-relaxed text-white/40">{emptyHint}</p>
                    ) : (
                        <ul className="py-1">
                            {matches.map((o, i) => (
                                <li key={`${o.discordId || o.epicName}-${i}`}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onChange(optionLabel(o));
                                            setOpen(false);
                                        }}
                                        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition-colors hover:bg-white/[0.06]"
                                    >
                                        <span className="truncate text-sm text-white">{optionLabel(o)}</span>
                                        {o.discordName && o.epicName && (
                                            <span className="shrink-0 truncate text-[11px] text-white/35">
                                                {o.discordName}
                                            </span>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export default function ClaimSpotModal({
    zoneLabel,
    teamSize,
    defaultEpicName,
    teammateOptions,
    presetTeam,
    isDispute,
    occupiedBy,
    saving,
    error,
    onConfirm,
    onClose,
}: {
    zoneLabel: string;
    teamSize: string;
    defaultEpicName: string;
    teammateOptions: TeammateOption[];
    /** Partners a moderator fixed for this tournament: nothing to pick. */
    presetTeam: TeammateOption[];
    /** The zone is already full: confirming registers a dispute instead. */
    isDispute: boolean;
    occupiedBy: string[];
    saving: boolean;
    error: string;
    onConfirm: (epicName: string, teammates: string[]) => void;
    onClose: () => void;
}) {
    const { t } = useI18n();
    const slots = teammateSlots(teamSize);

    const [epicName, setEpicName] = useState(defaultEpicName);
    const [teammates, setTeammates] = useState<string[]>(() => Array(slots).fill(""));

    const hasPreset = presetTeam.length > 0;

    // In a duos/trios tournament the team takes the spot, so the partner is
    // required: confirming with half a team is what has to be impossible.
    // Unless the moderator already fixed the team - then there is nothing to fill.
    const missingTeammates = hasPreset
        ? 0
        : teammates.slice(0, slots).filter(n => !n.trim()).length;

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
            <div className="my-8 w-full max-w-md rounded-2xl border border-white/10 bg-[#08190F] p-6 shadow-2xl">
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                        <div
                            className={`mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 ${isDispute
                                ? "border-red-500/30 bg-red-500/10"
                                : "border-primary/25 bg-primary/10"
                                }`}
                        >
                            <MapPin size={13} className={isDispute ? "text-red-400" : "text-primary"} />
                            <span className={`text-xs font-bold ${isDispute ? "text-red-400" : "text-primary"}`}>
                                {zoneLabel}
                            </span>
                        </div>
                        <h2 className="text-lg font-bold text-white">
                            {isDispute ? t.tournaments.disputeTitle : t.tournaments.claim}
                        </h2>
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

                {hasPreset ? (
                    <div className="mb-2">
                        <label className="mb-2 block text-sm text-white/70">
                            {presetTeam.length === 1 ? t.tournaments.duo : t.tournaments.teammates}
                        </label>
                        <div className="flex flex-wrap gap-2 rounded-lg border border-primary/25 bg-primary/[0.07] px-4 py-3">
                            <Users size={16} className="mt-0.5 shrink-0 text-primary" />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-white">
                                    {presetTeam.map(o => optionLabel(o) || o.discordId).join(" · ")}
                                </p>
                                <p className="mt-1 text-[11px] leading-relaxed text-white/50">
                                    {t.tournaments.presetTeamHelp}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : slots > 0 && (
                    <div className="mb-2">
                        <label className="mb-2 block text-sm text-white/70">
                            {slots === 1 ? t.tournaments.duo : t.tournaments.teammates}
                            <span className="ml-1 text-primary">*</span>
                        </label>
                        <div className="space-y-2">
                            {Array.from({ length: slots }).map((_, i) => (
                                <TeammatePicker
                                    key={i}
                                    value={teammates[i] ?? ""}
                                    onChange={next =>
                                        setTeammates(prev => {
                                            const copy = [...prev];
                                            copy[i] = next;
                                            return copy;
                                        })
                                    }
                                    options={teammateOptions}
                                    placeholder={
                                        slots === 1
                                            ? t.tournaments.duoPlaceholder
                                            : `${t.tournaments.teammates} ${i + 1}`
                                    }
                                    emptyHint={t.tournaments.teammatePickerEmpty}
                                />
                            ))}
                        </div>
                        <p className="mt-1 text-[11px] text-white/40">
                            {missingTeammates > 0
                                ? slots === 1
                                    ? t.tournaments.duoRequired
                                    : t.tournaments.teammatesRequired
                                : t.tournaments.teammatePickerHelp}
                        </p>
                    </div>
                )}

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={() =>
                            onConfirm(epicName.trim(), teammates.map(n => n.trim()).filter(Boolean))
                        }
                        disabled={saving || !epicName.trim() || missingTeammates > 0}
                        className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-bold transition-colors duration-300 disabled:opacity-50 ${isDispute
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-primary text-[#04130A] hover:bg-[#43E97B]"
                            }`}
                    >
                        {isDispute && <Swords size={16} />}
                        {saving ? "..." : isDispute ? t.tournaments.disputeConfirm : t.tournaments.confirm}
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
