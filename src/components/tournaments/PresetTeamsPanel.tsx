"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Info, Plus, Save, Search, Users, X } from "lucide-react";
import { teammateSlots } from "@/lib/teamFormat";

export interface PresetTeam {
    memberIds: string[];
}

export interface RosterMember {
    discordId: string;
    discordName: string;
    avatarUrl: string;
    epicName: string;
}

const isSnowflake = (v: string) => /^\d{5,25}$/.test(v);

/** How a player reads in the panel: Epic name first, that is what mods match. */
function memberLabel(id: string, roster: RosterMember[]): string {
    const p = roster.find(u => u.discordId === id);
    if (!p) return id;
    return p.epicName || p.discordName || id;
}

function memberSubLabel(id: string, roster: RosterMember[]): string {
    const p = roster.find(u => u.discordId === id);
    if (!p) return "nunca entró a la web";
    return p.epicName && p.discordName ? p.discordName : id;
}

/**
 * One slot of the duo being built: search the roster by Discord or Epic name,
 * or paste a Discord id for somebody who never signed in.
 */
function MemberPicker({
    value,
    onChange,
    roster,
    taken,
    placeholder,
}: {
    value: string;
    onChange: (discordId: string) => void;
    roster: RosterMember[];
    /** Ids already used in another team or in another slot of this one. */
    taken: Set<string>;
    placeholder: string;
}) {
    const [query, setQuery] = useState("");
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

    const needle = query.trim().toLowerCase();
    const matches = useMemo(
        () =>
            roster
                .filter(u => !taken.has(u.discordId))
                .filter(u =>
                    !needle
                        ? true
                        : `${u.discordName} ${u.epicName} ${u.discordId}`.toLowerCase().includes(needle)
                )
                .slice(0, 50),
        [roster, taken, needle]
    );

    if (value) {
        return (
            <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/[0.08] px-3 py-2">
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-white">
                        {memberLabel(value, roster)}
                    </span>
                    <span className="block truncate text-[11px] text-white/40">
                        {memberSubLabel(value, roster)}
                    </span>
                </span>
                <button
                    onClick={() => {
                        onChange("");
                        setQuery("");
                    }}
                    aria-label="Quitar jugador"
                    className="shrink-0 rounded p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                >
                    <X size={14} />
                </button>
            </div>
        );
    }

    const typedId = query.trim();

    return (
        <div ref={boxRef} className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
            <input
                value={query}
                onChange={e => {
                    setQuery(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                placeholder={placeholder}
                autoComplete="off"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2 pl-9 pr-9 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-primary/40"
            />
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                aria-label="Ver jugadores"
                className="absolute right-0 top-0 flex h-full w-9 items-center justify-center text-white/40 transition-colors hover:text-white"
            >
                <ChevronDown size={15} className={open ? "rotate-180" : ""} />
            </button>

            {open && (
                <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-white/10 bg-[#0B1F14] shadow-2xl">
                    {/* Somebody who never signed in is not in the roster, so the raw
                        id has to be accepted - that is the whole point of ids here. */}
                    {isSnowflake(typedId) && !taken.has(typedId) && (
                        <button
                            onClick={() => {
                                onChange(typedId);
                                setOpen(false);
                            }}
                            className="flex w-full items-center gap-2 border-b border-white/10 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06]"
                        >
                            <Plus size={13} className="shrink-0 text-primary" />
                            <span className="truncate text-sm text-white">
                                Usar el ID <span className="font-mono text-primary">{typedId}</span>
                            </span>
                        </button>
                    )}
                    {matches.length === 0 ? (
                        <p className="px-3 py-3 text-[11px] leading-relaxed text-white/40">
                            {taken.size > 0
                                ? "Nadie coincide. Los que ya están en otro dúo no aparecen."
                                : "Nadie coincide con la búsqueda."}
                        </p>
                    ) : (
                        <ul className="py-1">
                            {matches.map(u => (
                                <li key={u.discordId}>
                                    <button
                                        onClick={() => {
                                            onChange(u.discordId);
                                            setOpen(false);
                                        }}
                                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-white/[0.06]"
                                    >
                                        {u.avatarUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={u.avatarUrl} alt="" className="h-6 w-6 shrink-0 rounded-full" />
                                        ) : (
                                            <div className="h-6 w-6 shrink-0 rounded-full bg-white/10" />
                                        )}
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm text-white">
                                                {u.epicName || u.discordName}
                                            </span>
                                            <span className="block truncate text-[11px] text-white/35">
                                                {u.epicName ? u.discordName : "sin nombre de Epic cargado"}
                                            </span>
                                        </span>
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

/**
 * Duos a moderator writes down before the tournament, by Discord id.
 *
 * Once k1ng and fazer are a team here, whichever of them marks a spot marks the
 * other one too - no dropdown at claim time, no half-marked teams, and no way
 * to end up paired with the wrong person because of how a name is spelled.
 */
export default function PresetTeamsPanel({
    value,
    onChange,
    roster,
    teamSize,
    onSave,
    saving,
}: {
    value: PresetTeam[];
    onChange: (teams: PresetTeam[]) => void;
    roster: RosterMember[];
    teamSize: string;
    onSave: () => void;
    saving?: boolean;
}) {
    const size = teammateSlots(teamSize) + 1;
    const [draft, setDraft] = useState<string[]>(() => Array(Math.max(size, 2)).fill(""));

    // Changing the format changes how many players a team has.
    useEffect(() => {
        setDraft(Array(Math.max(size, 2)).fill(""));
    }, [size]);

    // A player in two teams would make "who is k1ng's duo" ambiguous, so anyone
    // already placed disappears from the pickers.
    const usedIds = useMemo(
        () => new Set(value.flatMap(t => t.memberIds)),
        [value]
    );

    const draftReady = draft.filter(Boolean).length === draft.length;

    const addTeam = () => {
        if (!draftReady) return;
        onChange([...value, { memberIds: [...draft] }]);
        setDraft(Array(draft.length).fill(""));
    };

    if (size < 2) {
        return (
            <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/80">
                    <Users size={15} className="text-primary" /> Dúos del torneo
                </h2>
                <p className="flex items-start gap-2 text-xs leading-relaxed text-white/50">
                    <Info size={14} className="mt-0.5 shrink-0 text-primary" />
                    Este torneo está en formato <span className="font-bold text-white">Solo</span>, así que no
                    hay equipos que definir. Cambiá el formato arriba si es de dúos.
                </p>
            </div>
        );
    }

    return (
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/80">
                    <Users size={15} className="text-primary" />
                    {size === 2 ? "Dúos del torneo" : "Equipos del torneo"}
                </h2>
                <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase ${value.length > 0 ? "bg-primary/15 text-primary" : "bg-white/10 text-white/50"
                        }`}
                >
                    {value.length === 0
                        ? "sin equipos"
                        : `${value.length} ${value.length === 1 ? "equipo" : "equipos"}`}
                </span>
            </div>

            <p className="mb-4 text-xs leading-relaxed text-white/50">
                Armá acá los equipos y después nadie elige compañero al marcar el spot: si ponés a k1ng con
                fazer, cuando k1ng se marca queda marcado fazer también, y al revés igual. Estar en un equipo
                ya lo habilita a marcar, aunque no tenga el rol del torneo.
            </p>

            {value.length > 0 && (
                <ul className="mb-4 divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10">
                    {value.map((team, i) => (
                        <li key={i} className="flex items-center justify-between gap-3 px-4 py-2.5">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-white">
                                    {team.memberIds.map(id => memberLabel(id, roster)).join("  +  ")}
                                </p>
                                <p className="truncate font-mono text-[10px] text-white/30">
                                    {team.memberIds.join(" · ")}
                                </p>
                            </div>
                            <button
                                onClick={() => onChange(value.filter((_, j) => j !== i))}
                                aria-label="Borrar equipo"
                                className="shrink-0 rounded-lg border border-red-500/30 px-2.5 py-1.5 text-[11px] font-bold text-red-400 transition-colors hover:bg-red-500/15"
                            >
                                <X size={12} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <p className="mb-3 text-xs font-bold text-white/70">
                    {size === 2 ? "Agregar dúo" : `Agregar equipo de ${size}`}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                    {draft.map((id, i) => (
                        <MemberPicker
                            key={i}
                            value={id}
                            onChange={next =>
                                setDraft(prev => prev.map((v, j) => (j === i ? next : v)))
                            }
                            roster={roster}
                            taken={
                                new Set(
                                    Array.from(usedIds).concat(draft.filter((v, j) => !!v && j !== i))
                                )
                            }
                            placeholder={`Jugador ${i + 1} — nombre o ID de Discord`}
                        />
                    ))}
                </div>
                <button
                    onClick={addTeam}
                    disabled={!draftReady}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-xs font-bold text-white transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-40"
                >
                    <Plus size={14} /> {size === 2 ? "Agregar dúo" : "Agregar equipo"}
                </button>
            </div>

            <button
                onClick={onSave}
                disabled={saving}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-[#04130A] transition-colors hover:bg-[#43E97B] disabled:opacity-50"
            >
                <Save size={15} /> {saving ? "..." : size === 2 ? "Guardar dúos" : "Guardar equipos"}
            </button>
        </div>
    );
}
