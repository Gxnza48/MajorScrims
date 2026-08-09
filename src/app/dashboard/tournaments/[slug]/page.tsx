"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    ArrowLeft, Plus, Save, Trash2, MapPin, ExternalLink, Loader2, CalendarX, AlertTriangle, Info,
    Trophy, X, Users,
} from "lucide-react";
import DropMap, { MapZone, MapClaim, ZoneEditorPanel, teamLabel } from "@/components/tournaments/DropMap";
import SpotTemplatePanel from "@/components/tournaments/SpotTemplatePanel";
import QualifiedRolesPanel, { QualifiedRole } from "@/components/tournaments/QualifiedRolesPanel";
import PresetTeamsPanel, { PresetTeam } from "@/components/tournaments/PresetTeamsPanel";
import { teammateSlots } from "@/lib/teamFormat";

const TEAM_SIZES = ["Solo", "Duos", "Trios", "Squads"];

interface WindowRow {
    id: string;
    label: string;
    startsAt: string;
    zones: MapZone[];
}

interface PrizeRow {
    place: string;
    prize: string;
}

interface Detail {
    slug: string;
    name: string;
    teamSize: string;
    status: string;
    published: boolean;
    description: string;
    prizePool: string;
    prizes: PrizeRow[];
    qualifiedIds: string[];
    qualifiedRoles: QualifiedRole[];
    presetTeams: PresetTeam[];
    participants: string[];
    windows: WindowRow[];
}

interface RosterUser {
    discordId: string;
    discordName: string;
    avatarUrl: string;
    epicName: string;
    isPro: boolean;
    discordRoles: string[];
}

interface Claim extends MapClaim {
    windowId: string;
}

function toInputValue(iso: string): string {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const inputClass =
    "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-primary/40";

export default function TournamentZonesAdminPage({ params }: { params: { slug: string } }) {
    const { status } = useSession();
    const router = useRouter();

    const [detail, setDetail] = useState<Detail | null>(null);
    const [claims, setClaims] = useState<Claim[]>([]);
    const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
    const [zones, setZones] = useState<MapZone[]>([]);
    const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    // Window editor state (labels + times are saved through the tournament PUT)
    const [windowDrafts, setWindowDrafts] = useState<{ id?: string; label: string; startsAt: string }[]>([]);
    const [savingWindows, setSavingWindows] = useState(false);

    // Public info: format, description and the prize pool table under the map.
    const [teamSize, setTeamSize] = useState("Solo");
    const [description, setDescription] = useState("");
    const [prizePool, setPrizePool] = useState("");
    const [prizes, setPrizes] = useState<PrizeRow[]>([]);
    const [savingInfo, setSavingInfo] = useState(false);

    // Who may claim: a Discord role, and the teams written down by hand. The
    // roster is only the list the team pickers search through.
    const [roster, setRoster] = useState<RosterUser[]>([]);
    const [qualifiedRoles, setQualifiedRoles] = useState<QualifiedRole[]>([]);
    const [savingRoles, setSavingRoles] = useState(false);
    const [presetTeams, setPresetTeams] = useState<PresetTeam[]>([]);
    const [savingTeams, setSavingTeams] = useState(false);

    const load = useCallback(async () => {
        try {
            const res = await fetch(`/api/tournaments/${params.slug}`);
            const data = await res.json();
            if (!data.success) {
                setError(data.error || "Torneo no encontrado.");
                return;
            }
            setDetail(data.tournament);
            setClaims(data.claims);
            setQualifiedRoles(data.tournament.qualifiedRoles ?? []);
            setPresetTeams(data.tournament.presetTeams ?? []);
            setDescription(data.tournament.description ?? "");
            setPrizePool(data.tournament.prizePool ?? "");
            setPrizes(data.tournament.prizes ?? []);
            setTeamSize(data.tournament.teamSize || "Solo");
            setWindowDrafts(
                data.tournament.windows.map((w: WindowRow) => ({
                    id: w.id,
                    label: w.label,
                    startsAt: toInputValue(w.startsAt),
                }))
            );
            setActiveWindowId((prev: string | null) => {
                const next = prev ?? data.tournament.windows[0]?.id ?? null;
                const target = data.tournament.windows.find((w: WindowRow) => w.id === next);
                setZones(target ? target.zones : []);
                return next;
            });
            setDirty(false);
        } catch {
            setError("Error de red.");
        }
    }, [params.slug]);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
        else if (status === "authenticated") load();
    }, [status, router, load]);

    useEffect(() => {
        if (status !== "authenticated") return;
        fetch("/api/roster")
            .then(res => res.json())
            .then(data => data.success && setRoster(data.users))
            .catch(() => { });
    }, [status]);

    const selectWindow = (id: string) => {
        if (dirty && !confirm("Tenés cambios sin guardar en el mapa. ¿Descartarlos?")) return;
        setActiveWindowId(id);
        setZones(detail?.windows.find(w => w.id === id)?.zones ?? []);
        setSelectedZoneId(null);
        setDirty(false);
    };

    const updateZone = (id: string, patch: Partial<MapZone>) => {
        setZones(prev => prev.map(z => (z.id === id ? { ...z, ...patch } : z)));
        setDirty(true);
    };

    const deleteZone = (id: string) => {
        setZones(prev => prev.filter(z => z.id !== id));
        setSelectedZoneId(null);
        setDirty(true);
    };

    const saveZones = async () => {
        if (!activeWindowId) return;
        setSaving(true);
        setError("");
        setNotice("");
        try {
            const res = await fetch(`/api/tournaments/${params.slug}/zones`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    windowId: activeWindowId,
                    // draft ids are dropped so the server mints real ObjectIds
                    zones: zones.map(z => ({
                        id: z.id.startsWith("draft-") ? undefined : z.id,
                        label: z.label,
                        x: z.x,
                        y: z.y,
                        w: z.w,
                        h: z.h,
                        capacity: z.capacity,
                    })),
                }),
            });
            const data = await res.json();
            if (data.success) {
                setDetail(data.tournament);
                setZones(data.tournament.windows.find((w: WindowRow) => w.id === activeWindowId)?.zones ?? []);
                setSelectedZoneId(null);
                setDirty(false);
                setNotice("Spots guardados.");
            } else {
                setError(data.error || "No se pudieron guardar los spots.");
            }
        } catch {
            setError("Error de red.");
        }
        setSaving(false);
    };

    /** One PUT per round: the zones endpoint works on a single window at a time. */
    const applyTemplateToAllRounds = async (templateZones: MapZone[]) => {
        if (!detail) return;
        const payload = templateZones.map(z => ({
            label: z.label,
            x: z.x,
            y: z.y,
            w: z.w,
            h: z.h,
            capacity: z.capacity,
        }));

        for (const w of detail.windows) {
            const res = await fetch(`/api/tournaments/${params.slug}/zones`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ windowId: w.id, zones: payload }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || `No se pudieron guardar los spots de ${w.label}.`);
        }

        await load();
    };

    const removeClaim = async (claim: Claim) => {
        if (!confirm(`¿Sacar a ${teamLabel(claim)} de su spot?`)) return;
        setSaving(true);
        setError("");
        setNotice("");
        try {
            const res = await fetch(`/api/tournaments/${params.slug}/claim`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ claimId: claim.id }),
            });
            const data = await res.json();
            if (data.success) {
                setNotice(`${teamLabel(claim)} quedó fuera del spot.`);
                await load();
            } else {
                setError(data.error || "No se pudo sacar al equipo.");
            }
        } catch {
            setError("Error de red.");
        }
        setSaving(false);
    };

    const saveInfo = async () => {
        setSavingInfo(true);
        setError("");
        setNotice("");
        try {
            const res = await fetch(`/api/tournaments/${params.slug}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    teamSize,
                    description,
                    prizePool,
                    prizes: prizes.filter(p => p.place.trim()),
                }),
            });
            const data = await res.json();
            if (data.success) {
                setDetail(data.tournament);
                setPrizes(data.tournament.prizes ?? []);
                setNotice(
                    teammateSlots(teamSize) > 0
                        ? `Guardado. Al marcar spot cada jugador va a tener que elegir a su ${teammateSlots(teamSize) === 1 ? "dúo" : "equipo"}.`
                        : "Guardado. En formato Solo no se pide compañero al marcar el spot."
                );
            } else {
                setError(data.error || "No se pudo guardar la información.");
            }
        } catch {
            setError("Error de red.");
        }
        setSavingInfo(false);
    };

    const saveWindows = async () => {
        setSavingWindows(true);
        setError("");
        setNotice("");
        try {
            const res = await fetch(`/api/tournaments/${params.slug}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    windows: windowDrafts
                        .filter(w => w.label.trim() && w.startsAt)
                        .map(w => ({ id: w.id, label: w.label, startsAt: new Date(w.startsAt).toISOString() })),
                }),
            });
            const data = await res.json();
            if (data.success) {
                setNotice("Rondas guardadas.");
                setActiveWindowId(null);
                await load();
            } else {
                setError(data.error || "No se pudieron guardar las rondas.");
            }
        } catch {
            setError("Error de red.");
        }
        setSavingWindows(false);
    };

    const saveQualifiedRoles = async () => {
        setSavingRoles(true);
        setError("");
        setNotice("");
        try {
            const res = await fetch(`/api/tournaments/${params.slug}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qualifiedRoles }),
            });
            const data = await res.json();
            if (data.success) {
                setDetail(data.tournament);
                const saved: QualifiedRole[] = data.tournament.qualifiedRoles ?? [];
                setQualifiedRoles(saved);
                setNotice(
                    saved.length > 0
                        ? `Guardado. Puede marcar spot cualquiera con ${saved.map(r => r.roleName || r.roleId).join(", ")}.`
                        : "Sin rol: solo van a poder marcar los jugadores que estén en un equipo."
                );
            } else {
                setError(data.error || "No se pudieron guardar los roles.");
            }
        } catch {
            setError("Error de red.");
        }
        setSavingRoles(false);
    };

    /** The duos panel saves as you edit it, so this both stores and persists. */
    const savePresetTeams = async (teams: PresetTeam[]): Promise<boolean> => {
        setSavingTeams(true);
        setError("");
        setPresetTeams(teams);
        try {
            const res = await fetch(`/api/tournaments/${params.slug}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ presetTeams: teams }),
            });
            const data = await res.json();
            if (data.success) {
                setDetail(data.tournament);
                // The server drops anything invalid, so its answer is the truth.
                setPresetTeams(data.tournament.presetTeams ?? []);
                setSavingTeams(false);
                return true;
            }
            setError(data.error || "No se pudieron guardar los equipos.");
        } catch {
            setError("Error de red.");
        }
        setSavingTeams(false);
        return false;
    };

    if (status === "loading" || !detail) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                {error ? (
                    <p className="text-sm text-red-400">{error}</p>
                ) : (
                    <Loader2 size={40} className="animate-spin text-primary" />
                )}
            </div>
        );
    }

    const selectedZone = zones.find(z => z.id === selectedZoneId) ?? null;
    const windowClaims = claims.filter(c => c.windowId === activeWindowId);

    const roleIdSet = new Set(qualifiedRoles.map(r => r.roleId));
    const roleHolders = roleIdSet.size
        ? roster.filter(u => u.discordRoles.some(id => roleIdSet.has(id))).length
        : 0;

    // Neither way in is set up, which makes this a tournament nobody can play.
    // It used to be impossible to miss inside the qualified-players card; that
    // card is gone, so the warning goes at the top of the page.
    const nobodyCanClaim = qualifiedRoles.length === 0 && presetTeams.length === 0;

    return (
        <div className="min-h-screen text-white">
            <div className="container mx-auto max-w-6xl px-6 py-16">
                <div className="mb-8">
                    <Link
                        href="/dashboard/tournaments"
                        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-primary"
                    >
                        <ArrowLeft size={16} /> Volver a torneos
                    </Link>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-bold text-white md:text-3xl">{detail.name}</h1>
                        <Link
                            href={`/tournaments/${detail.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                        >
                            ver en la web <ExternalLink size={12} />
                        </Link>
                    </div>
                </div>

                {/* The imported templates carry the snapshot's old dates, so they land
                    already finished - which silently blocks every player from claiming. */}
                {nobodyCanClaim && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/[0.08] px-4 py-3">
                        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-400" />
                        <p className="text-sm leading-relaxed text-white/70">
                            <span className="font-bold text-red-400">
                                Nadie puede marcar spot en este torneo todavía.
                            </span>{" "}
                            Elegí abajo el rol de Discord que habilita, o cargá los equipos a mano. Con
                            cualquiera de las dos alcanza.
                        </p>
                    </div>
                )}

                {detail.status === "Completed" && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] px-4 py-3">
                        <CalendarX size={16} className="mt-0.5 shrink-0 text-amber-400" />
                        <p className="text-sm leading-relaxed text-white/70">
                            <span className="font-bold text-amber-400">Este torneo figura como finalizado.</span>{" "}
                            Mientras la fecha de fin esté en el pasado, los jugadores no van a poder marcar su spot
                            (vos sí, porque sos admin). Si es un torneo que todavía se va a jugar, corregí las
                            fechas desde{" "}
                            <Link href="/dashboard/tournaments" className="font-bold text-primary hover:underline">
                                el listado de torneos
                            </Link>
                            .
                        </p>
                    </div>
                )}

                {(error || notice) && (
                    <div
                        className={`mb-6 rounded-lg border px-4 py-3 text-sm ${error
                            ? "border-red-500/20 bg-red-500/10 text-red-400"
                            : "border-primary/20 bg-primary/10 text-primary"
                            }`}
                    >
                        {error || notice}
                    </div>
                )}

                {/* Description + prize pool: both are shown on the public page. */}
                <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                    <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/80">
                        Formato, descripción y premios
                    </h2>

                    {/* The format is what turns the duo picker on: in Solo nobody is
                        asked for a teammate, which reads as "the duo thing is missing". */}
                    <div className="mb-5 flex flex-wrap items-end gap-3">
                        <div className="w-full sm:w-48">
                            <label className="mb-1.5 block text-xs text-white/60">Formato</label>
                            <select
                                value={teamSize}
                                onChange={e => setTeamSize(e.target.value)}
                                className={inputClass}
                            >
                                {TEAM_SIZES.map(s => (
                                    <option key={s} value={s} className="bg-[#0B1F14]">
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <p className="flex items-start gap-1.5 pb-2 text-[11px] leading-relaxed text-white/45 sm:max-w-md">
                            <Users size={13} className="mt-0.5 shrink-0 text-primary" />
                            {teammateSlots(teamSize) > 0
                                ? `Al marcar el spot, cada jugador tiene que elegir a ${teammateSlots(teamSize) === 1 ? "su dúo" : `sus ${teammateSlots(teamSize)} compañeros`} de la lista de clasificados y quedan marcados todos juntos en el mismo spot.`
                                : "En Solo no se pide compañero. Poné Duos para que cada jugador elija a su dúo al marcar el spot."}
                        </p>
                    </div>

                    <label className="mb-1.5 block text-xs text-white/60">
                        Descripción del torneo (se muestra arriba del mapa)
                    </label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={5}
                        maxLength={8000}
                        placeholder={"Formato, horarios, reglas, cómo se juega la final...\nLos saltos de línea se respetan."}
                        className="w-full resize-y rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm leading-relaxed text-white placeholder-white/25 outline-none transition-colors focus:border-primary/40"
                    />
                    <p className="mt-1.5 text-[11px] text-white/40">
                        Para poner un botón con link escribí{" "}
                        <code className="text-primary">{"{Discord}(https://discord.gg/wyVqaAM59J)"}</code> y se
                        muestra como un botón azul que lleva a esa dirección.
                    </p>

                    <div className="mt-5 flex flex-wrap items-end gap-3">
                        <div className="w-full sm:w-64">
                            <label className="mb-1.5 block text-xs text-white/60">
                                Prize pool total (texto libre)
                            </label>
                            <input
                                type="text"
                                value={prizePool}
                                onChange={e => setPrizePool(e.target.value)}
                                className={inputClass}
                                placeholder="R$ 10.000"
                            />
                        </div>
                        <p className="flex items-center gap-1.5 pb-2 text-[11px] text-white/40">
                            <Trophy size={13} className="text-primary" /> La tabla se muestra abajo de todo en el
                            mapa del torneo.
                        </p>
                    </div>

                    <div className="mt-4 space-y-2">
                        {prizes.map((row, i) => (
                            <div key={i} className="flex gap-2">
                                <input
                                    type="text"
                                    value={row.place}
                                    onChange={e =>
                                        setPrizes(prev =>
                                            prev.map((p, j) => (j === i ? { ...p, place: e.target.value } : p))
                                        )
                                    }
                                    className={`${inputClass} sm:w-48`}
                                    placeholder={`${i + 1}°`}
                                />
                                <input
                                    type="text"
                                    value={row.prize}
                                    onChange={e =>
                                        setPrizes(prev =>
                                            prev.map((p, j) => (j === i ? { ...p, prize: e.target.value } : p))
                                        )
                                    }
                                    className={inputClass}
                                    placeholder="R$ 3.000"
                                />
                                <button
                                    onClick={() => setPrizes(prev => prev.filter((_, j) => j !== i))}
                                    aria-label={`Quitar puesto ${i + 1}`}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                        <button
                            onClick={() =>
                                setPrizes(prev => [...prev, { place: `${prev.length + 1}°`, prize: "" }])
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-bold text-white transition-colors hover:border-primary/40"
                        >
                            <Plus size={15} /> Agregar puesto
                        </button>
                        <button
                            onClick={saveInfo}
                            disabled={savingInfo}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-[#04130A] transition-colors hover:bg-[#43E97B] disabled:opacity-50"
                        >
                            <Save size={15} /> {savingInfo ? "..." : "Guardar formato, descripción y premios"}
                        </button>
                    </div>
                </div>

                {/* Windows */}
                <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                    <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/80">Rondas</h2>

                    <div className="space-y-3">
                        {windowDrafts.map((w, i) => (
                            <div key={w.id ?? `new-${i}`} className="flex flex-col gap-3 sm:flex-row">
                                <input
                                    type="text"
                                    value={w.label}
                                    onChange={e =>
                                        setWindowDrafts(prev =>
                                            prev.map((x, j) => (j === i ? { ...x, label: e.target.value } : x))
                                        )
                                    }
                                    className={inputClass}
                                    placeholder="Grupo A"
                                />
                                <input
                                    type="datetime-local"
                                    value={w.startsAt}
                                    onChange={e =>
                                        setWindowDrafts(prev =>
                                            prev.map((x, j) => (j === i ? { ...x, startsAt: e.target.value } : x))
                                        )
                                    }
                                    className={`${inputClass} sm:w-64`}
                                />
                                <button
                                    onClick={() => setWindowDrafts(prev => prev.filter((_, j) => j !== i))}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20"
                                    aria-label="Quitar ronda"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                        <button
                            onClick={() =>
                                setWindowDrafts(prev => [
                                    ...prev,
                                    { label: `Ronda ${prev.length + 1}`, startsAt: toInputValue(new Date().toISOString()) },
                                ])
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-bold text-white transition-colors hover:border-primary/40"
                        >
                            <Plus size={15} /> Agregar ronda
                        </button>
                        <button
                            onClick={saveWindows}
                            disabled={savingWindows}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-[#04130A] transition-colors hover:bg-[#43E97B] disabled:opacity-50"
                        >
                            <Save size={15} /> {savingWindows ? "..." : "Guardar rondas"}
                        </button>
                    </div>
                    <p className="mt-3 text-[11px] text-white/40">
                        Borrar una ronda elimina también sus spots y los reclamos de esa ronda.
                    </p>
                </div>

                {/* Who may claim, way 1: a Discord role created for this tournament */}
                <QualifiedRolesPanel
                    value={qualifiedRoles}
                    onChange={setQualifiedRoles}
                    holders={roleHolders}
                    onSave={saveQualifiedRoles}
                    saving={savingRoles}
                />

                {/* Fixed teams: whoever marks a spot marks their whole team */}
                <PresetTeamsPanel
                    value={presetTeams}
                    onSave={savePresetTeams}
                    roster={roster}
                    teamSize={teamSize}
                    saving={savingTeams}
                />

                {/* Zones */}
                {detail.windows.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-16 text-center">
                        <MapPin size={36} className="mx-auto mb-4 text-primary/60" />
                        <p className="text-sm text-white/60">
                            Creá al menos una ronda para poder marcar los spots en el mapa.
                        </p>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">
                                Spots del mapa
                            </h2>
                            <button
                                onClick={saveZones}
                                disabled={saving || !dirty}
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-[#04130A] transition-colors hover:bg-[#43E97B] disabled:opacity-40"
                            >
                                <Save size={15} /> {saving ? "..." : dirty ? "Guardar spots" : "Sin cambios"}
                            </button>
                        </div>

                        <div className="mb-5 flex flex-wrap gap-2">
                            {detail.windows.map(w => (
                                <button
                                    key={w.id}
                                    onClick={() => selectWindow(w.id)}
                                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${activeWindowId === w.id
                                        ? "bg-primary text-[#04130A]"
                                        : "border border-white/10 text-white/60 hover:border-white/25 hover:text-white"
                                        }`}
                                >
                                    {w.label}
                                </button>
                            ))}
                        </div>

                        <SpotTemplatePanel
                            zones={zones}
                            roundCount={detail.windows.length}
                            busy={saving}
                            onApply={next => {
                                setZones(next);
                                setSelectedZoneId(null);
                                setDirty(true);
                            }}
                            onApplyToAllRounds={applyTemplateToAllRounds}
                        />

                        <p className="mb-4 text-xs text-white/50">
                            Arrastrá sobre el mapa para dibujar un spot. Hacé clic en un spot existente para
                            renombrarlo, cambiarle el cupo o borrarlo.
                        </p>

                        <div className="mx-auto max-w-2xl">
                            <DropMap
                                mode="edit"
                                zones={zones}
                                claims={windowClaims}
                                selectedZoneId={selectedZoneId}
                                onSelectZone={setSelectedZoneId}
                                onZonesChange={next => {
                                    setZones(next);
                                    setDirty(true);
                                }}
                                emptyLabel="Arrastrá sobre el mapa para marcar el primer spot."
                            />
                        </div>

                        {selectedZone && (
                            <div className="mx-auto max-w-2xl">
                                <ZoneEditorPanel
                                    zone={selectedZone}
                                    onChange={patch => updateZone(selectedZone.id, patch)}
                                    onDelete={() => deleteZone(selectedZone.id)}
                                />
                            </div>
                        )}

                        <p className="mt-4 text-center text-xs text-white/40">
                            {zones.length} {zones.length === 1 ? "spot marcado" : "spots marcados"}
                            {windowClaims.length > 0 && ` · ${windowClaims.length} reclamados por jugadores`}
                        </p>

                        {/* Taking a team off a spot: also how a dispute gets resolved. */}
                        {windowClaims.length > 0 && (
                            <div className="mt-5 border-t border-white/10 pt-5">
                                <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/70">
                                    <Users size={14} className="text-primary" /> Equipos anotados en esta ronda (
                                    {windowClaims.length})
                                </h3>
                                <ul className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10">
                                    {windowClaims.map(claim => {
                                        const savedZones =
                                            detail.windows.find(w => w.id === activeWindowId)?.zones ?? [];
                                        const zone = savedZones.find(z => z.id === claim.zoneId);
                                        return (
                                            <li
                                                key={claim.id}
                                                className={`flex items-center justify-between gap-3 px-4 py-2.5 ${claim.disputed ? "bg-red-500/[0.07]" : ""
                                                    }`}
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-white">
                                                        {teamLabel(claim)}
                                                    </p>
                                                    <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/40">
                                                        <span className="truncate">
                                                            {zone?.label ?? "spot borrado"}
                                                        </span>
                                                        {claim.disputed && (
                                                            <span className="shrink-0 rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-black uppercase text-red-400">
                                                                en disputa
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => removeClaim(claim)}
                                                    disabled={saving}
                                                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-red-500/30 px-2.5 py-1.5 text-[11px] font-bold text-red-400 transition-colors hover:bg-red-500/15 disabled:opacity-50"
                                                >
                                                    <X size={12} /> Sacar
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
